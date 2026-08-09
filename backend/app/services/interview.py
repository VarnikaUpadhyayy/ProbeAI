import json
from typing import Any

from sqlalchemy.orm import Session

from app.config import settings
from app.models.pydantic_models import (
    Candidate,
    FeedbackPayload,
    InterviewResponse,
    SessionDetailResponse,
    SessionListResponse,
    SessionSummary,
    TranscriptMessage,
)
from app.models.sqlalchemy_models import (
    ConversationMessage,
    InterviewFeedback,
    InterviewSession,
)
from app.services.candidate_analyzer import analyze_candidate, get_next_planned_day
from app.services.data_loader import get_curriculum
from app.services.feedback import generate_feedback
from app.services.llm import llm_service


class InterviewService:
    def start_interview(
        self,
        db: Session,
        session_id: str,
        candidate: Candidate,
    ) -> InterviewResponse:
        existing = self._get_session(db, session_id)
        if existing:
            if existing.status == "completed":
                return self._completed_response(db, existing)
            last_assistant = self._last_assistant_message(db, session_id)
            if last_assistant:
                return InterviewResponse(reply=last_assistant.message, done=False, score=0)
            return self._generate_first_question(db, existing, candidate)

        analysis = analyze_candidate(candidate)
        first_day = analysis.interview_plan[0] if analysis.interview_plan else 1
        system = llm_service.build_system_prompt(get_curriculum(), analysis, candidate)
        result = llm_service.generate_opening_question(system, first_day)

        session = InterviewSession(
            session_id=session_id,
            candidate_id=candidate.member.id,
            candidate_data=candidate.model_dump_json(),
            status="active",
            questions_asked=1,
            days_covered=json.dumps([first_day]),
            current_day=first_day,
        )
        db.add(session)
        db.add(
            ConversationMessage(
                session_id=session_id,
                role="assistant",
                message=result.reply,
                curriculum_day=result.curriculum_day,
            )
        )
        db.commit()

        # 🔥 Opening question pe score 0 jayega
        return InterviewResponse(reply=result.reply, done=False, score=0)

    def process_turn(
        self,
        db: Session,
        session_id: str,
        user_message: str,
    ) -> InterviewResponse:
        session = self._get_session(db, session_id)
        if not session:
            raise ValueError(f"Session '{session_id}' not found. Start an interview first.")

        if session.status == "completed":
            return self._completed_response(db, session)

        candidate = Candidate.model_validate_json(session.candidate_data)
        analysis = analyze_candidate(candidate)

        self._record_user_message(db, session_id, user_message)
        db.refresh(session)
        conversation = self._build_conversation(db, session_id)
        system = llm_service.build_system_prompt(get_curriculum(), analysis, candidate)

        days_covered = self._parse_days_covered(session)
        if (
            session.questions_asked >= settings.min_questions
            and len(days_covered) >= settings.min_days
        ):
            return self._complete_interview(
                db, session, candidate, analysis, system, conversation
            )
        decision = llm_service.decide_next_turn(
            system=system,
            conversation=conversation,
            current_day=session.current_day,
            questions_asked=session.questions_asked,
            days_covered=days_covered,
            next_planned_day=get_next_planned_day(analysis, days_covered),
            min_questions=settings.min_questions,
            min_days=settings.min_days,
        )

        can_complete = (
            session.questions_asked >= settings.min_questions
            and len(days_covered) >= settings.min_days
        )

        if decision.action == "complete" and can_complete:
            return self._complete_interview(db, session, candidate, analysis, system, conversation)

        def _safe_score(obj: Any) -> int:
            val = getattr(obj, "score", 0)
            return val if val is not None else 0

        score_delta = _safe_score(decision)
        reply_text = decision.reply or "Could you elaborate further on your technical implementation strategy?"
        next_day = decision.curriculum_day or session.current_day or get_next_planned_day(analysis, days_covered) or 1

        self._record_assistant_message(
            db, session_id, reply_text, next_day
        )
        db.refresh(session)
        self._update_session_progress(
            db, session, next_day, increment_questions=True
        )

        # 🔥 Streamlined Single-Call Interview Response
        return InterviewResponse(reply=reply_text, done=False, score=score_delta)

    def get_session_detail(self, db: Session, session_id: str) -> SessionDetailResponse | None:
        session = self._get_session(db, session_id)
        if not session:
            return None

        transcript = [
            TranscriptMessage(
                role=m.role,
                message=m.message,
                curriculum_day=m.curriculum_day,
                timestamp=m.timestamp,
            )
            for m in session.messages
        ]

        feedback = None
        if session.feedback:
            feedback = FeedbackPayload(
                summary=session.feedback.summary,
                strengths=json.loads(session.feedback.strengths),
                gaps=json.loads(session.feedback.gaps),
                next=json.loads(session.feedback.next_steps),
            )

        return SessionDetailResponse(
            sessionId=session.session_id,
            candidateId=session.candidate_id,
            status=session.status,
            questions_asked=session.questions_asked,
            days_covered=self._parse_days_covered(session),
            created_at=session.created_at,
            transcript=transcript,
            feedback=feedback,
        )

    def list_sessions(self, db: Session) -> SessionListResponse:
        sessions = db.query(InterviewSession).order_by(InterviewSession.created_at.desc()).all()
        return SessionListResponse(
            sessions=[
                SessionSummary(
                    sessionId=s.session_id,
                    candidateId=s.candidate_id,
                    status=s.status,
                    created_at=s.created_at,
                )
                for s in sessions
            ]
        )

    def _complete_interview(
        self,
        db: Session,
        session: InterviewSession,
        candidate: Candidate,
        analysis,
        system: str,
        conversation: list[dict[str, str]],
    ) -> InterviewResponse:
        feedback = generate_feedback(system, conversation, candidate, analysis)

        existing_feedback = (
            db.query(InterviewFeedback)
            .filter(InterviewFeedback.session_id == session.session_id)
            .first()
        )
        if not existing_feedback:
            db.add(
                InterviewFeedback(
                    session_id=session.session_id,
                    summary=feedback.summary,
                    strengths=json.dumps(feedback.strengths),
                    gaps=json.dumps(feedback.gaps),
                    next_steps=json.dumps(feedback.next),
                )
            )

        closing = "Interview completed."
        self._record_assistant_message(db, session.session_id, closing, None)
        session.status = "completed"
        db.commit()

        # 🔥 Complete hone par score ki zaroorat nahi
        return InterviewResponse(reply=closing, done=True, feedback=feedback, score=0)

    def _completed_response(
        self, db: Session, session: InterviewSession
    ) -> InterviewResponse:
        feedback_row = (
            db.query(InterviewFeedback)
            .filter(InterviewFeedback.session_id == session.session_id)
            .first()
        )
        feedback = None
        if feedback_row:
            feedback = FeedbackPayload(
                summary=feedback_row.summary,
                strengths=json.loads(feedback_row.strengths),
                gaps=json.loads(feedback_row.gaps),
                next=json.loads(feedback_row.next_steps),
            )
        return InterviewResponse(
            reply="Interview completed.",
            done=True,
            feedback=feedback,
            score=0
        )

    def _generate_first_question(
        self,
        db: Session,
        session: InterviewSession,
        candidate: Candidate,
    ) -> InterviewResponse:
        analysis = analyze_candidate(candidate)
        first_day = analysis.interview_plan[0] if analysis.interview_plan else 1
        system = llm_service.build_system_prompt(get_curriculum(), analysis, candidate)
        result = llm_service.generate_opening_question(system, first_day)
        self._record_assistant_message(
            db, session.session_id, result.reply, result.curriculum_day
        )
        self._update_session_progress(
            db, session, result.curriculum_day, increment_questions=True
        )
        return InterviewResponse(reply=result.reply, done=False, score=0)

    def _get_session(self, db: Session, session_id: str) -> InterviewSession | None:
        return (
            db.query(InterviewSession)
            .filter(InterviewSession.session_id == session_id)
            .first()
        )

    def _parse_days_covered(self, session: InterviewSession) -> list[int]:
        return json.loads(session.days_covered or "[]")

    def _update_session_progress(
        self,
        db: Session,
        session: InterviewSession,
        curriculum_day: int | None,
        *,
        increment_questions: bool = False,
    ) -> None:
        if increment_questions:
            session.questions_asked += 1
        if curriculum_day is not None:
            session.current_day = curriculum_day
            days = self._parse_days_covered(session)
            if curriculum_day not in days:
                days.append(curriculum_day)
                session.days_covered = json.dumps(sorted(days))
        db.commit()

    def _record_user_message(self, db: Session, session_id: str, message: str) -> None:
        db.add(
            ConversationMessage(
                session_id=session_id,
                role="user",
                message=message,
            )
        )
        db.commit()

    def _record_assistant_message(
        self,
        db: Session,
        session_id: str,
        message: str,
        curriculum_day: int | None,
    ) -> None:
        db.add(
            ConversationMessage(
                session_id=session_id,
                role="assistant",
                message=message,
                curriculum_day=curriculum_day,
            )
        )
        db.commit()

    def _build_conversation(self, db: Session, session_id: str) -> list[dict[str, str]]:
        messages = (
            db.query(ConversationMessage)
            .filter(ConversationMessage.session_id == session_id)
            .order_by(ConversationMessage.timestamp)
            .all()
        )
        return [{"role": m.role, "content": m.message} for m in messages]

    def _last_assistant_message(
        self, db: Session, session_id: str
    ) -> ConversationMessage | None:
        return (
            db.query(ConversationMessage)
            .filter(
                ConversationMessage.session_id == session_id,
                ConversationMessage.role == "assistant",
            )
            .order_by(ConversationMessage.timestamp.desc())
            .first()
        )


interview_service = InterviewService()
import json
import re
from typing import Any

from groq import Groq

from app.config import settings
from app.models.pydantic_models import (
    Candidate,
    CandidateAnalysis,
    Curriculum,
    FeedbackPayload,
    LLMFollowUpDecision,
    LLMQuestionResult,
)
from app.services.data_loader import get_curriculum_day


class LLMService:
    def __init__(self) -> None:
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = settings.groq_model

    def _call(
        self,
        system: str,
        messages: list[dict[str, str]],
        max_tokens: int = 150,
        temperature: float = 0.1,
    ) -> str:
        chat_messages = [{"role": "system", "content": system}] + messages
        response = self.client.chat.completions.create(
            model=self.model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=chat_messages,
        )
        return response.choices[0].message.content

    def _parse_json(self, text: str) -> dict[str, Any]:
        text = text.strip()
        fence_match = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
        if fence_match:
            text = fence_match.group(1).strip()
        else:
            json_object_match = re.search(r"(\{.*\})", text, re.DOTALL)
            if json_object_match:
                text = json_object_match.group(1).strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Fallback cleanup for unescaped newlines/ctrl chars if needed
            cleaned = re.sub(r"[\x00-\x1F\x7F]", "", text)
            return json.loads(cleaned)

    def build_system_prompt(
        self,
        curriculum: Curriculum,
        analysis: CandidateAnalysis,
        candidate: Candidate,
    ) -> str:
        weak_summary = "\n".join(
            f"  - Day {d.day}: {d.title} ({d.focus_type}) — {d.reason}"
            for d in analysis.weak_days[:8]
        ) or "  (none identified)"
        strong_summary = "\n".join(
            f"  - Day {d.day}: {d.title} — {d.reason}"
            for d in analysis.strong_days[:8]
        ) or "  (none identified)"

        curriculum_summary = "\n".join(
            f"Day {d.day}: {d.title} [{d.type}] — tools: {', '.join(d.tools[:4])}"
            for d in curriculum.days
        )

        return f"""You are an expert technical interviewer for an AI engineering cohort program.
Conduct a personalized, conversational technical interview tailored to this candidate's progress.

CANDIDATE PROFILE:
- Name: {candidate.member.name}
- Role: {candidate.member.jobRole}
- Experience: {candidate.member.yearsExperience} years
- Education: {candidate.member.education}
- Cohort signals: {candidate.signals.missionsCompleted} missions completed, \
{candidate.signals.missionsFirstTry} first-try passes, {candidate.signals.commitDays} commit days

WEAK AREAS (prioritize probing — skipped missions or multiple attempts):
{weak_summary}

STRONG AREAS (probe depth — passed first try):
{strong_summary}

INTERVIEW PLAN (curriculum days to cover, in order):
{analysis.interview_plan}

FULL CURRICULUM REFERENCE:
{curriculum_summary}

INTERVIEW RULES:
1. Ask ONE clear technical question at a time — conversational but rigorous.
2. STRICT EVALUATION: You MUST critically evaluate the candidate's answer. If it is incorrect, incomplete, gibberish, or off-topic, clearly state that it is wrong and briefly explain why. NEVER praise or accept a wrong answer.
3. SCORING RUBRIC (apply this every single turn, no exceptions): score +8 to +10 only if the answer is technically correct AND reasonably complete; score +1 to +7 for partially correct/vague answers; score -1 to -7 for answers with clear technical errors; score -8 to -10 for answers that are gibberish, completely wrong, off-topic, or say 'I don't know'/skip. Do not default to a positive score — the score must be justified by the actual content of the answer. A polite or confident tone does NOT make an answer correct.
4. Questions must relate to specific curriculum days and the candidate's actual progress.
5. Follow-up questions MUST be dynamically generated from the candidate's previous answer.
6. For weak areas: test foundational understanding and ask them to explain concepts they struggled with.
7. For strong areas: ask deeper, scenario-based questions to validate mastery.
8. Keep replies concise (2-4 sentences for questions, include brief evaluation when appropriate).
9. Do not reveal you are following a script or mention internal scoring.
10. Minimum interview length: 8 questions across at least 4 different curriculum days.
11. Respond ONLY with valid JSON as instructed in each prompt — no extra commentary, no markdown fences unless explicitly part of the JSON string content."""

    def generate_opening_question(
        self,
        system: str,
        first_day: int,
    ) -> LLMQuestionResult:
        day_info = get_curriculum_day(first_day) or {}
        prompt = f"""Start the interview with a warm, professional greeting and your first technical question.

Target curriculum day: {first_day} — {day_info.get('title', 'Unknown')}
Objectives: {json.dumps(day_info.get('objectives', []))}
Tools: {json.dumps(day_info.get('tools', []))}

Respond with JSON only:
{{"reply": "<greeting + first question>", "curriculum_day": {first_day}, "is_follow_up": false, "score": 0}}"""

        raw = self._call(system, [{"role": "user", "content": prompt}])
        data = self._parse_json(raw)
        return LLMQuestionResult.model_validate(data)

    def decide_next_turn(
        self,
        system: str,
        conversation: list[dict[str, str]],
        current_day: int | None,
        questions_asked: int,
        days_covered: list[int],
        next_planned_day: int | None,
        min_questions: int,
        min_days: int,
    ) -> LLMFollowUpDecision:
        days_needed = max(0, min_days - len(days_covered))
        questions_needed = max(0, min_questions - questions_asked)

        prompt = f"""Based on the candidate's latest answer, decide the next interview move.

Current state:
- Questions asked so far: {questions_asked} (minimum required: {min_questions})
- Distinct days covered: {days_covered} (minimum required: {min_days})
- Current topic day: {current_day}
- Next planned day (if switching topics): {next_planned_day}
- Still need {questions_needed} more question(s) and {days_needed} more distinct day(s) before finishing.

Choose ONE action:
- "follow_up": Ask a dynamic follow-up on the SAME day ({current_day}) based specifically on \
what the candidate just said. Use this when their answer needs clarification, has gaps, or \
warrants deeper probing.
- "next_question": Move to a NEW curriculum day and ask a fresh question. \
Use day {next_planned_day if next_planned_day else 'from weak/strong areas not yet covered'}.
- "complete": ONLY if questions_asked >= {min_questions} AND distinct days >= {min_days}. \
Set reply to a brief closing remark thanking them; the system will generate formal feedback separately.

Before choosing a score, first silently judge: is this answer factually/technically correct for the question asked? Base the score strictly on that judgment, not on politeness or effort.

Respond with JSON only:
{{
  "action": "follow_up" | "next_question" | "complete",
  "reply": "<your question or closing remark, null if complete>",
  "curriculum_day": <int day number>,
  "reason": "<brief internal reason>",
  "score": <integer from -10 to +10: +8 to +10 for deep/correct answer, -8 to -10 for wrong/gibberish answer, 0 if they skipped/dodged>
}}"""

        messages = conversation + [{"role": "user", "content": prompt}]
        raw = self._call(system, messages, max_tokens=150, temperature=0.1)
        data = self._parse_json(raw)
        return LLMFollowUpDecision.model_validate(data)

    def generate_question_for_day(
        self,
        system: str,
        conversation: list[dict[str, str]],
        day: int,
    ) -> LLMQuestionResult:
        day_info = get_curriculum_day(day) or {}
        prompt = f"""Ask the next interview question targeting curriculum day {day}.

Day title: {day_info.get('title', 'Unknown')}
Objectives: {json.dumps(day_info.get('objectives', []))}
Tools: {json.dumps(day_info.get('tools', []))}

Critically evaluate their previous answer. If it was wrong, politely correct them. Then ask ONE new technical question.

Before choosing a score, first silently judge: is this answer factually/technically correct for the question asked? Base the score strictly on that judgment, not on politeness or effort.

Respond with JSON only:
{{"reply": "<evaluation/correction + new question>", "curriculum_day": {day}, "is_follow_up": false, "score": <int between -10 and 10 based on answer correctness. 0 if skipped>}}"""

        messages = conversation + [{"role": "user", "content": prompt}]
        raw = self._call(system, messages, max_tokens=350, temperature=0.2)
        data = self._parse_json(raw)
        return LLMQuestionResult.model_validate(data)

    def generate_follow_up(
        self,
        system: str,
        conversation: list[dict[str, str]],
        day: int,
    ) -> LLMQuestionResult:
        day_info = get_curriculum_day(day) or {}
        prompt = f"""Generate a dynamic follow-up question based on the candidate's MOST RECENT answer.

Stay on curriculum day {day}: {day_info.get('title', 'Unknown')}
The follow-up MUST reference something specific they said — not a generic question.

Before choosing a score, first silently judge: is this answer factually/technically correct for the question asked? Base the score strictly on that judgment, not on politeness or effort.

Respond with JSON only:
{{"reply": "<evaluation/correction of their answer + follow-up question>", "curriculum_day": {day}, "is_follow_up": true, "score": <int between -10 and 10 based on answer correctness. 0 if skipped>}}"""

        messages = conversation + [{"role": "user", "content": prompt}]
        raw = self._call(system, messages, max_tokens=350, temperature=0.2)
        data = self._parse_json(raw)
        return LLMQuestionResult.model_validate(data)

    def generate_feedback(
        self,
        system: str,
        conversation: list[dict[str, str]],
        candidate: Candidate,
        analysis: CandidateAnalysis,
    ) -> FeedbackPayload:
        prompt = f"""The technical interview with {candidate.member.name} is complete.
Review the full conversation and produce structured feedback.

Consider their cohort progress:
- Weak areas: {[d.day for d in analysis.weak_days]}
- Strong areas: {[d.day for d in analysis.strong_days]}
- Signals: {candidate.signals.model_dump()}

Respond with JSON only matching this exact schema:
{{
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "gaps": ["<gap 1>", "<gap 2>", ...],
  "next": ["<actionable recommendation 1>", ...]
}}

Provide at least 2 items in strengths, gaps, and next. Be specific and reference curriculum topics discussed."""

        messages = conversation + [{"role": "user", "content": prompt}]
        raw = self._call(system, messages, max_tokens=600, temperature=0.2)
        data = self._parse_json(raw)
        return FeedbackPayload.model_validate(data)


llm_service = LLMService()
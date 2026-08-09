from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, model_validator


class Member(BaseModel):
    id: str
    name: str
    jobRole: str
    yearsExperience: int
    education: str
    status: str = "IN_PROGRESS"


class Mission(BaseModel):
    day: int
    title: str
    passed: bool | None = None
    skipped: bool | None = None
    attempts: int | None = None


class Signals(BaseModel):
    commitDays: int
    missionsCompleted: int
    missionsFirstTry: int


class Candidate(BaseModel):
    member: Member
    missions: list[Mission]
    signals: Signals


class StartInterviewRequest(BaseModel):
    sessionId: str
    candidate: Candidate


class TurnInterviewRequest(BaseModel):
    sessionId: str
    message: str


class InterviewRequest(BaseModel):
    sessionId: str
    candidate: Candidate | None = None
    message: str | None = None

    @model_validator(mode="after")
    def validate_request_type(self) -> "InterviewRequest":
        if self.candidate is not None and self.message is not None:
            raise ValueError("Provide either 'candidate' (start) or 'message' (turn), not both")
        if self.candidate is None and self.message is None:
            raise ValueError("Provide either 'candidate' (start) or 'message' (turn)")
        return self

    def is_start(self) -> bool:
        return self.candidate is not None

    def is_turn(self) -> bool:
        return self.message is not None


class FeedbackPayload(BaseModel):
    summary: str
    strengths: list[str]
    gaps: list[str]
    next: list[str]


class InterviewResponse(BaseModel):
    reply: str
    done: bool
    feedback: FeedbackPayload | None = None


class TranscriptMessage(BaseModel):
    role: str
    message: str
    curriculum_day: int | None = None
    timestamp: datetime


class SessionDetailResponse(BaseModel):
    sessionId: str
    candidateId: str
    status: str
    questions_asked: int
    days_covered: list[int]
    created_at: datetime
    transcript: list[TranscriptMessage]
    feedback: FeedbackPayload | None = None


class SessionSummary(BaseModel):
    sessionId: str
    candidateId: str
    status: str
    created_at: datetime


class SessionListResponse(BaseModel):
    sessions: list[SessionSummary]


class CurriculumDay(BaseModel):
    day: int
    title: str
    type: str
    tools: list[str]
    objectives: list[str]


class CurriculumModule(BaseModel):
    n: int
    title: str
    days: list[int]


class Curriculum(BaseModel):
    cohort: str
    modules: list[CurriculumModule]
    days: list[CurriculumDay]


class DayFocus(BaseModel):
    day: int
    title: str
    focus_type: str
    reason: str
    attempts: int | None = None
    mission_title: str | None = None


class CandidateAnalysis(BaseModel):
    candidate_id: str
    candidate_name: str
    weak_days: list[DayFocus]
    strong_days: list[DayFocus]
    interview_plan: list[int] = Field(default_factory=list)


class LLMQuestionResult(BaseModel):
    reply: str
    curriculum_day: int
    is_follow_up: bool = False


class LLMFollowUpDecision(BaseModel):
    action: str
    reply: str | None = None
    curriculum_day: int | None = None
    reason: str | None = None

class InterviewResponse(BaseModel):
    reply: str
    done: bool
    feedback: FeedbackPayload | None = None
    score: int = 0  # 🔥 Naya field for score calculation

class LLMQuestionResult(BaseModel):
    reply: str
    curriculum_day: int
    is_follow_up: bool = False
    score: int = 0  # 🔥 Naya field

class LLMFollowUpDecision(BaseModel):
    action: str
    reply: str | None = None
    curriculum_day: int | None = None
    reason: str | None = None
    score: int = 0  # 🔥 Naya field
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    candidate_id: Mapped[str] = mapped_column(String(64), index=True)
    candidate_data: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(32), default="active")
    questions_asked: Mapped[int] = mapped_column(Integer, default=0)
    days_covered: Mapped[str] = mapped_column(Text, default="[]")
    current_day: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    messages: Mapped[list["ConversationMessage"]] = relationship(
        back_populates="session",
        order_by="ConversationMessage.timestamp",
        cascade="all, delete-orphan",
    )
    feedback: Mapped["InterviewFeedback | None"] = relationship(
        back_populates="session",
        uselist=False,
        cascade="all, delete-orphan",
    )


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(
        String(128), ForeignKey("interview_sessions.session_id"), index=True
    )
    role: Mapped[str] = mapped_column(String(16))
    message: Mapped[str] = mapped_column(Text)
    curriculum_day: Mapped[int | None] = mapped_column(Integer, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session: Mapped["InterviewSession"] = relationship(back_populates="messages")


class InterviewFeedback(Base):
    __tablename__ = "interview_feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(
        String(128), ForeignKey("interview_sessions.session_id"), unique=True, index=True
    )
    summary: Mapped[str] = mapped_column(Text)
    strengths: Mapped[str] = mapped_column(Text)
    gaps: Mapped[str] = mapped_column(Text)
    next_steps: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session: Mapped["InterviewSession"] = relationship(back_populates="feedback")

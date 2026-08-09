from fastapi import APIRouter, Depends, HTTPException
from groq import APIError, AuthenticationError, RateLimitError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.pydantic_models import (
    InterviewRequest,
    InterviewResponse,
    SessionDetailResponse,
    SessionListResponse,
)
from app.services.interview import interview_service

router = APIRouter(prefix="/api/interview", tags=["interview"])


def _ensure_api_key() -> None:
    if not settings.groq_api_key:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY is not configured. Set it in .env and restart the server.",
        )


@router.post("", response_model=InterviewResponse)
def interview_turn(
    body: InterviewRequest,
    db: Session = Depends(get_db),
) -> InterviewResponse:
    _ensure_api_key()
    try:
        if body.is_start():
            return interview_service.start_interview(db, body.sessionId, body.candidate)  # type: ignore[arg-type]

        return interview_service.process_turn(db, body.sessionId, body.message)  # type: ignore[arg-type]
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except AuthenticationError as exc:
        raise HTTPException(status_code=401, detail="Invalid Groq API key") from exc
    except RateLimitError as exc:
        raise HTTPException(status_code=429, detail=f"Groq rate limit: {exc}") from exc
    except APIError as exc:
        raise HTTPException(status_code=502, detail=f"LLM API error: {exc}") from exc


@router.get("", response_model=SessionListResponse)
def list_interviews(db: Session = Depends(get_db)) -> SessionListResponse:
    return interview_service.list_sessions(db)


@router.get("/{session_id}", response_model=SessionDetailResponse)
def get_interview(
    session_id: str,
    db: Session = Depends(get_db),
) -> SessionDetailResponse:
    detail = interview_service.get_session_detail(db, session_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    return detail
from app.models.pydantic_models import Candidate, CandidateAnalysis, FeedbackPayload
from app.services.llm import llm_service


def generate_feedback(
    system: str,
    conversation: list[dict[str, str]],
    candidate: Candidate,
    analysis: CandidateAnalysis,
) -> FeedbackPayload:
    return llm_service.generate_feedback(system, conversation, candidate, analysis)

import json
from pathlib import Path

from app.config import BASE_DIR
from app.models.pydantic_models import Candidate, Curriculum

_candidates: list[Candidate] = []
_curriculum: Curriculum | None = None
_candidates_by_id: dict[str, Candidate] = {}
_curriculum_days_by_number: dict[int, dict] = {}


def load_data() -> None:
    global _candidates, _curriculum, _candidates_by_id, _curriculum_days_by_number

    curriculum_path = BASE_DIR / "curriculum.json"
    candidates_path = BASE_DIR / "candidates.json"

    with curriculum_path.open(encoding="utf-8") as f:
        curriculum_data = json.load(f)
    _curriculum = Curriculum.model_validate(curriculum_data)
    _curriculum_days_by_number = {day.day: day.model_dump() for day in _curriculum.days}

    with candidates_path.open(encoding="utf-8") as f:
        candidates_data = json.load(f)
    _candidates = [Candidate.model_validate(c) for c in candidates_data["candidates"]]
    _candidates_by_id = {c.member.id: c for c in _candidates}


def get_curriculum() -> Curriculum:
    if _curriculum is None:
        raise RuntimeError("Curriculum not loaded")
    return _curriculum


def get_curriculum_day(day: int) -> dict | None:
    return _curriculum_days_by_number.get(day)


def get_candidates() -> list[Candidate]:
    return _candidates


def get_candidate_by_id(candidate_id: str) -> Candidate | None:
    return _candidates_by_id.get(candidate_id)

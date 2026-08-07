from app.models.pydantic_models import Candidate, CandidateAnalysis, DayFocus
from app.services.data_loader import get_curriculum_day


def analyze_candidate(candidate: Candidate) -> CandidateAnalysis:
    weak_days: list[DayFocus] = []
    strong_days: list[DayFocus] = []

    for mission in candidate.missions:
        day_info = get_curriculum_day(mission.day)
        title = day_info["title"] if day_info else mission.title

        if mission.skipped:
            weak_days.append(
                DayFocus(
                    day=mission.day,
                    title=title,
                    focus_type="skipped",
                    reason="Mission was skipped — probe understanding and practical exposure.",
                    mission_title=mission.title,
                )
            )
        elif mission.attempts and mission.attempts >= 3:
            weak_days.append(
                DayFocus(
                    day=mission.day,
                    title=title,
                    focus_type="struggle",
                    reason=f"Required {mission.attempts} attempts — likely knowledge gap.",
                    attempts=mission.attempts,
                    mission_title=mission.title,
                )
            )
        elif mission.passed and mission.attempts == 1:
            strong_days.append(
                DayFocus(
                    day=mission.day,
                    title=title,
                    focus_type="strength",
                    reason="Passed on first try — probe depth and real-world application.",
                    attempts=1,
                    mission_title=mission.title,
                )
            )

    weak_days.sort(key=lambda d: (d.focus_type != "skipped", -(d.attempts or 0)))
    strong_days.sort(key=lambda d: d.day)

    interview_plan = _build_interview_plan(weak_days, strong_days)

    return CandidateAnalysis(
        candidate_id=candidate.member.id,
        candidate_name=candidate.member.name,
        weak_days=weak_days,
        strong_days=strong_days,
        interview_plan=interview_plan,
    )


def _build_interview_plan(weak_days: list[DayFocus], strong_days: list[DayFocus]) -> list[int]:
    """Build an ordered list of curriculum days to cover (min 4 distinct days)."""
    plan: list[int] = []

    for day_focus in weak_days:
        if day_focus.day not in plan:
            plan.append(day_focus.day)

    for day_focus in strong_days:
        if day_focus.day not in plan:
            plan.append(day_focus.day)

    if len(plan) < 4:
        for day_focus in weak_days + strong_days:
            if day_focus.day not in plan:
                plan.append(day_focus.day)
            if len(plan) >= 4:
                break

    return plan


def get_next_planned_day(analysis: CandidateAnalysis, days_covered: list[int]) -> int | None:
    for day in analysis.interview_plan:
        if day not in days_covered:
            return day

    for day_focus in analysis.weak_days + analysis.strong_days:
        if day_focus.day not in days_covered:
            return day_focus.day

    return None

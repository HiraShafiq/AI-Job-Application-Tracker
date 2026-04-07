from __future__ import annotations

from collections import Counter
from datetime import date
from typing import Iterable

TRACKED_SKILLS = [
    "python", "sql", "react", "javascript", "node", "aws", "docker", "fastapi",
    "api", "product", "analytics", "communication", "power bi", "tableau", "snowflake"
]

STATUS_ORDER = ["Wishlist", "Applied", "Interview", "Offer", "Rejected"]


def tokenize_skills(text: str) -> list[str]:
    lower_text = (text or "").lower()
    return [skill for skill in TRACKED_SKILLS if skill in lower_text]


def fit_score(job_description: str, user_skills: str) -> tuple[int, list[str], list[str]]:
    needed = tokenize_skills(job_description)
    user_skill_set = {s.strip().lower() for s in user_skills.split(",") if s.strip()}
    matched = [skill for skill in needed if skill in user_skill_set]
    missing = [skill for skill in needed if skill not in user_skill_set]

    if not needed:
        return 78, [], []

    score = int((len(matched) / max(1, len(needed))) * 100)
    boosted = min(98, max(52, score + 18))
    return boosted, matched[:5], missing[:5]


def ghost_risk(job) -> str:
    if job.status not in {"Applied", "Interview"}:
        return "Low"
    if not job.date_applied:
        return "Low"
    days_since = (date.today() - job.date_applied).days
    if days_since >= 14 and not job.next_action_date:
        return "High"
    if days_since >= 7:
        return "Medium"
    return "Low"


def suggested_follow_up(job) -> str:
    risk = ghost_risk(job)
    if risk == "High":
        return f"Send a follow-up today for {job.company}. Your application may be cooling off."
    if risk == "Medium":
        return f"Prepare a follow-up note for {job.company} within the next 48 hours."
    if job.status == "Wishlist":
        return f"Tailor your resume and apply to {job.company} during your next focused session."
    return f"Keep momentum on {job.company} by updating notes and preparing the next step."


def application_momentum(jobs: Iterable, weekly_goal: int) -> dict:
    jobs = list(jobs)
    today = date.today()
    applied_this_week = sum(1 for job in jobs if job.date_applied and (today - job.date_applied).days <= 7)
    interviews = sum(1 for job in jobs if job.status == "Interview")
    offers = sum(1 for job in jobs if job.status == "Offer")
    streak = min(7, applied_this_week + interviews)
    completion = round((applied_this_week / max(1, weekly_goal)) * 100)
    return {
        "applied_this_week": applied_this_week,
        "weekly_goal": weekly_goal,
        "completion": min(completion, 100),
        "streak": streak,
        "interviews": interviews,
        "offers": offers,
    }


def best_window(energy_window: str, count_open_jobs: int) -> str:
    windows = {
        "Morning": "8:00 AM to 10:30 AM",
        "Afternoon": "1:00 PM to 3:00 PM",
        "Evening": "6:00 PM to 8:00 PM",
    }
    chosen = windows.get(energy_window, "8:00 AM to 10:30 AM")
    if count_open_jobs > 8:
        return f"{chosen}, start with starred jobs first and time-box each application to 25 minutes."
    return f"{chosen}, perfect for your next focused application sprint."


def wins_wall(jobs: Iterable) -> list[str]:
    messages = []
    offers = sum(1 for job in jobs if job.status == "Offer")
    interviews = sum(1 for job in jobs if job.status == "Interview")
    starred = sum(1 for job in jobs if job.is_starred)

    if offers:
        messages.append(f"You already created {offers} offer moment{'s' if offers != 1 else ''}. Keep pressing forward.")
    if interviews:
        messages.append(f"{interviews} active interview pipeline{'s' if interviews != 1 else ''} means your profile is resonating.")
    if starred:
        messages.append(f"You identified {starred} dream roles. Staying intentional is your edge.")
    if not messages:
        messages.append("Momentum starts with one strong application. Your next submission can shift everything.")
    return messages


def funnel_breakdown(jobs: Iterable) -> dict:
    counts = Counter(job.status for job in jobs)
    return {status: counts.get(status, 0) for status in STATUS_ORDER}

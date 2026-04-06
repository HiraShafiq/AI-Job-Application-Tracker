from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class JobBase(BaseModel):
    company: str = Field(..., min_length=1)
    role: str = Field(..., min_length=1)
    location: str = "Remote"
    status: str = "Wishlist"
    salary_range: str = ""
    source: str = "LinkedIn"
    job_url: str = ""
    job_description: str = ""
    notes: str = ""
    priority: int = 3
    energy_fit: str = "High Focus"
    confidence_level: int = 5
    date_saved: date | None = None
    date_applied: Optional[date] = None
    next_action_date: Optional[date] = None
    is_starred: bool = False


class JobCreate(JobBase):
    pass


class JobUpdate(JobBase):
    pass


class JobOut(JobBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserSettingsBase(BaseModel):
    user_name: str = "Future CEO"
    weekly_goal: int = 10
    top_skills: str = "Python, SQL, React, AWS, Product Thinking"
    motivation_style: str = "Bold"
    energy_window: str = "Morning"


class UserSettingsOut(UserSettingsBase):
    id: int

    class Config:
        from_attributes = True

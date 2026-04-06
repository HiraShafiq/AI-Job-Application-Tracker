from datetime import date, datetime
from sqlalchemy import Boolean, Date, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base


class JobApplication(Base):
    __tablename__ = "job_applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    company: Mapped[str] = mapped_column(String(120), nullable=False)
    role: Mapped[str] = mapped_column(String(150), nullable=False)
    location: Mapped[str] = mapped_column(String(120), default="Remote")
    status: Mapped[str] = mapped_column(String(50), default="Wishlist")
    salary_range: Mapped[str] = mapped_column(String(80), default="")
    source: Mapped[str] = mapped_column(String(80), default="LinkedIn")
    job_url: Mapped[str] = mapped_column(String(255), default="")
    job_description: Mapped[str] = mapped_column(Text, default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    priority: Mapped[int] = mapped_column(Integer, default=3)
    energy_fit: Mapped[str] = mapped_column(String(40), default="High Focus")
    confidence_level: Mapped[int] = mapped_column(Integer, default=5)
    date_saved: Mapped[date] = mapped_column(Date, default=date.today)
    date_applied: Mapped[date | None] = mapped_column(Date, nullable=True)
    next_action_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_starred: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_name: Mapped[str] = mapped_column(String(80), default="Future CEO")
    weekly_goal: Mapped[int] = mapped_column(Integer, default=10)
    top_skills: Mapped[str] = mapped_column(Text, default="Python, SQL, React, AWS, Product Thinking")
    motivation_style: Mapped[str] = mapped_column(String(50), default="Bold")
    energy_window: Mapped[str] = mapped_column(String(50), default="Morning")

from datetime import date, timedelta
from sqlalchemy.orm import Session
from . import models


def seed_if_empty(db: Session) -> None:
    if db.query(models.JobApplication).first():
        return

    seed_jobs = [
        models.JobApplication(
            company="Stripe",
            role="Product Manager: New Grad Accelerator",
            location="San Francisco, CA",
            status="Applied",
            salary_range="$120k - $145k",
            source="Company Site",
            priority=5,
            energy_fit="Morning",
            confidence_level=8,
            date_saved=date.today() - timedelta(days=8),
            date_applied=date.today() - timedelta(days=5),
            next_action_date=date.today() + timedelta(days=2),
            is_starred=True,
            job_description="Build user-focused products with AI, analytics, product thinking, communication, and API understanding.",
            notes="Tailored resume and PM story ready."
        ),
        models.JobApplication(
            company="IXL Learning",
            role="Associate Product Manager",
            location="San Mateo, CA",
            status="Interview",
            salary_range="$105k - $130k",
            source="LinkedIn",
            priority=4,
            energy_fit="Afternoon",
            confidence_level=7,
            date_saved=date.today() - timedelta(days=12),
            date_applied=date.today() - timedelta(days=10),
            next_action_date=date.today() + timedelta(days=1),
            job_description="Own product features, analyze user behavior, communicate clearly, and partner cross-functionally.",
            notes="Prepare product sense examples."
        ),
        models.JobApplication(
            company="Micron",
            role="Software Engineer",
            location="Remote",
            status="Wishlist",
            salary_range="$110k+",
            source="Referral",
            priority=5,
            energy_fit="Morning",
            confidence_level=6,
            date_saved=date.today() - timedelta(days=1),
            job_description="React, JavaScript, Python, Node.js, AWS, CI/CD, scalable systems, Git, communication.",
            notes="Create one more SWE project before applying.",
            is_starred=True,
        ),
    ]
    db.add_all(seed_jobs)

    if not db.query(models.UserSettings).first():
        db.add(
            models.UserSettings(
                user_name="Hira",
                weekly_goal=10,
                top_skills="Python, SQL, React, JavaScript, AWS, Product Thinking, FastAPI, Power BI",
                motivation_style="Bold",
                energy_window="Morning",
            )
        )
    db.commit()

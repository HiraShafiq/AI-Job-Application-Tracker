from datetime import date
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import insights, models, schemas
from .database import Base, SessionLocal, engine
from .seed import seed_if_empty

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Job Application Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def startup() -> None:
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "date": str(date.today())}


@app.get("/jobs", response_model=list[schemas.JobOut])
def list_jobs(db: Session = Depends(get_db)):
    return db.query(models.JobApplication).order_by(models.JobApplication.priority.desc(), models.JobApplication.created_at.desc()).all()


@app.post("/jobs", response_model=schemas.JobOut)
def create_job(payload: schemas.JobCreate, db: Session = Depends(get_db)):
    job = models.JobApplication(**payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@app.put("/jobs/{job_id}", response_model=schemas.JobOut)
def update_job(job_id: int, payload: schemas.JobUpdate, db: Session = Depends(get_db)):
    job = db.query(models.JobApplication).filter(models.JobApplication.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    for key, value in payload.model_dump().items():
        setattr(job, key, value)
    db.commit()
    db.refresh(job)
    return job


@app.delete("/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.JobApplication).filter(models.JobApplication.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": "Deleted successfully"}


@app.get("/settings", response_model=schemas.UserSettingsOut)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(models.UserSettings).first()
    if not settings:
        settings = models.UserSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@app.put("/settings", response_model=schemas.UserSettingsOut)
def update_settings(payload: schemas.UserSettingsBase, db: Session = Depends(get_db)):
    settings = db.query(models.UserSettings).first()
    if not settings:
        settings = models.UserSettings(**payload.model_dump())
        db.add(settings)
    else:
        for key, value in payload.model_dump().items():
            setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings


@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    jobs = db.query(models.JobApplication).all()
    settings = db.query(models.UserSettings).first() or models.UserSettings()

    cards = []
    for job in jobs:
        score, matched, missing = insights.fit_score(job.job_description, settings.top_skills)
        cards.append(
            {
                "id": job.id,
                "company": job.company,
                "role": job.role,
                "status": job.status,
                "priority": job.priority,
                "fit_score": score,
                "ghost_risk": insights.ghost_risk(job),
                "matched_skills": matched,
                "missing_skills": missing,
                "follow_up": insights.suggested_follow_up(job),
                "confidence_level": job.confidence_level,
            }
        )

    momentum = insights.application_momentum(jobs, settings.weekly_goal)
    funnel = insights.funnel_breakdown(jobs)
    planner = insights.best_window(settings.energy_window, len(jobs))

    return {
        "momentum": momentum,
        "funnel": funnel,
        "planner": planner,
        "wins_wall": insights.wins_wall(jobs),
        "highlight_jobs": sorted(cards, key=lambda item: (item["fit_score"], item["priority"]), reverse=True)[:5],
        "confidence_average": round(sum(job.confidence_level for job in jobs) / max(1, len(jobs)), 1),
    }

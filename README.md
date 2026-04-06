# AI Job Application Tracker

A full-stack portfolio project built for software engineering and product-minded roles. It combines a visually attractive React frontend with a FastAPI backend, SQLite persistence, analytics, and differentiated features designed to make job applying feel motivating instead of draining.

## Why this project stands out

Most job trackers stop at CRUD. This one adds product thinking and behavioral design:

- **Momentum Engine**: tracks weekly application progress, streaks, confidence, and active pipeline health
- **Ghost Risk Detector**: flags applications that likely need a follow-up now
- **Skill Gap Mirror**: compares pasted job descriptions against the user's skills to show fit score, matched skills, and missing skills
- **Energy Window Planner**: recommends the best time block for focused job applications based on the user's preferred energy window
- **Wins Wall**: keeps emotional momentum high with confidence-building progress messages

## Tech stack

### Frontend
- React
- Vite
- Recharts
- Custom CSS with a premium, high-energy UI

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- CORS middleware

## Features

- Create, edit, delete, and organize job applications
- Track jobs across Wishlist, Applied, Interview, Offer, and Rejected stages
- Add notes, links, salary ranges, next action dates, energy fit, confidence, and star dream roles
- Personalized dashboard with funnel analytics and status breakdown charts
- Highlight jobs based on fit score, urgency, and follow-up timing
- User settings for weekly goals, top skills, energy window, and motivation style
- Seed data included so the app looks complete immediately after setup

## Project structure

```text
ai-job-application-tracker/
├── backend/
│   ├── app/
│   │   ├── database.py
│   │   ├── insights.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── seed.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Run locally

### 1. Start the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

On Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will run at `http://127.0.0.1:8000`.

### 2. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://127.0.0.1:5173` and proxy API calls to the backend.

## API endpoints

- `GET /jobs`
- `POST /jobs`
- `PUT /jobs/{job_id}`
- `DELETE /jobs/{job_id}`
- `GET /dashboard`
- `GET /settings`
- `PUT /settings`
- `GET /health`

## Resume-friendly bullets

- Built a full-stack job application tracker using React, FastAPI, SQLAlchemy, and SQLite, implementing analytics, personalized dashboards, and differentiated workflow features.
- Designed a behavior-focused product experience with a momentum engine, ghost-risk follow-up detection, and skill-gap scoring to help users apply more consistently.
- Developed a RESTful backend and responsive frontend, creating end-to-end CRUD flows, data visualizations, seeded data, and modular business-logic services.

## Honest positioning for interviews

This project includes AI-style recommendations using local scoring and business logic, not an external LLM. That keeps the product fast, explainable, and demo-friendly. It is designed so a real AI service could be added later for resume tailoring, outreach drafts, or smarter job matching.

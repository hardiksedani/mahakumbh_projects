# KumbhRakshak

**AI-Powered Kumbh Safety, Incident Detection, Social Intelligence & Decision Support Platform**

For the Nashik–Trimbakeshwar Kumbh Mela command centre.

## Problem

Large religious gatherings like Kumbh Mela generate massive multi-source data: CCTV feeds, crowd sensors, social media claims, official reports, and shelter/transport pressure. Command centres need to answer: *What is happening? Where? How serious? Is it getting worse? Can social claims be verified?*

## Solution

KumbhRakshak is a **decision-support layer** (not autonomous emergency response) that:

- Detects incidents from camera AI (crowd, fire, medical, accident, security)
- Ingests social intelligence via adapter architecture (mock feed for demo)
- Clusters similar reports into single incidents
- Verifies claims against ground camera evidence
- Forecasts crowd pressure and shelter overflow
- Scores risk with explainable formulas
- Recommends actions via LLM (from structured facts only)
- Broadcasts real-time updates via WebSockets

## Architecture

```
Camera/Social/Simulation → AI Modules (Vision, NLP, Embeddings, Forecast, Risk)
    → Firebase Firestore → FastAPI → WebSockets → Next.js Command Centre
```

**Database:** Firebase Firestore (with in-memory fallback for local demo without credentials)

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- Redis (optional, for Celery workers)

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cp ../.env.example ../.env
# Default: FIREBASE_USE_MEMORY=true (no Firebase account needed)

cd ..
python scripts/seed_data.py
cd backend
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### 3. Docker

```bash
cp .env.example .env
docker compose up --build
```

## Firebase Setup (Production)

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Download service account JSON → save as `firebase-service-account.json`
4. Update `.env`:

```env
FIREBASE_USE_MEMORY=false
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

5. Re-run seed: `python scripts/seed_data.py`

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@kumbhrakshak.gov.in | admin123 | ADMIN |
| commander@kumbhrakshak.gov.in | commander123 | COMMANDER |

## Demo Flow

1. Open Dashboard — view KPIs, map, incidents
2. Go to **Simulation** → click **Start Major Snan**
3. Watch timeline: crowd rise → social reports → fire event → verification
4. Use **Verify Reel** to test claim verification
5. Use inject buttons for fire, crowd, misinformation scenarios

See [docs/demo-script.md](docs/demo-script.md) for full narrative.

## API

- Swagger: http://localhost:8000/docs
- Health: http://localhost:8000/health
- DB Health: http://localhost:8000/health/db

## Testing

```bash
cd backend
pytest tests/ -v
```

## What Is Real vs Simulated

| Component | Status |
|-----------|--------|
| FastAPI backend | **Real** |
| Firebase Firestore | **Real** (or in-memory fallback) |
| Next.js dashboard | **Real** |
| YOLO object detection | **Real** (when camera pipeline runs) |
| Risk scoring engine | **Real** |
| Crowd forecasting (XGBoost) | **Real** (simulated historical data) |
| Embeddings (sentence-transformers) | **Real** |
| Verification engine | **Real** |
| Mock LLM (no OpenAI key) | **Simulated** NLP |
| Instagram/social APIs | **Mocked** (MockInstagramAdapter) |
| Live Kumbh CCTV | **Simulated** camera streams |
| Emergency dispatch | **Recommendations only** — human confirmation required |
| SMS/email alerts | **Mock** (dashboard + WebSocket only) |

## Limitations

- No unrestricted social media scraping (adapter architecture by design)
- Fire/smoke detection uses heuristic MVP, not production-grade model
- Person-down uses temporal heuristics, not medical diagnosis
- In-memory mode resets on server restart
- pgvector replaced by in-app cosine similarity on stored embeddings

## Project Structure

```
backend/          FastAPI + AI modules + Firebase layer
frontend/         Next.js command centre dashboard
scripts/          seed_data.py, run_simulation.py
docs/             architecture.md, demo-script.md
docker-compose.yml
```

## License

Hackathon / educational project.

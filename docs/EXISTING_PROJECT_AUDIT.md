# KumbhRakshak Existing Project Audit

**Document:** `docs/EXISTING_PROJECT_AUDIT.md`  
**Date:** September 2026  
**Auditor:** KumbhRakshak Engineering Team  
**Subject:** Full Architectural, Algorithmic, Database, and UI Baseline Audit

---

## 1. Executive Summary of Audit

The existing repository `mahakumbh_projects` contains a working prototype titled **KumbhRakshak**. It combines a Next.js 16 frontend with a Python 3.12 FastAPI backend, using Google Cloud Firestore (with in-memory fallback), WebSockets, OpenCV/heuristic models, sentence-transformers, and mock social data.

The project has established a strong foundation in several core areas:
- WebSocket event propagation (`/ws/incidents`, `/ws/cameras`, `/ws/alerts`, `/ws/crowd`)
- 16-step simulated diurnal scenario for major snan drills
- Initial multi-category risk calculation heuristic
- HTML5 Canvas radar map visualization
- Ground camera evidence cross-checking prototype
- Topic 10 Social Media Intelligence prototypes (Rumor detection, Sentiment pulse, Multilingual studio)

However, significant architectural gaps exist that prevent it from being a credible, government-grade AI safety intelligence platform:
1. **Coupling to Firestore & In-Memory Storage**: Lacks enterprise relational/spatial persistence (PostgreSQL/PostGIS/pgvector) with clean repository abstractions.
2. **Simplified AI Vision & Analytics**: Vision models are largely heuristic (HSV color masks for fire/smoke, dummy person counts) rather than multi-model pipelines with byte-tracking, spatial density, optical flow, pose-fall detection, and OCR.
3. **Monolithic Backend Execution**: Background processing lacks a proper Redis/Celery queue abstraction for video inference and ASR/VLM execution.
4. **Data Sourcing Disclaimers & Provenance**: Need rigorous demarcation of simulated vs. live data, avoidance of claims of unrestricted platform scraping, and clear environment modes (`DEMO_MODE=true`, `PRODUCTION_MODE=false`).
5. **UI & Command Centre Layout**: Needs transition from a single-page/multi-tab app to a complete GovTech command centre layout with left sidebar, live map layers, camera inspector, social triage console, creator watchlist, incident graph, and executive view.

---

## 2. Current Architecture Inventory

### 2.1 Backend Structure (`backend/app/`)
* **API Layer**:
  - `api/routes.py`: Auth login/me, dashboard KPIs, cameras (list, detail, events), incidents (list, detail, patch), shelters, response units (list, nearest), dispatch (recommend, confirm), alerts, predictions.
  - `api/social_sim_routes.py`: Social post ingest/analyze/list, verify URL, sentiment pulse, counter-messaging, multilingual generation, verification analyze/get, zones, simulation controls (start, stop, reset, status, inject events).
* **AI Modules (`app/ai/`)**:
  - `vision/event_engine.py`: `FireSmokeDetector` (HSV color mask + temporal deque), `CrowdAnalyticsEngine` (heuristic density & growth rate).
  - `verification/engine.py`: `VerificationEngine` (camera distance geofencing + keyword matching), `IncidentClusteringEngine` (SentenceTransformer cosine similarity).
  - `risk/scoring_engine.py`: 10-factor weighted linear combination with Snan mode boost.
  - `forecasting/crowd_forecast.py`: Simulated quadratic surge curve or XGBoost fallback.
  - `providers/`: Base class, mock LLM provider, mock vision LLM provider, sentence-transformers embedding provider, Whisper/EasyOCR stubs.
* **Database & Storage (`app/db/`)**:
  - `firestore.py`: `FirestoreDB` wrapper connecting to Google Cloud Firestore or falling back to in-memory dictionary store (`MemoryStore`).
  - `document_models.py`: Helper factories creating schema-less Python dictionaries with UUIDs and ISO timestamps.
* **Services & Simulation (`app/services/`, `app/simulation/`)**:
  - `core_services.py`: `IncidentService`, `ResponseService`, `ShelterService`, `AlertService`.
  - `social_service.py`: Claim extraction, geocoding for Nashik landmarks, sentiment pulse calculation.
  - `social_adapters.py`: `MockInstagramAdapter` (10 hardcoded mock posts), `OfficialFeedAdapter`.
  - `simulation/engine.py`: 16-step TIMELINE state machine with fire, crowd surge, and rumor injection.

### 2.2 Frontend Structure (`frontend/`)
* **Framework**: Next.js 16.3.2 with Turbopack, React 18.3, Tailwind CSS 3, Lucide Icons, Recharts 2.13.
* **Pages**:
  - `/` (Dashboard): KPI cards, MapView canvas, incident list, patrol alerts, LostPersonRadar, social debunker card, CommandCopilot drawer.
  - `/verify` (10.1 Rumor Scanner): Preset rumors, verification evidence card, 4-language counter-messaging.
  - `/sentiment` (10.2 Sentiment & Pulse): Public mood cards, emerging crises list with deploy action, 24h Recharts timeline, regional influx cards.
  - `/broadcast` (10.3 Multilingual Studio): Topic presets, 4-language generation for X/WhatsApp/Instagram, simulated publish.
  - `/cameras`: CCTV camera grid with status badges.
  - `/incidents` & `/incidents/[id]`: Incident list and detail views.
  - `/social`: Mock social media stream with status filter buttons.
  - `/simulation`: Snan simulator timeline with injection buttons.
  - `/video-guide`: Teleprompter and scene selector for demo video recordings.
* **Components**:
  - `MapView.tsx`: HTML5 Canvas custom circular radar sweep rendering camera markers and incidents.
  - `CameraVisionModal.tsx`: Simulated CCTV video feed with synthetic YOLO bounding boxes and motion graphs.
  - `CommandCopilot.tsx`: Floating slide-out chat drawer with predefined command chips.
  - `LostPersonRadar.tsx`: Attribute-based missing person registration with simulated camera detections.
  - `ui.tsx`: Top header navigation and severity/risk badges.
* **Data Layer (`frontend/lib/api.ts`)**:
  - Central `api<T>()` fetch client with comprehensive offline fallback data for every endpoint.

---

## 3. What is Functional vs. What is Simulated

| Feature | Current State | Mechanism | Upgrade Target |
|---|---|---|---|
| **API Server** | Functional | FastAPI ASGI on port 8000 | Add API v1 versioning, SQLAlchemy repo layer, clean pagination |
| **WebSocket Events** | Functional | Native Starlette WebSockets | Add Redis pub/sub channel multiplexing |
| **Simulation Engine** | Functional | 16-step async generator state machine | Add speed control (0.5x-5x), pause, branching scenarios |
| **Claim Verification** | Partially Functional | Haversine + keyword match against camera records | Add Multi-Camera Evidence Fusion formula, VLM verification, OCR verification |
| **CCTV Detection** | Simulated | Canvas drawing & HSV mask heuristic | Configurable multi-model registry (YOLOv8, Optical Flow, ByteTrack, Pose, Fire/Smoke) |
| **Social Ingestion** | Simulated | `MockInstagramAdapter` (10 posts) | Source adapter abstraction (`SocialSourceAdapter`), user submission, two-stage triage |
| **Crowd Forecasting** | Simulated | Heuristic polynomial curve | Trained ML model (XGBoost/LightGBM) with synthetic feature dataset |
| **Database** | Simulated/Memory | Firestore / `MemoryStore` | Clean repository pattern with PostgreSQL/PostGIS/pgvector + fallback |
| **Authentication** | Partially Functional | JWT bearer token verification | RBAC roles (ADMIN, COMMANDER, ANALYST, VIEWER), audit log tracking |

---

## 4. Technical Debt & Current Problems

1. **Tight Coupling to Firestore Schema**:
   - `backend/app/db/firestore.py` and `document_models.py` assume document key-value semantics.
   - Filtering syntax relies on tuple queries `[("field", "==", val)]`.
   - Solution: Create an abstract `Repository` interface with `PostgreSQLRepository` (SQLAlchemy/PostGIS) and `DemoRepository` (in-memory) implementation.
2. **Missing PostGIS Spatial Operations**:
   - Camera and resource proximity is currently computed via Euclidean/Haversine Python functions in memory.
   - Solution: Support PostGIS geometry queries (`ST_DWithin`, `ST_Distance`) with Python haversine fallback.
3. **No Background Worker Queue**:
   - Heavy operations (video decoding, frame sampling, Whisper transcription) currently run synchronously or in basic async tasks, risking event loop blocking.
   - Solution: Redis + Celery worker task definitions for asynchronous video processing.
4. **Lack of Model Registry and Performance Metrics**:
   - Model parameters are hardcoded in `model_config.yaml` without runtime status, latencies, memory footprint, or enabling/disabling capabilities.
   - Solution: Build `app/ai/model_registry/` with YAML definitions, model metadata, latency tracking, and an `/models` UI page.
5. **No Two-Stage Social Triage**:
   - Ingestion tries to run full extraction on all mock posts.
   - Solution: Implement Stage 1 (metadata/keyword/embedding filter) + Stage 2 (deep NLP/OCR/VLM analysis) to address the "Lakhs of Reels" problem.
6. **No Incident Graph or Evidence Matrix**:
   - Incident view shows flat attributes without an explicit visual evidence chain (Social Claim -> Camera Event -> Corroboration -> Incident -> Risk -> Action).
7. **Frontend Navigation Overcrowded**:
   - Top nav has 7+ items in a single horizontal bar without a proper Command Centre sidebar, layers toggle, or full-screen presentation mode.

---

## 5. Security & Privacy Audit

1. **Social Scraping Disclaimers**: Must explicitly state that private Instagram accounts are never scraped; authorized APIs, licensed feeds, and voluntary user submissions are used.
2. **Facial Recognition Privacy**: The lost person module must strictly operate on clothing, approximate age, and visual attributes; any facial recognition must be explicitly flagged as a future restricted integration requiring police authorization.
3. **Synthetic Data Provenance**: Every demo card, simulated camera feed, and synthetic KPI must carry visible `DEMO / SIMULATED DATA` badges when running in `DEMO_MODE=true`.

---

## 6. Proposed Upgrade Path

1. **Phase 1-4**: Establish Product Positioning, Environment Modes (`DEMO_MODE`), Repository Abstraction (PostgreSQL/SQLAlchemy + in-memory fallback), and Deployment Topology.
2. **Phase 5-12**: Build Multi-Model AI Architecture, Model Registry (`model_registry.yaml`, `/models` UI), Event-Driven Camera Pipeline, Temporal Validation, and Multi-Camera Evidence Fusion.
3. **Phase 13-25**: Build Two-Stage Social Triage, Creator Watchlist, Unknown User Submission Portal, Recycled Video Detection, and Evidence Matrix.
4. **Phase 26-35**: Upgrade Crowd Analytics, XGBoost Forecasting, Major Snan High Alert Mode, Shelter & Transport Pressure, Risk Scoring, and Human-in-the-Loop Decision Support.
5. **Phase 36-50**: Build Professional Command Centre UI (Sidebar, Mapbox/Canvas layered map, Camera Inspector, Incident Graph, AI Copilot).
6. **Phase 51-65**: Upgrade Simulation Engine with 11 scenarios and speed controls, Presentation Mode, Video Recording Mode (`/demo/video-mode`), and graceful degradation.
7. **Phase 66-96**: Deliver complete documentation suite, architecture diagrams (Mermaid), and comprehensive automated test suites.

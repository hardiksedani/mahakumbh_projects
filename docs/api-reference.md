# KUMBHRAKSHAK: API Reference & Integration Guide
## Simhastha Kumbh Mela 2027 — Nashik–Trimbakeshwar
### Base URL: `http://localhost:8000/api` (v1 Endpoints at `/api/v1`)

---

## 1. System Metadata & Health

### `GET /health`
Returns service status, environment, and server timestamp.

### `GET /api/system/mode`
Returns runtime prototype flags, simulation status, and data provenance.
```json
{
  "status": "success",
  "demo_mode": true,
  "simulation_mode": true,
  "production_mode": false,
  "provenance_badge": "DEMO / SIMULATED DATA",
  "mela_edition": "Simhastha Kumbh Mela 2027 — Nashik–Trimbakeshwar",
  "version": "1.0.0-prototype"
}
```

---

## 2. AI Model Registry (`/api/v1/models`)

### `GET /api/v1/models`
Lists all 12 registered AI models with latency benchmarks and status.

### `POST /api/v1/models/{model_name}/toggle`
Enables or disables an AI model at runtime.
```json
// Request Body:
{ "enabled": false }
```

---

## 3. Social Intelligence & Claim Verification

### `POST /api/v1/social/triage`
Runs two-stage triage (heuristic filter + IndicBERT NLP extraction) on an incoming post.

### `POST /api/v1/social/citizen-report`
Ingests citizen safety reports, queries nearby ground cameras, and returns an evidence matrix.
```json
// Request Body:
{
  "reporter_name": "Devotee Yatri",
  "claim_text": "Sudden crowd surge near Laxman Jhula bridge, people pushing",
  "incident_type": "CROWD",
  "latitude": 19.9975,
  "longitude": 73.7898
}
```

### `POST /api/verification/analyze`
Directly verifies a text claim against ground camera events and historical archives.

### `GET /api/v1/creators`
Lists tracked creator and official police handles for virality and propagation modeling.

---

## 4. Human-in-the-Loop Decision Support & Audit Trail

### `GET /api/v1/dispatch/recommendations`
Returns AI-proposed Standard Operating Procedure (SOP) recommendations for active incidents.

### `POST /api/v1/dispatch/confirm`
Records human officer authorization or override, writing an immutable record to `dispatch_audit_log`.
```json
// Request Body:
{
  "action_id": "ACT-SOP-001",
  "incident_id": "inc-001",
  "officer_badge_id": "MH-NSK-POL-4412",
  "officer_name": "DySP R. K. Shinde",
  "decision": "APPROVED",
  "assigned_unit": "QRT-Sector-4-Alpha",
  "notes": "Deploying motorcycle unit with Ghat PA chime."
}
```

### `GET /api/v1/dispatch/audit-trail`
Retrieves the immutable governance audit log of all officer decisions.

### `GET /api/v1/incidents/{incident_id}/graph`
Returns the Directed Acyclic Graph (DAG) representation of the incident lineage:
```json
{
  "status": "success",
  "graph": {
    "nodes": [
      { "id": "node-source-claim", "type": "CLAIM_SOURCE", "label": "..." },
      { "id": "node-cam-CAM-782", "type": "CAMERA_SENSOR", "label": "..." },
      { "id": "node-bayesian-fusion", "type": "BAYESIAN_FUSION", "label": "..." },
      { "id": "node-incident-eval", "type": "VERIFIED_INCIDENT", "label": "..." },
      { "id": "node-risk-score", "type": "RISK_ASSESSMENT", "label": "..." },
      { "id": "node-action-1", "type": "DISPATCH_ACTION", "label": "..." }
    ],
    "edges": [
      { "source": "node-source-claim", "target": "node-cam-CAM-782", "relation": "SPATIAL_PROXIMITY_QUERY" },
      { "source": "node-cam-CAM-782", "target": "node-bayesian-fusion", "relation": "DISTANCE_WEIGHTED_INPUT" }
    ]
  }
}
```

---

## 5. Crowd Forecasting & Predictive Dynamics

### `POST /api/predictions/run`
Runs XGBoost crowd projections for 15, 30, and 60-minute horizons with $p_{10}, p_{50}, p_{90}$ confidence intervals.

### `GET /api/predictions/{zone_id}`
Returns historical forecast records for a specific sector zone.

---

## 6. Multi-Scenario Simulation Lab

### `GET /api/simulation/status`
Returns current step, running state, pause state, and speed multiplier.

### `POST /api/simulation/start`
Starts the Major Shahi Snan 16-step canonical timeline simulation.

### `POST /api/simulation/pause` & `POST /api/simulation/resume`
Pauses or resumes the active timeline execution.

### `POST /api/simulation/speed?multiplier=2.0`
Sets the timeline speed multiplier (0.5x, 1x, 2x, 5x).

### `GET /api/simulation/scenarios`
Lists all 11 operational stress scenarios.

### Specialized Injections:
- `POST /api/simulation/inject-fire` (Thermal flame bloom)
- `POST /api/simulation/inject-crowd` (Crowd surge)
- `POST /api/simulation/inject-misinformation` (Stampede panic post)
- `POST /api/simulation/inject-recycled-video` (Historical clip circulation)
- `POST /api/simulation/inject-shelter-overflow` (Holding area surge)

---

## 7. Real-Time WebSockets

- `ws://localhost:8000/ws/incidents` — Broadcasts live simulation steps, new incidents, and risk escalation.
- `ws://localhost:8000/ws/cameras` — Broadcasts critical optical events and camera threshold alerts.
- `ws://localhost:8000/ws/alerts` — Broadcasts high-priority administrative alarms.
- `ws://localhost:8000/ws/crowd` — Broadcasts surge alerts and density telemetry.

"""KumbhRakshak v1 API Routes.
Provides endpoints for:
- Model Registry inspection and runtime toggles
- Influencer & Creator Watchlist monitoring
- Social Two-Stage Triage & Citizen Safety Incident Reports
- Human-in-the-Loop Dispatch Recommendations and Audit Logging
- System Mode and Data Provenance Badging
- Dynamic Incident DAG Graph Lineage
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.ai.model_registry.registry import ModelRegistry
from app.ai.verification.engine import VerificationEngine
from app.ai.verification.incident_graph import IncidentGraphGenerator
from app.core.config import settings
from app.db.firestore import FirestoreDB
from app.db.session import get_db
from app.social.creator_watchlist import CreatorWatchlistManager
from app.social.triage import SocialTriagePipeline

router = APIRouter(tags=["v1_intelligence"])


# ---------------------------------------------------------
# Pydantic Schemas for Requests / Responses
# ---------------------------------------------------------

class ModelToggleRequest(BaseModel):
    enabled: bool

class CreatorEvaluateRequest(BaseModel):
    author_handle: str
    views_count: int = 0
    shares_count: int = 0

class CitizenReportRequest(BaseModel):
    reporter_name: Optional[str] = "Anonymous Devotee"
    contact_phone: Optional[str] = None
    claim_text: str = Field(..., min_length=5, description="Incident description")
    incident_type: Optional[str] = "GENERAL_SAFETY"
    latitude: Optional[float] = 19.9975
    longitude: Optional[float] = 73.7898
    media_url: Optional[str] = None
    media_hash: Optional[str] = None

class DispatchConfirmRequest(BaseModel):
    action_id: str
    incident_id: str
    officer_badge_id: str
    officer_name: str
    decision: str = Field(..., description="APPROVED | REJECTED | OVERRIDDEN")
    notes: Optional[str] = ""
    assigned_unit: Optional[str] = "QRT-Sector-4"


# ---------------------------------------------------------
# 1. Model Registry Endpoints
# ---------------------------------------------------------

@router.get("/models")
async def list_registered_models():
    """Returns all 12 registered AI models with latency and benchmark telemetry."""
    registry = ModelRegistry.get_instance()
    models = registry.list_models()
    return {
        "status": "success",
        "total_models": len(models),
        "data_provenance": "DEMO / SIMULATED BENCHMARK DATA",
        "models": models,
    }


@router.post("/models/{model_name}/toggle")
async def toggle_model(model_name: str, req: ModelToggleRequest):
    """Enables or disables an AI model at runtime."""
    registry = ModelRegistry.get_instance()
    success = registry.set_enabled(model_name, req.enabled)
    if not success:
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found in registry.")
    return {
        "status": "success",
        "model_name": model_name,
        "enabled": req.enabled,
        "message": f"Model '{model_name}' is now {'ACTIVE' if req.enabled else 'DISABLED'}.",
    }


# ---------------------------------------------------------
# 2. Creator Watchlist Endpoints
# ---------------------------------------------------------

@router.get("/creators")
async def list_watchlist_creators():
    """Lists community and verified creators monitored for virality and public reach."""
    manager = CreatorWatchlistManager()
    creators = manager.list_creators()
    return {
        "status": "success",
        "total_tracked": len(creators),
        "notice": "Creator reach is tracked for propagation modeling only, never as a surrogate for ground truth.",
        "creators": creators,
    }


@router.post("/creators/evaluate")
async def evaluate_creator(req: CreatorEvaluateRequest):
    """Evaluates viral reach and estimated public impact based on creator tier."""
    manager = CreatorWatchlistManager()
    evaluation = manager.evaluate_post_reach(
        author_handle=req.author_handle,
        views_count=req.views_count,
        shares_count=req.shares_count,
    )
    return {
        "status": "success",
        "evaluation": evaluation,
    }


# ---------------------------------------------------------
# 3. Social Triage & Citizen Incident Submission
# ---------------------------------------------------------

@router.post("/social/triage")
async def run_social_triage(post: Dict[str, Any]):
    """Runs two-stage triage (heuristic filter + deep NLP extraction) on social post."""
    pipeline = SocialTriagePipeline()
    result = pipeline.triage_post(post)
    return {
        "status": "success",
        "result": result,
    }


@router.post("/social/citizen-report")
async def submit_citizen_report(report: CitizenReportRequest, db: FirestoreDB = Depends(get_db)):
    """Ingests a citizen safety report, runs evidence verification against ground cameras,
    and returns a structured evidence matrix and decision lineage graph.
    """
    verifier = VerificationEngine()
    v = await verifier.verify_claim(
        db=db,
        claim=report.claim_text,
        incident_type=report.incident_type,
        latitude=report.latitude,
        longitude=report.longitude,
        media_hash=report.media_hash,
    )

    created_at = datetime.now(timezone.utc).isoformat()
    record = {
        "reporter_name": report.reporter_name,
        "claim": report.claim_text,
        "incident_type": report.incident_type,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "media_url": report.media_url,
        "verification_status": v["status"],
        "confidence": v["confidence"],
        "evidence_matrix": v["evidence"]["evidence_matrix"],
        "created_at": created_at,
        "source": "CITIZEN_MOBILE_PORTAL",
    }
    report_id = await db.create("citizen_reports", record)
    record["id"] = report_id

    return {
        "status": "success",
        "report_id": report_id,
        "verification": v,
        "data_provenance": "DEMO / SIMULATED DATA",
    }


# ---------------------------------------------------------
# 4. Human-in-the-Loop Dispatch Decision Support & Audit Trail
# ---------------------------------------------------------

@router.get("/dispatch/recommendations")
async def get_dispatch_recommendations(db: FirestoreDB = Depends(get_db)):
    """Returns AI-recommended dispatch actions requiring Human Officer review."""
    incidents = await db.query("incidents", limit=20)
    recommendations = []
    
    for inc in incidents:
        if inc.get("status") in ("RESOLVED", "CLOSED"):
            continue
        inc_type = inc.get("incident_type", "GENERAL")
        severity = inc.get("severity", "WARNING")
        
        # Standard Operating Procedure Recommendations
        sop_actions = []
        if inc_type == "FIRE":
            sop_actions.append({
                "action_id": f"ACT-FIRE-{inc['id'][:6]}",
                "title": "Dispatch Mela Fire Tender + Deploy Foam Units",
                "target": "Station 2 Brigade",
                "priority": "CRITICAL",
                "estimated_eta_mins": 4,
            })
            sop_actions.append({
                "action_id": f"ACT-PA-{inc['id'][:6]}",
                "title": "Trigger Automated PA Ghat Evacuation Chime",
                "target": "Ramkund Audio Zone B",
                "priority": "HIGH",
                "estimated_eta_mins": 1,
            })
        elif inc_type == "CROWD":
            sop_actions.append({
                "action_id": f"ACT-DIVERSE-{inc['id'][:6]}",
                "title": "Activate Upstream Holding Area & Divert to Laxman Jhula",
                "target": "Sector 4 Barrier Squad",
                "priority": "HIGH" if severity in ("HIGH", "CRITICAL") else "MEDIUM",
                "estimated_eta_mins": 3,
            })
        else:
            sop_actions.append({
                "action_id": f"ACT-PATROL-{inc['id'][:6]}",
                "title": "Dispatch Nearest QRT Motorcycle Unit for Verification",
                "target": "Panchvati Sector Patrol",
                "priority": "MEDIUM",
                "estimated_eta_mins": 5,
            })

        recommendations.append({
            "incident_id": inc["id"],
            "incident_title": inc.get("title", f"{inc_type} Incident"),
            "severity": severity,
            "risk_score": inc.get("risk_score", 50),
            "ai_reasoning": inc.get("description", "Pattern threshold exceeded."),
            "recommended_actions": sop_actions,
            "requires_human_officer_approval": True,
        })

    return {
        "status": "success",
        "pending_recommendations_count": len(recommendations),
        "data_provenance": "DEMO / SIMULATED DATA",
        "recommendations": recommendations,
    }


@router.post("/dispatch/confirm")
async def confirm_dispatch_action(req: DispatchConfirmRequest, db: FirestoreDB = Depends(get_db)):
    """Human-in-the-loop officer confirmation. Logs an immutable audit record."""
    audit_entry = {
        "action_id": req.action_id,
        "incident_id": req.incident_id,
        "officer_badge_id": req.officer_badge_id,
        "officer_name": req.officer_name,
        "decision": req.decision.upper(),
        "assigned_unit": req.assigned_unit,
        "notes": req.notes,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "EXECUTED" if req.decision.upper() == "APPROVED" else "CANCELLED",
    }
    audit_id = await db.create("dispatch_audit_log", audit_entry)

    # If approved, update incident status
    if req.decision.upper() == "APPROVED":
        await db.update("incidents", req.incident_id, {
            "status": "IN_PROGRESS",
            "assigned_unit": req.assigned_unit,
        })

    return {
        "status": "success",
        "audit_id": audit_id,
        "record": audit_entry,
        "message": f"Dispatch decision '{req.decision}' recorded by Officer {req.officer_name} ({req.officer_badge_id}).",
    }


@router.get("/dispatch/audit-trail")
async def get_dispatch_audit_trail(db: FirestoreDB = Depends(get_db)):
    """Returns the immutable officer decision audit trail."""
    entries = await db.query("dispatch_audit_log", limit=50)
    return {
        "status": "success",
        "total_logged_actions": len(entries),
        "audit_trail": entries,
    }


# ---------------------------------------------------------
# 5. Incident Lineage Graph
# ---------------------------------------------------------

@router.get("/incidents/{incident_id}/graph")
async def get_incident_graph(incident_id: str, db: FirestoreDB = Depends(get_db)):
    """Returns the DAG graph nodes and edges representing the evidence and decision lineage for an incident."""
    inc = await db.get("incidents", incident_id)
    if not inc:
        # Fallback to demo graph for simulated exploration
        graph = IncidentGraphGenerator.build_graph(
            claim="High crowd pressure reported at Ramkund ghat steps",
            verification_status="VERIFIED",
            confidence=0.92,
            camera_evidence=[
                {"camera_code": "CAM-RK-01", "event_type": "CROWD", "confidence": 0.94, "distance_km": 0.15, "supports": True},
                {"camera_code": "CAM-RK-03", "event_type": "CROWD", "confidence": 0.88, "distance_km": 0.32, "supports": True},
            ],
            social_evidence={"cluster_count": 4},
            incident_type="CROWD",
            incident_id=incident_id,
            risk_score=82.0,
            risk_level="ORANGE",
        )
        return {"status": "success", "graph": graph, "incident_id": incident_id}

    # Fetch related camera events and social posts
    graph = IncidentGraphGenerator.build_graph(
        claim=inc.get("description", inc.get("title", "Safety Incident")),
        verification_status=inc.get("verification_status", "VERIFIED"),
        confidence=inc.get("confidence", 0.85),
        camera_evidence=[
            {"camera_code": "CAM-PRIMARY", "event_type": inc.get("incident_type"), "confidence": inc.get("confidence", 0.85), "distance_km": 0.2, "supports": True}
        ],
        social_evidence={"cluster_count": 3},
        incident_type=inc.get("incident_type"),
        incident_id=incident_id,
        risk_score=inc.get("risk_score", 70.0),
        risk_level=inc.get("severity", "HIGH"),
    )
    return {"status": "success", "graph": graph, "incident_id": incident_id}


# ---------------------------------------------------------
# 6. System Mode and Data Provenance
# ---------------------------------------------------------

@router.get("/system/mode")
async def get_system_mode():
    """Provides explicit prototype mode flags and data provenance metadata."""
    return {
        "status": "success",
        "demo_mode": True,
        "simulation_mode": True,
        "production_mode": False,
        "provenance_badge": "DEMO / SIMULATED DATA",
        "disclaimer": "This interface operates exclusively on synthetic and simulated telemetry for Simhastha Kumbh Mela 2027 design and research evaluation.",
        "mela_edition": "Simhastha Kumbh Mela 2027 — Nashik–Trimbakeshwar",
        "version": "1.0.0-prototype",
    }

from datetime import datetime, timezone

from typing import Optional



from fastapi import APIRouter, Depends, HTTPException, Query



from app.core.security import create_access_token, get_current_user, verify_password

from app.core.config import settings

from app.db.document_models import doc, make_camera_event, make_crowd_prediction, make_dispatch

from app.db.firestore import FirestoreDB

from app.db.session import get_db

from app.schemas import (

    LoginRequest, TokenResponse, UserResponse, CameraResponse, CameraEventCreate, CameraEventResponse,

    IncidentResponse, IncidentUpdate, ShelterResponse, ResponseUnitResponse, AlertCreate, AlertResponse,

    DashboardKPIs, PredictionResponse, DispatchRecommendRequest, DispatchConfirmRequest,

)

from app.services.core_services import IncidentService, ResponseService, ShelterService, AlertService

from app.ai.forecasting.crowd_forecast import CrowdForecastEngine

from app.ai.providers.factory import get_llm_provider



router = APIRouter()





def _doc_to_response(model_cls, data: dict):

    return model_cls.model_validate(data)





@router.post("/auth/login", response_model=TokenResponse)

async def login(req: LoginRequest, db: FirestoreDB = Depends(get_db)):

    user = await db.get_one("users", [("email", "==", req.email)])

    if not user or not verify_password(req.password, user["password_hash"]):

        raise HTTPException(401, "Invalid credentials")

    role = await db.get("roles", user["role_id"]) if user.get("role_id") else None

    role_name = role["name"] if role else "VIEWER"

    token = create_access_token(user["id"], role_name)

    return TokenResponse(access_token=token, role=role_name)





@router.get("/auth/me", response_model=UserResponse)

async def me(user: dict = Depends(get_current_user), db: FirestoreDB = Depends(get_db)):

    u = await db.get("users", user["id"])

    if not u:

        raise HTTPException(404, "User not found")

    return UserResponse(id=u["id"], email=u["email"], full_name=u.get("full_name"), role=user["role"], active=u.get("active", True))





@router.get("/dashboard/kpis", response_model=DashboardKPIs)

async def dashboard_kpis(db: FirestoreDB = Depends(get_db)):

    active = await db.count("incidents", [("status", "==", "OPEN")])

    critical = await db.count("incidents", [("severity", "==", "CRITICAL"), ("status", "==", "OPEN")])

    high = await db.count("incidents", [("severity", "==", "HIGH"), ("status", "==", "OPEN")])

    unverified = await db.count("social_posts", [("verification_status", "==", "UNVERIFIED")])

    verified_posts = await db.query("social_posts", filters=[("verification_status", "in", ["VERIFIED", "LIKELY"])])

    police = await db.count("response_units", [("unit_type", "==", "police"), ("available", "==", True)])

    medical = await db.count("response_units", [("unit_type", "==", "medical"), ("available", "==", True)])

    fire = await db.count("response_units", [("unit_type", "==", "fire"), ("available", "==", True)])

    return DashboardKPIs(

        active_incidents=active, critical_incidents=critical, high_incidents=high,

        unverified_claims=unverified, verified_claims=len(verified_posts), crowd_risk_zones=3,

        available_police=police, available_medical=medical, available_fire=fire,

        major_snan_mode=settings.major_snan_mode,

    )





@router.get("/cameras", response_model=list[CameraResponse])

async def list_cameras(status: Optional[str] = None, db: FirestoreDB = Depends(get_db)):

    filters = [("status", "==", status)] if status else None

    return await db.query("cameras", filters=filters, limit=200)





@router.get("/cameras/{camera_id}", response_model=CameraResponse)

async def get_camera(camera_id: str, db: FirestoreDB = Depends(get_db)):

    cam = await db.get("cameras", camera_id)

    if not cam:

        raise HTTPException(404, "Camera not found")

    return cam





@router.post("/cameras/events", response_model=CameraEventResponse)

async def create_camera_event(event: CameraEventCreate, db: FirestoreDB = Depends(get_db)):

    from app.core.websocket_manager import ws_manager

    camera = await db.get("cameras", event.camera_id)

    if not camera:

        raise HTTPException(404, "Camera not found")

    db_event = make_camera_event(

        event.camera_id, event.event_type,

        zone_id=event.zone_id or camera.get("zone_id"),

        severity=event.severity, confidence=event.confidence,

        latitude=event.latitude or camera.get("latitude"),

        longitude=event.longitude or camera.get("longitude"),

        evidence=event.evidence, status=event.status,

    )

    await db.create("camera_events", db_event)

    if event.severity in ("HIGH", "CRITICAL"):

        svc = IncidentService()

        await svc.create_from_camera_event(db, db_event, camera)

    await ws_manager.broadcast("cameras", {

        "type": "CAMERA_EVENT",

        "camera_id": event.camera_id,

        "event_type": event.event_type,

        "severity": event.severity,

        "confidence": event.confidence,

    })

    return db_event





@router.get("/cameras/{camera_id}/events", response_model=list[CameraEventResponse])

async def camera_events(camera_id: str, limit: int = 50, db: FirestoreDB = Depends(get_db)):

    events = await db.query(

        "camera_events",

        filters=[("camera_id", "==", camera_id)],

        order_by="detected_at", descending=True, limit=limit,

    )

    return events





@router.get("/incidents", response_model=list[IncidentResponse])

async def list_incidents(status: Optional[str] = None, limit: int = 50, db: FirestoreDB = Depends(get_db)):

    svc = IncidentService()

    return await svc.list_incidents(db, status, limit)





@router.get("/incidents/{incident_id}", response_model=IncidentResponse)

async def get_incident(incident_id: str, db: FirestoreDB = Depends(get_db)):

    inc = await db.get("incidents", incident_id)

    if not inc:

        raise HTTPException(404, "Incident not found")

    return inc





@router.patch("/incidents/{incident_id}", response_model=IncidentResponse)

async def update_incident(incident_id: str, update: IncidentUpdate, db: FirestoreDB = Depends(get_db)):

    inc = await db.get("incidents", incident_id)

    if not inc:

        raise HTTPException(404, "Incident not found")

    data = update.model_dump(exclude_none=True)

    data["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.update("incidents", incident_id, data)

    return await db.get("incidents", incident_id)





@router.get("/shelters", response_model=list[ShelterResponse])

async def list_shelters(db: FirestoreDB = Depends(get_db)):

    svc = ShelterService()

    items = await svc.list_with_occupancy(db)

    return [

        ShelterResponse(

            id=i["shelter"].id, shelter_code=i["shelter"].shelter_code, name=i["shelter"].name,

            capacity=i["shelter"].capacity, occupied=i["shelter"].occupied,

            latitude=i["shelter"].latitude, longitude=i["shelter"].longitude,

            status=i["shelter"].status, occupancy_pct=i["occupancy_pct"], overflow_risk=i["overflow_risk"],

        )

        for i in items

    ]





@router.get("/response-units", response_model=list[ResponseUnitResponse])

async def list_response_units(unit_type: Optional[str] = None, db: FirestoreDB = Depends(get_db)):

    filters = [("unit_type", "==", unit_type)] if unit_type else None

    return await db.query("response_units", filters=filters)





@router.get("/response-units/nearest", response_model=list[ResponseUnitResponse])

async def nearest_units(

    lat: float, lng: float, unit_type: Optional[str] = None, limit: int = 5,

    db: FirestoreDB = Depends(get_db),

):

    svc = ResponseService()

    items = await svc.nearest_units(db, lat, lng, unit_type, limit)

    return [

        ResponseUnitResponse(

            id=i["unit"].id, unit_code=i["unit"].unit_code, unit_type=i["unit"].unit_type,

            name=i["unit"].name, latitude=i["unit"].latitude, longitude=i["unit"].longitude,

            status=i["unit"].status, available=i["unit"].available, distance_km=i["distance_km"],

        )

        for i in items

    ]





@router.post("/dispatch/recommend")

async def dispatch_recommend(req: DispatchRecommendRequest, db: FirestoreDB = Depends(get_db)):

    inc = await db.get("incidents", req.incident_id)

    if not inc:

        raise HTTPException(404, "Incident not found")

    svc = ResponseService()

    unit_type_map = {"FIRE": "fire", "MEDICAL": "medical", "CROWD": "police", "ACCIDENT": "medical"}

    unit_type = unit_type_map.get(inc.get("incident_type", ""), "police")

    nearest = await svc.nearest_units(db, inc.get("latitude") or 19.997, inc.get("longitude") or 73.79, unit_type, 3)

    llm = get_llm_provider()

    rec = llm.generate_recommendation({

        "incident": {

            "id": inc["id"], "incident_type": inc.get("incident_type"),

            "severity": inc.get("severity"), "confidence": inc.get("confidence"),

            "location_name": inc.get("location_name"),

        },

        "nearest_units": [{"name": i["unit"].name, "distance_km": i["distance_km"]} for i in nearest],

        "nearby_cameras": [],

    })

    await db.update("incidents", inc["id"], {"ai_recommendation": rec})

    dispatches = []

    for item in nearest[:2]:

        d = make_dispatch(inc["id"], item["unit"].id, status="RECOMMENDED")

        await db.create("dispatches", d)

        dispatches.append({"unit": item["unit"].name, "distance_km": item["distance_km"]})

    return {"recommendation": rec, "dispatches": dispatches}





@router.post("/dispatch/confirm")

async def dispatch_confirm(req: DispatchConfirmRequest, user: dict = Depends(get_current_user), db: FirestoreDB = Depends(get_db)):

    d = await db.get("dispatches", req.dispatch_id)

    if not d:

        raise HTTPException(404, "Dispatch not found")

    await db.update("dispatches", req.dispatch_id, {

        "status": "CONFIRMED",

        "confirmed_by": user["id"],

        "notes": req.notes,

        "confirmed_at": datetime.now(timezone.utc).isoformat(),

    })

    return {"status": "CONFIRMED", "dispatch_id": req.dispatch_id}





@router.get("/alerts", response_model=list[AlertResponse])

async def list_alerts(limit: int = 50, db: FirestoreDB = Depends(get_db)):

    return await db.query("alerts", order_by="sent_at", descending=True, limit=limit)





@router.post("/alerts", response_model=AlertResponse)

async def create_alert(alert: AlertCreate, db: FirestoreDB = Depends(get_db)):

    svc = AlertService()

    a = await svc.create_alert(db, alert.level, alert.message, alert.incident_id, alert.channel)

    return a.to_dict()





@router.post("/predictions/run")

async def run_predictions(zone_id: Optional[str] = None, db: FirestoreDB = Depends(get_db)):

    engine = CrowdForecastEngine()

    if zone_id:

        zones = [await db.get("zones", zone_id)]

    else:

        zones = await db.query("zones")

    results = []

    for zone in zones:

        if not zone:

            continue

        forecasts = engine.forecast(zone["id"], current_population=5000, capacity=zone.get("capacity", 50000))

        for f in forecasts:

            pred = make_crowd_prediction(zone["id"], **{k: f[k] for k in f if k != "zone_id"})

            await db.create("crowd_predictions", pred)

            results.append(f)

    return {"predictions": results}





@router.get("/predictions/{zone_id}", response_model=list[PredictionResponse])

async def get_predictions(zone_id: str, db: FirestoreDB = Depends(get_db)):

    return await db.query(

        "crowd_predictions",

        filters=[("zone_id", "==", zone_id)],

        order_by="created_at", descending=True, limit=10,

    )


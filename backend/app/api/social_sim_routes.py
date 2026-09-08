from typing import Optional



from fastapi import APIRouter, Depends, HTTPException



from app.db.document_models import make_camera_event, make_verification_result

from app.db.firestore import FirestoreDB

from app.db.session import get_db

from app.schemas import (

    SocialPostIngest, SocialPostResponse, VerifyUrlRequest, VerifyUrlResponse,

    VerificationAnalyzeRequest, VerificationResponse, SimulationStatus,

)

from app.services.social_service import SocialService

from app.services.social_adapters import MockInstagramAdapter

from app.ai.verification.engine import VerificationEngine

from app.simulation.engine import simulation_engine



router = APIRouter()





@router.post("/social/ingest", response_model=SocialPostResponse)

async def ingest_social(post: SocialPostIngest, db: FirestoreDB = Depends(get_db)):

    svc = SocialService()

    return await svc.ingest_and_analyze(db, post.model_dump())





@router.post("/social/analyze", response_model=SocialPostResponse)

async def analyze_social(post: SocialPostIngest, db: FirestoreDB = Depends(get_db)):

    svc = SocialService()

    result = await svc.ingest_and_analyze(db, post.model_dump())

    verifier = VerificationEngine()

    v = await verifier.verify_claim(

        db, claim=result.get("extracted_claim", {}).get("claim", result.get("caption") or ""),

        incident_type=result.get("extracted_claim", {}).get("incident_type"),

        latitude=result.get("latitude"), longitude=result.get("longitude"),

        social_post_id=result["id"],

    )

    await db.update("social_posts", result["id"], {"verification_status": v["status"]})

    vr = make_verification_result(

        v["claim"], v["status"], social_post_id=result["id"],

        confidence=v["confidence"], evidence=v["evidence"], reasoning=v["reasoning"],

    )

    await db.create("verification_results", vr)

    result["verification_status"] = v["status"]

    return result





@router.get("/social/posts", response_model=list[SocialPostResponse])

async def list_social_posts(

    verification_status: Optional[str] = None, limit: int = 50, db: FirestoreDB = Depends(get_db)

):

    filters = [("verification_status", "==", verification_status)] if verification_status else None

    return await db.query("social_posts", filters=filters, order_by="social_priority_score", descending=True, limit=limit)





@router.get("/social/posts/{post_id}", response_model=SocialPostResponse)

async def get_social_post(post_id: str, db: FirestoreDB = Depends(get_db)):

    post = await db.get("social_posts", post_id)

    if not post:

        raise HTTPException(404, "Post not found")

    return post





@router.post("/social/verify-url", response_model=VerifyUrlResponse)

async def verify_url(req: VerifyUrlRequest, db: FirestoreDB = Depends(get_db)):

    svc = SocialService()

    return await svc.verify_url(db, req.model_dump())





@router.post("/social/fetch-mock")

async def fetch_mock_feed(limit: int = 10, db: FirestoreDB = Depends(get_db)):

    adapter = MockInstagramAdapter()

    posts = await adapter.fetch_posts(limit)

    svc = SocialService()

    ingested = []

    for p in posts:

        result = await svc.ingest_and_analyze(db, p)

        ingested.append(result["id"])

    return {"ingested": len(ingested), "post_ids": ingested}





@router.post("/verification/analyze", response_model=VerificationResponse)

async def analyze_verification(req: VerificationAnalyzeRequest, db: FirestoreDB = Depends(get_db)):

    verifier = VerificationEngine()

    claim = req.claim or ""

    if req.social_post_id:

        post = await db.get("social_posts", req.social_post_id)

        if post:

            claim = post.get("caption") or claim

    v = await verifier.verify_claim(db, claim, req.incident_type, req.latitude, req.longitude, req.social_post_id)

    vr = make_verification_result(

        v["claim"], v["status"], social_post_id=req.social_post_id,

        confidence=v["confidence"], evidence=v["evidence"], reasoning=v["reasoning"],

    )

    await db.create("verification_results", vr)

    return vr





@router.get("/verification/{verification_id}", response_model=VerificationResponse)

async def get_verification(verification_id: str, db: FirestoreDB = Depends(get_db)):

    vr = await db.get("verification_results", verification_id)

    if not vr:

        raise HTTPException(404, "Verification not found")

    return vr





@router.get("/zones")

async def list_zones(db: FirestoreDB = Depends(get_db)):

    zones = await db.query("zones")

    return [

        {"id": z["id"], "zone_code": z["zone_code"], "name": z["name"],

         "latitude": z["latitude"], "longitude": z["longitude"], "capacity": z["capacity"]}

        for z in zones

    ]





@router.post("/simulation/start", response_model=SimulationStatus)

async def sim_start(db: FirestoreDB = Depends(get_db)):

    return await simulation_engine.start(db)





@router.post("/simulation/stop", response_model=SimulationStatus)

async def sim_stop():

    return await simulation_engine.stop()





@router.post("/simulation/reset", response_model=SimulationStatus)

async def sim_reset(db: FirestoreDB = Depends(get_db)):

    return await simulation_engine.reset(db)





@router.get("/simulation/status", response_model=SimulationStatus)

async def sim_status():

    return simulation_engine.status





@router.post("/simulation/inject-fire")

async def inject_fire(db: FirestoreDB = Depends(get_db)):

    await simulation_engine.inject_fire(db)

    return {"status": "injected", "type": "fire"}





@router.post("/simulation/inject-crowd")

async def inject_crowd(db: FirestoreDB = Depends(get_db)):

    await simulation_engine.inject_crowd(db)

    return {"status": "injected", "type": "crowd"}





@router.post("/simulation/inject-accident")

async def inject_accident(db: FirestoreDB = Depends(get_db)):

    await simulation_engine.inject_accident(db)

    return {"status": "injected", "type": "accident"}





@router.post("/simulation/inject-social-claim")

async def inject_social(db: FirestoreDB = Depends(get_db)):

    svc = SocialService()

    await svc.ingest_and_analyze(db, {"caption": "Heavy crowd at Gate 7, people stuck for 30 minutes", "platform": "instagram"})

    return {"status": "injected", "type": "social_claim"}





@router.post("/simulation/inject-misinformation")

async def inject_misinfo(db: FirestoreDB = Depends(get_db)):

    await simulation_engine.inject_misinformation(db)

    return {"status": "injected", "type": "misinformation"}





@router.post("/simulation/inject-person-down")

async def inject_person_down(db: FirestoreDB = Depends(get_db)):

    cameras = await db.query("cameras", limit=1)

    if cameras:

        camera = cameras[0]

        event = make_camera_event(

            camera["id"], "MEDICAL",

            zone_id=camera.get("zone_id"),

            severity="HIGH", confidence=0.78,

            latitude=camera["latitude"], longitude=camera["longitude"],

            evidence={"event_type": "POSSIBLE_PERSON_DOWN", "duration_seconds": 12},

        )

        await db.create("camera_events", event)

    return {"status": "injected", "type": "person_down"}





@router.post("/simulation/inject-recycled-video")

async def inject_recycled(db: FirestoreDB = Depends(get_db)):

    svc = SocialService()

    post = await svc.ingest_and_analyze(db, {

        "caption": "Breaking: stampede at Kumbh (old video reposted from 2024)",

        "platform": "instagram", "creator_handle": "recycled_content",

    })

    await db.update("social_posts", post["id"], {"verification_status": "POSSIBLE_RECYCLED_CONTENT"})

    post["verification_status"] = "POSSIBLE_RECYCLED_CONTENT"

    return {"status": "injected", "type": "recycled_video", "post_id": post["id"]}





@router.post("/simulation/inject-shelter-overflow")

async def inject_shelter_overflow(db: FirestoreDB = Depends(get_db)):

    shelters = await db.query("shelters", limit=1)

    if shelters:

        shelter = shelters[0]

        await db.update("shelters", shelter["id"], {"occupied": int(shelter["capacity"] * 0.95)})

    return {"status": "injected", "type": "shelter_overflow"}


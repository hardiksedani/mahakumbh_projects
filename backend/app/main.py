from datetime import datetime, timezone

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.websocket_manager import ws_manager
from app.db.session import init_db_check
from app.api.routes import router as main_router
from app.api.social_sim_routes import router as social_router
from app.schemas import HealthResponse, AIHealthResponse

app = FastAPI(
    title="KumbhRakshak API",
    description="AI-Powered Kumbh Safety, Incident Detection & Decision Support Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(main_router, prefix="/api")
app.include_router(social_router, prefix="/api")


@app.on_event("startup")
async def startup():
    health = await init_db_check()
    print(f"Database: {health}")


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="healthy", environment=settings.environment, timestamp=datetime.now(timezone.utc))


@app.get("/health/ai", response_model=AIHealthResponse)
async def health_ai():
    return AIHealthResponse(status="healthy", modules={
        "vision_detection": "ready",
        "fire_smoke": "ready",
        "crowd_analytics": "ready",
        "social_nlp": "ready",
        "embeddings": "ready",
        "forecasting": "ready",
        "risk_scoring": "ready",
        "verification": "ready",
        "decision_support": settings.llm_provider,
    })


@app.get("/health/db")
async def health_db():
    from app.db.firestore import FirestoreDB
    return await FirestoreDB.get_instance().health_check()


async def _ws_handler(channel: str, websocket: WebSocket):
    await ws_manager.connect(channel, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(channel, websocket)


@app.websocket("/ws/incidents")
async def ws_incidents(websocket: WebSocket):
    await _ws_handler("incidents", websocket)


@app.websocket("/ws/cameras")
async def ws_cameras(websocket: WebSocket):
    await _ws_handler("cameras", websocket)


@app.websocket("/ws/alerts")
async def ws_alerts(websocket: WebSocket):
    await _ws_handler("alerts", websocket)


@app.websocket("/ws/crowd")
async def ws_crowd(websocket: WebSocket):
    await _ws_handler("crowd", websocket)

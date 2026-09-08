"""Seed realistic synthetic demo data for KumbhRakshak (Firebase Firestore)."""
import asyncio
import random
import uuid
from datetime import datetime, timedelta, timezone

from app.core.security import hash_password
from app.db.document_models import (
    make_camera, make_camera_event, make_crowd_snapshot, make_incident,
    make_response_unit, make_role, make_shelter, make_user, make_zone,
)
from app.db.firestore import FirestoreDB
from app.services.social_adapters import MockInstagramAdapter
from app.services.social_service import SocialService

SEED = 42

ZONES = [
    ("ZONE-01", "Ramkund Ghat", 19.9970, 73.7900, 80000),
    ("ZONE-02", "Godavari Ghat", 19.9960, 73.7910, 60000),
    ("ZONE-03", "Panchvati", 20.0080, 73.7920, 40000),
    ("ZONE-04", "Tapovan", 20.0150, 73.7950, 35000),
    ("ZONE-05", "Trimbak Road Entry", 19.9850, 73.7750, 50000),
    ("ZONE-06", "Dwarka Circle", 19.9900, 73.7800, 45000),
    ("ZONE-07", "Gate 3 Area", 19.9850, 73.7750, 55000),
    ("ZONE-08", "Gate 7 Area", 19.9975, 73.7898, 70000),
    ("ZONE-09", "Bus Stand Zone", 19.9780, 73.7700, 30000),
    ("ZONE-10", "Railway Approach", 19.9700, 73.7650, 40000),
    ("ZONE-11", "Sadhana Area", 20.0200, 73.7980, 25000),
    ("ZONE-12", "Anjaneri Route", 19.9600, 73.7600, 20000),
    ("ZONE-13", "Main Bridge", 19.9930, 73.7870, 35000),
    ("ZONE-14", "Volunteer HQ", 19.9880, 73.7820, 15000),
    ("ZONE-15", "Medical Zone", 19.9920, 73.7850, 20000),
    ("ZONE-16", "Parking Alpha", 19.9750, 73.7680, 60000),
    ("ZONE-17", "Parking Beta", 19.9720, 73.7620, 50000),
    ("ZONE-18", "Food Court Area", 19.9890, 73.7810, 30000),
    ("ZONE-19", "Lost & Found", 19.9910, 73.7840, 10000),
    ("ZONE-20", "Control Sector", 19.9940, 73.7860, 25000),
]

SHELTER_NAMES = [
    "Shelter Alpha", "Shelter Beta", "Shelter Gamma", "Shelter Delta", "Shelter Epsilon",
    "Shelter Zeta", "Shelter Eta", "Shelter Theta", "Shelter Iota", "Shelter Kappa",
]

UNIT_TYPES = [
    ("police", "Police Unit"),
    ("medical", "Medical Team"),
    ("ambulance", "Ambulance"),
    ("fire", "Fire Brigade"),
    ("rescue", "Rescue Team"),
    ("volunteer", "Volunteer Squad"),
]

CREATORS = [
    ("nashik_updates", "HIGH"), ("mela_reporter", "MEDIUM"), ("devotee_vlog", "MEDIUM"),
    ("official_kumbh", "CRITICAL"), ("crowd_watch", "HIGH"), ("trimbakeshwar_live", "LOW"),
    ("medical_alert", "HIGH"), ("panic_poster", "LOW"), ("fire_rumor", "MEDIUM"),
]


async def seed():
    db = FirestoreDB.get_instance()
    existing = await db.query("roles", limit=1)
    if existing:
        print("Database already seeded.")
        return

    rng = random.Random(SEED)
    roles = {}
    for name in ["ADMIN", "COMMANDER", "POLICE", "MEDICAL", "ANALYST", "VIEWER"]:
        r = make_role(name, f"{name} role")
        await db.create("roles", r)
        roles[name] = r

    await db.create("users", make_user(
        "admin@kumbhrakshak.gov.in", hash_password("admin123"),
        "System Administrator", roles["ADMIN"]["id"],
    ))
    await db.create("users", make_user(
        "commander@kumbhrakshak.gov.in", hash_password("commander123"),
        "Command Centre Officer", roles["COMMANDER"]["id"],
    ))

    zone_map = {}
    for code, name, lat, lng, cap in ZONES:
        z = make_zone(code, name, lat, lng, cap, risk_weight=rng.uniform(0.8, 1.5))
        await db.create("zones", z)
        zone_map[code] = z

    cam_782_id = None
    for i in range(100):
        zone = rng.choice(list(zone_map.values()))
        lat = zone["latitude"] + rng.uniform(-0.005, 0.005)
        lng = zone["longitude"] + rng.uniform(-0.005, 0.005)
        status = rng.choices(["online", "online", "online", "warning", "offline"], weights=[70, 10, 10, 8, 2])[0]
        cam = make_camera(
            f"CAM-{780 + i}", zone["id"], lat, lng,
            stream_type=rng.choice(["simulated", "rtsp", "mp4"]),
            stream_url=f"/sim/camera_{780 + i}.mp4", status=status,
        )
        await db.create("cameras", cam)
        if cam["camera_code"] == "CAM-782":
            cam_782_id = cam["id"]

    cameras = await db.query("cameras")
    cam_782 = next((c for c in cameras if c["camera_code"] == "CAM-782"), cameras[0])

    for i, name in enumerate(SHELTER_NAMES):
        zone = list(zone_map.values())[i % len(zone_map)]
        s = make_shelter(
            f"SHL-{i+1:03d}", zone["id"], name,
            rng.randint(800, 3000), rng.randint(200, 2500),
            zone["latitude"] + rng.uniform(-0.003, 0.003),
            zone["longitude"] + rng.uniform(-0.003, 0.003),
        )
        await db.create("shelters", s)

    for i in range(50):
        utype, prefix = rng.choice(UNIT_TYPES)
        zone = rng.choice(list(zone_map.values()))
        u = make_response_unit(
            f"{prefix[:3].upper()}-{i+1:03d}", utype, f"{prefix} {i+1}",
            zone["latitude"] + rng.uniform(-0.01, 0.01),
            zone["longitude"] + rng.uniform(-0.01, 0.01),
            available=rng.random() > 0.15,
        )
        await db.create("response_units", u)

    await db.create("social_sources", {
        "id": str(uuid.uuid4()), "name": "Mock Instagram", "platform": "instagram",
        "adapter_type": "mock", "config": {}, "active": True,
    })

    for handle, priority in CREATORS:
        await db.create("creator_watchlist", {
            "id": str(uuid.uuid4()), "handle": handle, "platform": "instagram",
            "display_name": handle, "followers": rng.randint(1000, 500000),
            "priority": priority, "known_location": rng.choice(["Gate 7", "Ramkund", "Panchvati"]),
            "verified_status": handle == "official_kumbh", "active": True,
        })

    social_svc = SocialService()
    adapter = MockInstagramAdapter(SEED)
    posts = await adapter.fetch_posts(20)
    for _ in range(50):
        p = rng.choice(posts)
        variant = p.copy()
        variant["caption"] = p["caption"] + (f" #{rng.randint(1,999)}" if rng.random() > 0.5 else "")
        await social_svc.ingest_and_analyze(db, variant)

    incident_types = ["CROWD", "FIRE", "MEDICAL", "ACCIDENT", "SECURITY", "INFRASTRUCTURE"]
    severities = ["INFO", "WARNING", "HIGH", "CRITICAL"]
    for i in range(100):
        cam = rng.choice(cameras)
        itype = rng.choice(incident_types)
        sev = rng.choices(severities, weights=[30, 30, 25, 15])[0]
        inc = make_incident(
            f"INC-{uuid.uuid4().hex[:8].upper()}", itype,
            status=rng.choice(["OPEN", "OPEN", "INVESTIGATING", "RESOLVED"]),
            severity=sev, confidence=rng.uniform(0.4, 0.98),
            risk_score=rng.uniform(10, 95), priority_score=rng.uniform(10, 95),
            latitude=cam["latitude"], longitude=cam["longitude"],
            location_name=rng.choice(["Gate 7", "Ramkund", "Panchvati", "Godavari Ghat"]),
            first_seen=(datetime.now(timezone.utc) - timedelta(hours=rng.randint(0, 72))).isoformat(),
        )
        await db.create("incidents", inc)

    for i in range(30):
        cam = rng.choice(cameras)
        ev = make_camera_event(
            cam["id"], rng.choice(incident_types),
            zone_id=cam.get("zone_id"),
            severity=rng.choice(severities),
            confidence=rng.uniform(0.5, 0.99),
            latitude=cam["latitude"], longitude=cam["longitude"],
            evidence={"people_count": rng.randint(50, 2000)},
            detected_at=(datetime.now(timezone.utc) - timedelta(minutes=rng.randint(0, 120))).isoformat(),
        )
        await db.create("camera_events", ev)

    fire_event = make_camera_event(
        cam_782["id"], "FIRE",
        zone_id=cam_782.get("zone_id"),
        severity="CRITICAL", confidence=0.94,
        latitude=cam_782["latitude"], longitude=cam_782["longitude"],
        evidence={"smoke_confidence": 0.91, "people_count": 140, "fire_confidence": 0.88},
    )
    await db.create("camera_events", fire_event)

    for zone in zone_map.values():
        for _ in range(5):
            cs = make_crowd_snapshot(
                zone["id"],
                people_count=rng.randint(1000, 50000),
                density_score=rng.uniform(0.2, 0.95),
                growth_rate=rng.uniform(-50, 200),
                crowd_risk_score=rng.uniform(10, 90),
                recorded_at=(datetime.now(timezone.utc) - timedelta(hours=rng.randint(0, 48))).isoformat(),
            )
            await db.create("crowd_snapshots", cs)

    await db.create("official_reports", {
        "id": str(uuid.uuid4()), "title": "All routes operational",
        "content": "Kumbh Mela routes are operational.",
        "source": "Kumbh Authority", "location_name": "Ramkund",
        "latitude": 19.997, "longitude": 73.79,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    print("Seed complete: 100 cameras, 20 zones, 10 shelters, 50 units, social posts, 100 incidents")
    print(f"Database mode: {'memory' if db.using_memory else 'firebase'}")


if __name__ == "__main__":
    asyncio.run(seed())

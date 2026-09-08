"""Firebase Firestore data layer with in-memory fallback for local demo."""

from __future__ import annotations

import asyncio
import copy
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from app.core.config import settings

COLLECTIONS = [
    "users", "roles", "zones", "locations", "cameras", "camera_events",
    "camera_snapshots", "crowd_snapshots", "crowd_predictions", "social_sources",
    "creator_watchlist", "incident_clusters", "incidents", "social_posts",
    "social_media_embeddings", "verification_results", "content_fingerprints",
    "official_reports", "response_units", "dispatches", "shelters", "alerts",
    "notifications", "audit_logs", "model_predictions",
]

Filter = Tuple[str, str, Any]


def new_id() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def serialize_value(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: serialize_value(v) for k, v in value.items()}
    if isinstance(value, list):
        return [serialize_value(v) for v in value]
    return value


def parse_datetime(value: Any) -> Any:
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return value
    return value


class MemoryStore:
    """In-process store used when Firebase credentials are not configured."""

    def __init__(self) -> None:
        self._data: Dict[str, Dict[str, dict]] = {c: {} for c in COLLECTIONS}

    def get(self, collection: str, doc_id: str) -> Optional[dict]:
        doc = self._data.get(collection, {}).get(doc_id)
        return copy.deepcopy(doc) if doc else None

    def set(self, collection: str, doc_id: str, data: dict) -> None:
        if collection not in self._data:
            self._data[collection] = {}
        payload = copy.deepcopy(data)
        payload["id"] = doc_id
        self._data[collection][doc_id] = payload

    def delete(self, collection: str, doc_id: str) -> None:
        self._data.get(collection, {}).pop(doc_id, None)

    def query(
        self,
        collection: str,
        filters: Optional[List[Filter]] = None,
        order_by: Optional[str] = None,
        descending: bool = False,
        limit: Optional[int] = None,
    ) -> List[dict]:
        items = list(self._data.get(collection, {}).values())
        for field, op, value in filters or []:
            items = [i for i in items if self._match(i.get(field), op, value)]
        if order_by:
            items.sort(key=lambda x: x.get(order_by) or "", reverse=descending)
        if limit is not None:
            items = items[:limit]
        return copy.deepcopy(items)

    def count(self, collection: str, filters: Optional[List[Filter]] = None) -> int:
        return len(self.query(collection, filters=filters))

    @staticmethod
    def _match(field_value: Any, op: str, value: Any) -> bool:
        if op == "==":
            return field_value == value
        if op == "!=":
            return field_value != value
        if op == ">=":
            return field_value is not None and field_value >= value
        if op == "<=":
            return field_value is not None and field_value <= value
        if op == "in":
            return field_value in value
        if op == "array_contains":
            return isinstance(field_value, list) and value in field_value
        return False


class FirestoreDB:
    """Async-friendly Firestore wrapper with optional in-memory fallback."""

    _instance: Optional["FirestoreDB"] = None

    def __init__(self) -> None:
        self._memory = MemoryStore()
        self._firebase = None
        self._use_memory = True
        self._init_firebase()

    @classmethod
    def get_instance(cls) -> "FirestoreDB":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _init_firebase(self) -> None:
        if settings.firebase_use_memory:
            self._use_memory = True
            return
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore

            if not firebase_admin._apps:
                if settings.firebase_service_account_path:
                    cred = credentials.Certificate(settings.firebase_service_account_path)
                    firebase_admin.initialize_app(cred, {"projectId": settings.firebase_project_id})
                elif settings.firebase_project_id:
                    firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})
                else:
                    self._use_memory = True
                    return
            self._firebase = firestore.client()
            self._use_memory = False
        except Exception:
            self._use_memory = True

    @property
    def using_memory(self) -> bool:
        return self._use_memory

    async def _run(self, fn, *args, **kwargs):
        return await asyncio.to_thread(fn, *args, **kwargs)

    async def get(self, collection: str, doc_id: str) -> Optional[dict]:
        if self._use_memory:
            return self._memory.get(collection, doc_id)
        doc = await self._run(self._firebase.collection(collection).document(doc_id).get)
        if not doc.exists:
            return None
        data = doc.to_dict()
        data["id"] = doc.id
        return data

    async def create(self, collection: str, data: dict, doc_id: Optional[str] = None) -> str:
        doc_id = doc_id or data.get("id") or new_id()
        payload = serialize_value({**data, "id": doc_id})
        if self._use_memory:
            self._memory.set(collection, doc_id, payload)
            return doc_id
        await self._run(self._firebase.collection(collection).document(doc_id).set, payload)
        return doc_id

    async def update(self, collection: str, doc_id: str, data: dict) -> None:
        payload = serialize_value(data)
        if self._use_memory:
            existing = self._memory.get(collection, doc_id) or {"id": doc_id}
            existing.update(payload)
            self._memory.set(collection, doc_id, existing)
            return
        await self._run(self._firebase.collection(collection).document(doc_id).update, payload)

    async def set_merge(self, collection: str, doc_id: str, data: dict) -> None:
        payload = serialize_value(data)
        if self._use_memory:
            existing = self._memory.get(collection, doc_id) or {"id": doc_id}
            existing.update(payload)
            self._memory.set(collection, doc_id, existing)
            return
        await self._run(self._firebase.collection(collection).document(doc_id).set, payload, merge=True)

    async def delete(self, collection: str, doc_id: str) -> None:
        if self._use_memory:
            self._memory.delete(collection, doc_id)
            return
        await self._run(self._firebase.collection(collection).document(doc_id).delete)

    async def query(
        self,
        collection: str,
        filters: Optional[List[Filter]] = None,
        order_by: Optional[str] = None,
        descending: bool = False,
        limit: Optional[int] = None,
    ) -> List[dict]:
        if self._use_memory:
            return self._memory.query(collection, filters, order_by, descending, limit)

        def _query():
            ref = self._firebase.collection(collection)
            for field, op, value in filters or []:
                ref = ref.where(field, op, value)
            if order_by:
                from firebase_admin import firestore as fs
                direction = fs.Query.DESCENDING if descending else fs.Query.ASCENDING
                ref = ref.order_by(order_by, direction=direction)
            if limit is not None:
                ref = ref.limit(limit)
            return [{"id": d.id, **d.to_dict()} for d in ref.stream()]

        return await self._run(_query)

    async def count(self, collection: str, filters: Optional[List[Filter]] = None) -> int:
        if self._use_memory:
            return self._memory.count(collection, filters)
        docs = await self.query(collection, filters=filters)
        return len(docs)

    async def get_one(self, collection: str, filters: List[Filter]) -> Optional[dict]:
        docs = await self.query(collection, filters=filters, limit=1)
        return docs[0] if docs else None

    async def health_check(self) -> dict:
        if self._use_memory:
            total = sum(len(v) for v in self._memory._data.values())
            return {"status": "healthy", "database": "memory", "documents": total}
        try:
            await self.query("roles", limit=1)
            return {"status": "healthy", "database": "firebase", "project": settings.firebase_project_id}
        except Exception as exc:
            return {"status": "unhealthy", "database": "firebase", "error": str(exc)}


async def get_db():
    yield FirestoreDB.get_instance()


async def init_db_check() -> dict:
    """Verify database connectivity on startup."""
    db = FirestoreDB.get_instance()
    return await db.health_check()

"""Abstract and in-memory repository layer for KumbhRakshak.
Provides unified data access for both PostgreSQL/PostGIS and in-memory demo modes.
"""

from __future__ import annotations

import copy
import math
import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def new_uuid() -> str:
    return str(uuid.uuid4())


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance in kilometers between two points."""
    r = 6371.0  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


class BaseRepository(ABC):
    """Abstract base repository interface."""

    @abstractmethod
    async def get(self, collection: str, item_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    async def create(self, collection: str, data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def update(self, collection: str, item_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    async def delete(self, collection: str, item_id: str) -> bool:
        pass

    @abstractmethod
    async def list(
        self,
        collection: str,
        filters: Optional[List[Tuple[str, str, Any]]] = None,
        order_by: Optional[str] = None,
        descending: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def count(self, collection: str, filters: Optional[List[Tuple[str, str, Any]]] = None) -> int:
        pass

    @abstractmethod
    async def find_within_radius(
        self,
        collection: str,
        latitude: float,
        longitude: float,
        radius_km: float,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        pass


class InMemoryRepository(BaseRepository):
    """Thread-safe in-memory repository implementation for DEMO_MODE and zero-dependency testing."""

    def __init__(self) -> None:
        self._tables: Dict[str, Dict[str, Dict[str, Any]]] = {}

    def _get_table(self, collection: str) -> Dict[str, Dict[str, Any]]:
        if collection not in self._tables:
            self._tables[collection] = {}
        return self._tables[collection]

    async def get(self, collection: str, item_id: str) -> Optional[Dict[str, Any]]:
        table = self._get_table(collection)
        item = table.get(item_id)
        return copy.deepcopy(item) if item else None

    async def create(self, collection: str, data: Dict[str, Any]) -> Dict[str, Any]:
        table = self._get_table(collection)
        item = copy.deepcopy(data)
        if "id" not in item or not item["id"]:
            item["id"] = new_uuid()
        if "created_at" not in item:
            item["created_at"] = utcnow().isoformat()
        if "updated_at" not in item:
            item["updated_at"] = utcnow().isoformat()
        table[str(item["id"])] = item
        return copy.deepcopy(item)

    async def update(self, collection: str, item_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        table = self._get_table(collection)
        if item_id not in table:
            return None
        item = table[item_id]
        for k, v in data.items():
            if k != "id":
                item[k] = copy.deepcopy(v)
        item["updated_at"] = utcnow().isoformat()
        return copy.deepcopy(item)

    async def delete(self, collection: str, item_id: str) -> bool:
        table = self._get_table(collection)
        if item_id in table:
            del table[item_id]
            return True
        return False

    async def list(
        self,
        collection: str,
        filters: Optional[List[Tuple[str, str, Any]]] = None,
        order_by: Optional[str] = None,
        descending: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        table = self._get_table(collection)
        results = list(table.values())

        if filters:
            for field, op, val in filters:
                if op == "==":
                    results = [r for r in results if r.get(field) == val]
                elif op == "!=":
                    results = [r for r in results if r.get(field) != val]
                elif op == ">":
                    results = [r for r in results if r.get(field) is not None and r.get(field) > val]
                elif op == "<":
                    results = [r for r in results if r.get(field) is not None and r.get(field) < val]
                elif op == ">=":
                    results = [r for r in results if r.get(field) is not None and r.get(field) >= val]
                elif op == "<=":
                    results = [r for r in results if r.get(field) is not None and r.get(field) <= val]
                elif op == "in":
                    results = [r for r in results if r.get(field) in val]

        if order_by:
            results.sort(key=lambda x: str(x.get(order_by, "")), reverse=descending)

        sliced = results[offset : offset + limit]
        return copy.deepcopy(sliced)

    async def count(self, collection: str, filters: Optional[List[Tuple[str, str, Any]]] = None) -> int:
        items = await self.list(collection, filters=filters, limit=100000)
        return len(items)

    async def find_within_radius(
        self,
        collection: str,
        latitude: float,
        longitude: float,
        radius_km: float,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        table = self._get_table(collection)
        matched: List[Tuple[float, Dict[str, Any]]] = []

        for item in table.values():
            item_lat = item.get("latitude")
            item_lon = item.get("longitude")
            if item_lat is not None and item_lon is not None:
                try:
                    d = haversine_km(latitude, longitude, float(item_lat), float(item_lon))
                    if d <= radius_km:
                        c_item = copy.deepcopy(item)
                        c_item["distance_km"] = round(d, 3)
                        matched.append((d, c_item))
                except (ValueError, TypeError):
                    continue

        matched.sort(key=lambda x: x[0])
        return [item for _, item in matched[:limit]]


# Global Repository Registry Singleton
_REPO_INSTANCE: Optional[BaseRepository] = None


def get_repository() -> BaseRepository:
    """Returns the configured repository instance."""
    global _REPO_INSTANCE
    if _REPO_INSTANCE is None:
        _REPO_INSTANCE = InMemoryRepository()
    return _REPO_INSTANCE


def set_repository(repo: BaseRepository) -> None:
    global _REPO_INSTANCE
    _REPO_INSTANCE = repo

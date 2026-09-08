from typing import Set

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active: dict[str, Set[WebSocket]] = {
            "incidents": set(),
            "cameras": set(),
            "alerts": set(),
            "crowd": set(),
        }

    async def connect(self, channel: str, websocket: WebSocket):
        await websocket.accept()
        self.active.setdefault(channel, set()).add(websocket)

    def disconnect(self, channel: str, websocket: WebSocket):
        self.active.get(channel, set()).discard(websocket)

    async def broadcast(self, channel: str, message: dict):
        dead = []
        for ws in self.active.get(channel, set()):
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(channel, ws)


ws_manager = ConnectionManager()

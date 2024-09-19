from __future__ import annotations

from pydantic import BaseModel


class User(BaseModel):
    user_id: str
    username: str
    role: str

from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class MobilityModelInput(BaseModel):
    user_id: str
    analysis_id: str
    mobility_model_input: dict[str, Any]

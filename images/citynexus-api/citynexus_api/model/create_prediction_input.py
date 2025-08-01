from typing import Optional
from pydantic import BaseModel


class CreatePredictionInput(BaseModel):
    flood_model_input: Optional[dict] = None
    xai_input: Optional[dict] = None
    scenarioId: str
    mobility_model_input: dict
from typing import Any, Optional

from pydantic import BaseModel

from mobility_model_api.model.generic import SimulationID


class XAIInput(BaseModel):
    area_of_interest: Optional[list[list[float]]] = None
    attribute: str
    day_type: str
    time_slot: int


class MobilityModelInput(BaseModel):
    simulation_id: SimulationID
    mobility_model_input: dict[str, Any]
    xai_input: Optional[XAIInput] = None
    create_trajectories: Optional[bool] = False

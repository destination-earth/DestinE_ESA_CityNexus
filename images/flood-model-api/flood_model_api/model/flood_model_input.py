from typing import Optional

from pydantic import BaseModel, Field

from flood_model_api.model.generic import SimulationID


class FloodModelInput(BaseModel):
    resolution: Optional[int] = Field(default=100, ge=50, le=200, description="Resolution in m.")
    rain_intensity: Optional[float] = Field(default=20, ge=0, le=200, description="Rainfall in mm.")
    sea_discharge: Optional[float] = Field(default=1, ge=0, le=5, description="Sea level rise in m.")
    river_discharge: Optional[float] = Field(
        default=1, ge=0, le=1000, description="Increase of river discharge in m^3/s."
    )


class FloodSimulationInput(BaseModel):
    simulation_id: SimulationID
    flood_model_input: FloodModelInput

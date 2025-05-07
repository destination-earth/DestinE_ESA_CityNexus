from enum import Enum

from pydantic import BaseModel, Field

ID_FORMAT = r"^[a-zA-Z0-9_-]+$"


class ApiResponse(BaseModel):
    """Model for generic responses used by all endpoints."""

    response: str


class SimulationID(BaseModel):
    """Identifies the JSON input, the process and the output file of the mobility model."""

    user_id: str = Field(min_length=3, max_length=40, pattern=ID_FORMAT)
    prediction_id: str = Field(min_length=3, max_length=40, pattern=ID_FORMAT)

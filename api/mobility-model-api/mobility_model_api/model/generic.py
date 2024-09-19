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


class SimulationStatus(str, Enum):
    """Status of the mobility-model simulation process."""

    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    FAILED = "Failed"
    # NOT_AVAILABLE is also applicable for states like "does not exist" or "cannot be found"
    NOT_AVAILABLE = "Not Available"


class StatusResponse(BaseModel):
    """Response of the mobility model status endpoint."""

    simulation_id: SimulationID
    status: SimulationStatus


class XAIResultFile(str, Enum):
    """XAI output file: impact or simulation result/differences."""

    IMPACT = "impact"
    DIFFERENCE = "difference"

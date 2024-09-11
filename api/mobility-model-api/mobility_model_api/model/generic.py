from pydantic import BaseModel


class ApiResponse(BaseModel):
    """Model for generic responses used by all endpoints."""

    response: str

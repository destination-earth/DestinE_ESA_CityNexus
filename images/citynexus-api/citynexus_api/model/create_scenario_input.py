from typing import Optional
from pydantic import BaseModel


class CreateScenarioInput(BaseModel):
    data: dict
    description: str
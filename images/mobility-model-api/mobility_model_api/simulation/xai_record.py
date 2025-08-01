from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Optional

from geopandas import GeoDataFrame

from mobility_model_api.model.generic import SimulationID


class XAIRecordType(Enum):
    BASELINE = "baseline"
    MODIFICATION = "modification"


@dataclass
class XAIRecord:
    type: XAIRecordType
    simulation_id: Optional[SimulationID] = None

    # OSM ID of the road that is omitted in the model_input to calculate the impact of this modification
    road_id: Optional[str] = None

    # JSON object containing the model input configuration (without mobility-model-api metadata)
    model_input: Optional[dict[str, any]] = None

    # Path in which the model_input is stored as JSON file
    model_input_file_path: Optional[Path] = None

    # Directory in which the model writes the output zip file
    model_output_path: Optional[Path] = None

    # Path including file name of the model output zip file
    model_output_file_path: Optional[Path] = None

    # Model simulation result loaded into GeoDataFrame
    # NOTE: the data might be filtered by time slot or area of interest
    model_output: Optional[GeoDataFrame] = None

    # Result of the XAI analysis for this specific record as GeoDataFrame
    # e.g. the difference between this modification and the baseline
    xai_result: Optional[GeoDataFrame] = None

    # XAI result of the analyzed attribute summed up within the target area
    xai_value_sum: Optional[float] = None

    # XAI result of the analyzed attribute summed up and represented as difference to the baseline
    xai_value_diff: Optional[float] = None

    # XAI result of the analyzed attribute summed up and represented as percentage compared to the other modifications
    xai_value_percentage: Optional[float] = None


class XAIException(Exception):
    pass

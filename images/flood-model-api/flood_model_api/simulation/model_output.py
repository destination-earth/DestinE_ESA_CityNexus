from pathlib import Path

from flood_model_api.model.flood_model_input import FloodModelInput
from flood_model_api.model.generic import SimulationID

MODEL_OUTPUT_BASE_PATH = Path("/model_output")


def is_subdirectory(sub_dir: Path, parent_dir: Path) -> bool:
    """Verifies that the sub_dir is a real subdirectory of parent_dir."""
    try:
        sub_dir.resolve().relative_to(parent_dir.resolve())
        return True
    except ValueError:
        return False


def derive_output_file(simulation_id: SimulationID) -> Path:
    return MODEL_OUTPUT_BASE_PATH / simulation_id.user_id / f"{simulation_id.prediction_id}.tiff"


def derive_client_filename(input_parameters: FloodModelInput) -> str:
    return (
        "flood_simulation"
        f"_res{input_parameters.resolution}"
        f"_rain{input_parameters.rain_intensity}"
        f"_sea{input_parameters.sea_discharge}"
        f"_river{input_parameters.river_discharge}"
        ".tiff"
    )

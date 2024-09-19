import json
import logging
import os
import zipfile
from numbers import Number
from pathlib import Path
from typing import IO, Callable, List, Tuple, TypeVar, Union

import geopandas as gpd
from geopandas import GeoDataFrame
from shapely import Polygon
from shapely.geometry import box

from mobility_model_api.model.generic import SimulationID
from mobility_model_api.util.exceptions import InvalidAccessException, NoResultException

T = TypeVar("T")

MODEL_OUTPUT_BASE_PATH = Path("/model_output")
TargetAreaType = Union[List[Tuple[Number, Number]], None]


def load_result_zip(result_path: Path, type_loader: Callable[[IO[bytes]], T]) -> T:
    """
    Loads a result zip file from the local data system and converts it into a usable type.
    :param result_path: The local file path of the zipped result.
    :param type_loader: A function that converts the JSON files to a usable type.
    :return: The converted result file. The type depends on the return type of the type_loader.
    """
    with zipfile.ZipFile(result_path, "r") as zip_file:
        result_file = zip_file.namelist()[0]
        with zip_file.open(result_file) as unzipped_file:
            return type_loader(unzipped_file)


def load_as_dict(unzipped_json_file: [IO[bytes]]) -> dict:
    """
    Converts a JSON file to a Python dict.
    :param unzipped_json_file: The result JSON file unzipped in memory.
    :return: The result file as Python dict.
    """
    json_data = unzipped_json_file.read().decode("utf-8")
    return json.loads(json_data)


def load_as_geodf(unzipped_json_file: [IO[bytes]]) -> GeoDataFrame:
    """
    Converts a JSON file to a GeoDataFrame.
    :param unzipped_json_file: The result JSON file unzipped in memory.
    :return: The result file as GeoDataFrame.
    """
    return gpd.read_file(unzipped_json_file)


def find_latest_file(file_path: Path, file_pattern: str) -> Path:
    """Checks the file system for the latest file with a specific file_pattern
    within the model output subdirectory identified by simulation_id."""
    logging.info(f"Requested file path: {file_path}")

    if not is_subdirectory(file_path, MODEL_OUTPUT_BASE_PATH):
        raise InvalidAccessException(f"{file_path} is not a subdirectory of the model output path.")

    files_found = list(file_path.glob(file_pattern))
    logging.info(f"Files found: {files_found}")

    if len(files_found) < 1:
        raise NoResultException()

    return max(files_found, key=os.path.getmtime)


def get_output_prefix(road_id: str) -> str:
    """
    Derives a common prefix used for the result files created for the XAI approach.
    """
    return f"XAI_{road_id}"


def get_target_area(gdf: GeoDataFrame, target_area: TargetAreaType) -> GeoDataFrame:
    """
    Creates a copy of the GeoDataFrame that includes only road segments within the provided target_area.
    :param gdf: The full set of road segments.
    :param target_area: The target area geometry to filter as list of 2D coordinate tuples.
        A rectangle can be created using two or four coordinates.
        When parameter is not provided, the shap will be determined as the bounding box of road segment modifications.
    :return: A copy of the filtered GeoDataFrame.
    """
    if not target_area or len(target_area) < 2:
        # use bounding box of modified road segments when no target_are is given
        logging.info("Using bounding box of modified road segments as target area")
        target_geometry = box(*gdf.total_bounds.tolist())
    elif len(target_area) == 2:
        logging.info("Using rectangular shape as target area")
        target_geometry = box(*target_area[0], *target_area[1])
    else:
        logging.info("Using polygonal shape as target area")
        target_geometry = Polygon(target_area)

    logging.info(f"Filter target area using {target_geometry}")
    return gdf[gdf.geometry.within(target_geometry)].copy()


def filter_time_slot(result_file: GeoDataFrame, day_type: str, time_slot: int) -> GeoDataFrame:
    """
    Selects a single time slot from the given GeoDataFrame.
    :param result_file: The GeoDataFrame to filter.
    :param day_type: The day type (weekend or weekday) to select. This is the hour of the beginning of the time slot.
    :param time_slot: The time slot to select. This is the hour of the beginning of the time slot.
    :return: The filtered GeoDataFrame.
    """

    unique_time_windows = [str(tw) for tw in result_file["time_window"].unique()]
    time_slot_timestamp = find_time_slot_in_time_window(unique_time_windows, day_type, time_slot)
    return result_file[result_file["time_window"] == time_slot_timestamp]


def find_time_slot_in_time_window(time_windows: list[str], day_type: str, time_slot: int) -> str:
    requested_time_window = f"{day_type.strip().lower()}_{time_slot}"
    for time_window in time_windows:
        if time_window == requested_time_window:
            return time_window
    else:
        raise ValueError(
            f"Time window {requested_time_window} not found in model result file.",
        )


def is_subdirectory(sub_dir: Path, parent_dir: Path) -> bool:
    """Verifies that the sub_dir is a real subdirectory of parent_dir."""
    try:
        sub_dir.resolve().relative_to(parent_dir.resolve())
        return True
    except ValueError:
        return False


def derive_output_path(simulation_id: SimulationID, is_xai: bool = False):
    output_path = MODEL_OUTPUT_BASE_PATH / simulation_id.user_id / "predictions" / simulation_id.prediction_id
    if is_xai:
        output_path /= "xai"
    return output_path

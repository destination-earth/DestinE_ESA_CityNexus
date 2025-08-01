import logging
from http import HTTPStatus
from pathlib import Path
from typing import Tuple

import pandas as pd
from shapely.geometry.linestring import LineString

COORDINATE = Tuple[float, float]

from fastapi import APIRouter
from starlette.responses import FileResponse

from mobility_model_api.api.v1.analysis import MOBILITY_MODEL_API_PATH
from mobility_model_api.simulation.model_output import (
    is_subdirectory,
    load_as_geodf,
    load_geojson,
)
from mobility_model_api.util.exceptions import MobilityModelException

WORKING_DIRECTORY_PATH = Path("/working_directory")


model_info_router = APIRouter(tags=["Mobility Model Info"])


@model_info_router.get(
    MOBILITY_MODEL_API_PATH + "roads",
    status_code=HTTPStatus.OK.value,
    response_class=FileResponse,
)
async def get_roads_json() -> FileResponse:
    roads_filename = "roads.geojson"
    file_path = _load_from_working_dir(roads_filename)
    return FileResponse(str(file_path.absolute()), media_type="application/json", filename=roads_filename)


@model_info_router.get(
    MOBILITY_MODEL_API_PATH + "grid",
    status_code=HTTPStatus.OK.value,
    response_class=FileResponse,
)
async def get_grid_json() -> FileResponse:
    grid_filename = "grid.geojson"
    file_path = _load_from_working_dir(grid_filename)
    return FileResponse(str(file_path.absolute()), media_type="application/json", filename=grid_filename)


@model_info_router.get(
    MOBILITY_MODEL_API_PATH + "schema",
    status_code=HTTPStatus.OK.value,
    response_class=FileResponse,
)
async def get_schema_json() -> FileResponse:
    schema_filename = "schema.json"
    file_path = _load_from_working_dir(schema_filename)
    return FileResponse(str(file_path.absolute()), media_type="application/json", filename=schema_filename)


@model_info_router.get(
    MOBILITY_MODEL_API_PATH + "roads/midpoints",
    status_code=HTTPStatus.OK.value,
    response_class=FileResponse,
)
async def get_roads_midpoints() -> FileResponse:
    midpoints_filename = "roads_midpoints.geojson"

    try:
        # load existing midpoints file
        logging.info("Try retrieving existing midpoints file...")
        midpoints_file_path = _load_from_working_dir(midpoints_filename)
        logging.info("...successful")
    except MobilityModelException:
        # create if it doesn't exist yet
        logging.info("...failed. Create new midpoints file")
        midpoints_file_path = await _create_midpoints_file(midpoints_filename)

    return FileResponse(str(midpoints_file_path.absolute()), media_type="application/json", filename=midpoints_filename)


async def _create_midpoints_file(midpoints_filename: str):
    """
    Create new midpoints file from roads.geojson and store locally.
    :param midpoints_filename: The name of the resulting midpoints file.
    :return: The path including filename where the midpoints file is stored.
    """
    midpoints_file_path = WORKING_DIRECTORY_PATH / midpoints_filename
    roads_filename = "roads.geojson"
    roads_file_path = _load_from_working_dir(roads_filename)
    roads_gdf = load_geojson(roads_file_path, load_as_geodf)
    logging.info("Calculate midpoints")
    roads_gdf[["longitude", "latitude"]] = roads_gdf["geometry"].apply(_calculate_midpoint).apply(pd.Series)
    logging.info(f"Save midpoints file as {midpoints_file_path}")
    roads_gdf.to_file(str(midpoints_file_path), driver="GeoJSON")
    return midpoints_file_path


def _load_from_working_dir(filename: str) -> Path:
    file_path = WORKING_DIRECTORY_PATH / filename
    logging.info(f"Loading {file_path}")
    if not file_path.exists() or not is_subdirectory(file_path, WORKING_DIRECTORY_PATH):
        logging.error(f"Unable to load: {file_path}")
        raise MobilityModelException(f"Requested file not found: {filename}")
    return file_path


def _calculate_midpoint(line: LineString) -> COORDINATE:
    line_coords = list(line.coords)

    n = len(line_coords)
    if n == 0:
        raise MobilityModelException("Empty road segment found.")
    elif n == 1:
        return line_coords[0]
    elif n == 2:
        x_mid = (line_coords[0][0] + line_coords[1][0]) / 2
        y_mid = (line_coords[0][1] + line_coords[1][1]) / 2
        return (x_mid, y_mid)
    else:
        return line_coords[n // 2]

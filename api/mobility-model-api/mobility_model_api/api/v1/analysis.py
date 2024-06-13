import json
import logging
import os
import re
import subprocess
from http import HTTPStatus
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from starlette.responses import FileResponse

from mobility_model_api.model.generic import ApiResponse
from mobility_model_api.model.mobility_model_input import MobilityModelInput

MOBILITY_MODEL_PATH = "/api/v1/mobility-model/"

# TODO(AA): put these paths into configuration
MODEL_INPUT_BASE_PATH = Path("/model_input")
MODEL_OUTPUT_BASE_PATH = Path("/model_output")
MODEL_BIN_PATH = Path("/run_mobility_model")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
api_router = APIRouter(tags=["Mobility Model API"])


@api_router.post(
    MOBILITY_MODEL_PATH + "analysis",
    status_code=HTTPStatus.CREATED.value,
    response_model=ApiResponse,
)
async def run_mobility_analysis(request_body: MobilityModelInput) -> ApiResponse:
    user_id, analysis_id = request_body.user_id.strip(), request_body.analysis_id.strip()
    logger.info(f"Run analysis for: {user_id}/{analysis_id}")

    if not validate_input(user_id, analysis_id):
        raise HTTPException(
            HTTPStatus.NOT_FOUND.value,
            detail="The attributes user_id and analysis_id can only consist of "
            "characters, numbers, hyphens and underscores.",
        )

    input_file = MODEL_INPUT_BASE_PATH / f"{user_id}_{analysis_id}.json"
    output_path = MODEL_OUTPUT_BASE_PATH / user_id / analysis_id

    logger.info(f"Input file: {input_file}")
    logger.info(f"Output path: {output_path}")

    store_input_file(input_file, request_body.mobility_model_input)
    pid = run_model(MODEL_BIN_PATH, input_file, output_path)
    logger.info(f"PID: {pid}")

    return ApiResponse(response="Analysis successfully started.")


@api_router.get(
    MOBILITY_MODEL_PATH + "analysis",
    status_code=HTTPStatus.OK.value,
    response_class=FileResponse,
)
async def retrieve_analysis_result(user_id: str, analysis_id: str):
    user_id, analysis_id = user_id.strip(), analysis_id.strip()
    client_filename = f"{user_id}_{analysis_id}.zip"
    logger.info(f"Get result for: {user_id}/{analysis_id}")

    # The message is always the same to avoid drawing conclusions about the cause of the error.
    error_message = "Requested result is not available."

    if not validate_input(user_id, analysis_id):
        logger.warning("Invalid input")
        raise HTTPException(HTTPStatus.NOT_FOUND.value, detail=error_message)

    result_path = MODEL_OUTPUT_BASE_PATH / user_id / analysis_id
    if not is_subdirectory(result_path, MODEL_OUTPUT_BASE_PATH):
        logger.warning("No subdirectory!")
        raise HTTPException(HTTPStatus.NOT_FOUND.value, detail=error_message)

    result_files = list(result_path.glob("*.zip"))
    logger.info(f"Result files: {result_files}")
    if len(result_files) < 1:
        raise HTTPException(HTTPStatus.NOT_FOUND.value, detail=error_message)

    latest_result_file = max(result_files, key=os.path.getmtime)
    logger.info(f"Latest result file: {latest_result_file}")

    return FileResponse(str(latest_result_file.absolute()), media_type="application/zip", filename=client_filename)


def validate_input(user_id: str, analysis_id: str) -> bool:
    """
    Verifies that user and analysis IDs only container letters, numbers, hyphen and underscore.
    :return: True, if both input strings match the requirements, otherwise false.
    """
    regex = r"[a-zA-Z0-9_-]*"
    correct_user = bool(re.fullmatch(regex, user_id))
    correct_analysis = bool(re.fullmatch(regex, analysis_id))
    return correct_user and correct_analysis


def store_input_file(input_file: Path, content: dict[str, Any]) -> None:
    """
    Stores the JSON request content on the disk for the model to read as input.
    :param input_file: The path of the model input file.
    :param content: The JSON content of the model input file.
    """
    input_file.parent.mkdir(parents=True, exist_ok=True)
    with open(input_file, "w") as file:
        json.dump(content, file, indent=2)


def run_model(model_bin: Path, input_file: Path, output_path: Path) -> int:
    """
    Executes the model locally and provides the input JSON file path as well as the output path.
    :param model_bin: The file path of the model executable.
    :param input_file: The file path of the model input file.
    :param output_path: The file path of the model output.
    :return: The ID of the model process.
    """
    run_cmd = [
        str(model_bin.absolute()),
        "--json-path",
        str(input_file.absolute()),
        "--output-path",
        str(output_path.absolute()),
    ]
    print(" ".join(run_cmd))
    output_path.mkdir(parents=True, exist_ok=True)
    proc = subprocess.Popen(run_cmd, start_new_session=True)
    return proc.pid


def is_subdirectory(sub_dir: Path, parent_dir: Path) -> bool:
    """
    Verifies that the sub_dir is a real subdirectory of parent_dir.
    """
    try:
        sub_dir.resolve().relative_to(parent_dir.resolve())
        return True
    except ValueError:
        return False


class MobilityModelException(Exception):
    """Top-level exception for errors within the mobility-model endpoints."""

    pass

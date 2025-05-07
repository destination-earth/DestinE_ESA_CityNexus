import logging
from http import HTTPStatus
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse

from flood_model_api.model.flood_model_input import FloodSimulationInput, SimulationID
from flood_model_api.simulation.model_output import (
    MODEL_OUTPUT_BASE_PATH,
    derive_client_filename,
    derive_output_file,
    is_subdirectory,
)
from flood_model_api.simulation.model_run import run_model

FLOOD_MODEL_API_PATH = "/api/v1/flood-model/"

api_router = APIRouter(tags=["Flood Model API"])


@api_router.post(FLOOD_MODEL_API_PATH + "analysis", status_code=HTTPStatus.OK.value)
async def run_flood_simulation(background_tasks: BackgroundTasks, request_body: FloodSimulationInput) -> dict[str, str]:
    sim_id = request_body.simulation_id
    logging.info(f"Start simulation: {sim_id}")

    output_file = derive_output_file(sim_id)

    background_tasks.add_task(run_model, request_body.flood_model_input, output_file)
    logging.info(f"Output file: {output_file}")
    logging.info(f"End of simulation: {sim_id}")

    return {"message": "Simulation started successfully"}


@api_router.get(
    FLOOD_MODEL_API_PATH + "analysis",
    status_code=HTTPStatus.OK.value,
    response_class=FileResponse,
)
async def retrieve_simulation_result(simulation_id: SimulationID = Depends()) -> FileResponse:
    logging.info(f"Get result for: {simulation_id}")

    error_message = "Requested result is not available."
    output_file = derive_output_file(simulation_id)

    if not is_subdirectory(output_file.parent, MODEL_OUTPUT_BASE_PATH):
        logging.exception("Invalid file system access: {output_file} is not a subdirectory of the model output path.")
        raise HTTPException(HTTPStatus.NOT_FOUND.value, detail=error_message)

    if not output_file.exists():
        logging.exception("Requested result is not available")
        raise HTTPException(HTTPStatus.NOT_FOUND.value, detail=error_message)

    return FileResponse(str(output_file), media_type="image/tiff", filename="flood_model_result.tiff")

import logging
from asyncio import Semaphore
from http import HTTPStatus
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from starlette.responses import FileResponse

from mobility_model_api.model.generic import SimulationStatus, StatusResponse, XAIResultFile
from mobility_model_api.model.mobility_model_input import (
    MobilityModelInput,
    SimulationID,
)
from mobility_model_api.simulation.model_input import (
    derive_input_file_path,
    store_input_file,
)
from mobility_model_api.simulation.model_output import (
    derive_output_path,
    find_latest_file,
)
from mobility_model_api.simulation.model_run import run_model, run_xai_blackbox
from mobility_model_api.util.exceptions import InvalidAccessException, NoResultException
from mobility_model_api.simulation.xai_blackbox import XAI_IMPACT_FILENAME, XAI_DIFFERENCE_FILENAME
from mobility_model_api.simulation.xai_record import XAIException

MOBILITY_MODEL_API_PATH = "/api/v1/mobility-model/"


api_router = APIRouter(tags=["Mobility Model API"])

tasks: List[SimulationID] = []
model_semaphore = Semaphore(2)


@api_router.post(
    MOBILITY_MODEL_API_PATH + "analysis",
    status_code=HTTPStatus.CREATED.value,
    response_model=StatusResponse,
)
async def run_mobility_simulation(
    background_tasks: BackgroundTasks, request_body: MobilityModelInput
) -> StatusResponse:
    too_many_total_simulations_msg = "There are too many simulations running."

    if any(request_body.simulation_id.user_id == t.user_id for t in tasks):
        logging.info(f"User {request_body.simulation_id.user_id} already runs a simulation.")
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail="The user already runs a simulation.")

    if not model_semaphore.acquire():
        logging.info(too_many_total_simulations_msg)
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=too_many_total_simulations_msg)

    if len(tasks) > 2:
        logging.warning("More than two tasks registered. This might be a bug in semaphore handing!")
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=too_many_total_simulations_msg)

    background_tasks.add_task(start_simulation, request_body)
    return StatusResponse(simulation_id=request_body.simulation_id, status=SimulationStatus.IN_PROGRESS)


@api_router.get(
    MOBILITY_MODEL_API_PATH + "analysis",
    status_code=HTTPStatus.OK.value,
    response_class=FileResponse,
)
async def retrieve_simulation_result(simulation_id: SimulationID = Depends()) -> FileResponse:
    logging.info(f"Get result for: {simulation_id}")

    error_message = "Requested result is not available."
    try:
        output_path = derive_output_path(simulation_id)
        latest_result_file = find_latest_file(output_path, "*.zip")
    except NoResultException:
        logging.exception("Requested result is not available")
        raise HTTPException(HTTPStatus.NOT_FOUND.value, detail=error_message)
    except InvalidAccessException:
        logging.exception("Invalid file system access")
        raise HTTPException(HTTPStatus.NOT_FOUND.value, detail=error_message)

    logging.info(f"Latest result file: {latest_result_file}")

    client_filename = f"{simulation_id.user_id}_{simulation_id.prediction_id}.zip"
    return FileResponse(str(latest_result_file.absolute()), media_type="application/zip", filename=client_filename)


@api_router.get(
    MOBILITY_MODEL_API_PATH + "analysis/xai/{result_file}",
    status_code=HTTPStatus.OK.value,
    response_class=FileResponse,
)
async def retrieve_xai_result(result_file: XAIResultFile, simulation_id: SimulationID = Depends()) -> FileResponse:
    logging.info(f"Get XAI result file {result_file} for: {simulation_id}")

    error_message = "Requested XAI result file is not available."
    try:
        output_path = derive_output_path(simulation_id)
        if result_file == XAIResultFile.IMPACT:
            filename = XAI_IMPACT_FILENAME
        elif result_file == XAIResultFile.DIFFERENCE:
            filename = XAI_DIFFERENCE_FILENAME
        else:
            raise XAIException(f"There is no XAI result file {result_file}.")
        xai_result_file = find_latest_file(output_path, filename)
    except NoResultException:
        logging.exception("Requested XAI result is not available")
        raise HTTPException(HTTPStatus.NOT_FOUND.value, detail=error_message)
    except InvalidAccessException:
        logging.exception("Invalid file system access")
        raise HTTPException(HTTPStatus.NOT_FOUND.value, detail=error_message)

    logging.info(f"XAI result file: {xai_result_file}")

    client_filename = f"{simulation_id.user_id}_{simulation_id.prediction_id}_{filename}"
    return FileResponse(str(xai_result_file.absolute()), media_type="application/json", filename=client_filename)


@api_router.get(
    MOBILITY_MODEL_API_PATH + "analysis/trajectories",
    status_code=HTTPStatus.OK.value,
    response_class=FileResponse,
)
async def retrieve_trajectories(simulation_id: SimulationID = Depends()) -> FileResponse:
    logging.info(f"Get trajectories file for: {simulation_id}")

    error_message = "Requested trajectories file is not available."
    try:
        output_path = derive_output_path(simulation_id)
        latest_trajectories_file = find_latest_file(output_path, "*.csv")
    except NoResultException:
        logging.exception(error_message)
        raise HTTPException(HTTPStatus.NOT_FOUND.value, detail=error_message)
    except InvalidAccessException:
        logging.exception("Invalid file system access")
        raise HTTPException(HTTPStatus.NOT_FOUND.value, detail=error_message)

    logging.info(f"Latest trajectories file: {latest_trajectories_file}")

    client_filename = f"{simulation_id.user_id}_{simulation_id.prediction_id}.csv"
    return FileResponse(str(latest_trajectories_file.absolute()), media_type="text/csv", filename=client_filename)


@api_router.get(
    MOBILITY_MODEL_API_PATH + "analysis/status", status_code=HTTPStatus.OK.value, response_model=StatusResponse
)
async def get_status(simulation_id: SimulationID = Depends()) -> StatusResponse:
    logging.debug(f"Current tasks: {tasks}")

    if simulation_id in tasks:
        status = SimulationStatus.IN_PROGRESS
    else:
        # at this point the process is either completed (result exists),
        # not available (invalid prediction_id) or failed (no result).
        try:
            output_path = derive_output_path(simulation_id)
            latest_result_file = find_latest_file(output_path, "*.zip")
            if latest_result_file:
                status = SimulationStatus.COMPLETED
            else:
                status = SimulationStatus.NOT_AVAILABLE
        except NoResultException:
            status = SimulationStatus.FAILED
        except InvalidAccessException:
            status = SimulationStatus.NOT_AVAILABLE

    return StatusResponse(simulation_id=simulation_id, status=status)


def start_simulation(request_body):
    """
    Function used as task that performs all actions to run a prediction on the mobility model.
        - creates and stores the model input file
        - determines the model output path
        - runs the model process
        - does task and semaphore management
    """
    try:
        logging.info(f"Start simulation: {request_body.simulation_id}")
        tasks.append(request_body.simulation_id)
        logging.debug(f"Current tasks: {tasks}")

        input_file = derive_input_file_path(request_body.simulation_id)
        output_path = derive_output_path(request_body.simulation_id)
        logging.info(f"Input file: {input_file}")
        logging.info(f"Output path: {output_path}")
        store_input_file(input_file, request_body.mobility_model_input)

        run_model(input_file, output_path, request_body.create_trajectories)
        logging.info(f"Completed simulation: {request_body.simulation_id}")

        if request_body.xai_input:
            try:
                run_xai_blackbox(
                    request_body.simulation_id,
                    request_body.mobility_model_input,
                    [tuple(aoi) for aoi in request_body.xai_input.area_of_interest],
                    request_body.xai_input.attribute,
                    request_body.xai_input.day_type,
                    request_body.xai_input.time_slot,
                )
            except:
                # catch all exceptions on purpose so that if anything fails in XAI, at least the simulation completes
                logging.exception("Failed to run all XAI simulations.")
            else:
                logging.info("XAI simulations successfully completed.")
    finally:
        tasks.remove(request_body.simulation_id)
        model_semaphore.release()

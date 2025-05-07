import logging
import time
from asyncio import Semaphore
from http import HTTPStatus
from typing import List

import requests
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from starlette.responses import FileResponse
from mobility_model_api.config import config

from mobility_model_api.model.generic import (
    SimulationStatus,
    StatusResponse,
    XAIResultFile,
)
from mobility_model_api.model.mobility_model_input import (
    MobilityModelInput,
    SimulationID,
)
from mobility_model_api.simulation.model_input import (
    derive_input_file_path,
    derive_flood_model_file_path,
    store_input_file,
)
from mobility_model_api.simulation.model_output import (
    derive_output_path,
    find_latest_file,
)
from mobility_model_api.simulation.model_run import run_model, run_xai_blackbox
from mobility_model_api.simulation.xai_blackbox import (
    XAI_DIFFERENCE_FILENAME,
    XAI_IMPACT_FILENAME,
)
from mobility_model_api.simulation.xai_record import XAIException
from mobility_model_api.util.exceptions import InvalidAccessException, NoResultException

city = config.mobility["city"]
MOBILITY_MODEL_API_PATH = f"/api/v1/mobility-model-{city}/"
api_router = APIRouter(tags=["Mobility Model Simulation"])

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
            filename = f"*{XAI_IMPACT_FILENAME}"
        elif result_file == XAIResultFile.DIFFERENCE:
            filename = f"*{XAI_DIFFERENCE_FILENAME}"
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

    client_filename = f"{simulation_id.user_id}_{simulation_id.prediction_id}_trajectories.csv"
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

    task_id = request_body.simulation_id
    logging.info(f"Start simulation: {task_id}")

    try:
        if task_id not in tasks:
            tasks.append(task_id)
        logging.info(f"Current tasks: {tasks}")

        input_file = derive_input_file_path(request_body.simulation_id)
        output_path = derive_output_path(request_body.simulation_id)
        logging.info(f"Input file: {input_file}")
        logging.info(f"Output path: {output_path}")
        store_input_file(input_file, request_body.mobility_model_input)

        if request_body.flood_model_input:
            flood_model_result_file = None
            max_retries = 20
            retry_delay = 15  # 1 minute

            for attempt in range(max_retries):
                try:
                    time.sleep(retry_delay)
                    response = requests.get(config.flood['url'], params=request_body.simulation_id)
                    response.raise_for_status()
                    flood_model_result_file = response.content
                    logging.info(f"Successfully retrieved flood model result (attempt {attempt + 1}/{max_retries})")
                    break
                except requests.RequestException as e:
                    logging.warning(f"Failed to retrieve flood model result (attempt {attempt + 1}/{max_retries}): {e}")

            if flood_model_result_file is None:
                raise Exception(f"Failed to retrieve flood model result after {max_retries} attempts")

            # Store the resulting file to be sent later to run_model
            flood_model_input_file = derive_flood_model_file_path(request_body.simulation_id)
            flood_model_input_file.write_bytes(flood_model_result_file)
            logging.info(f"Flood model input file: {flood_model_input_file}")

            run_model(input_file, output_path, request_body.create_trajectories, flood_model_input_file)
        else:
            run_model(input_file, output_path, request_body.create_trajectories, None)

        logging.info(f"End of simulation: {request_body.simulation_id}")

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
                logging.info("End of XAI simulations.")
    finally:
        if task_id in tasks:
            tasks.remove(task_id)
        model_semaphore.release()

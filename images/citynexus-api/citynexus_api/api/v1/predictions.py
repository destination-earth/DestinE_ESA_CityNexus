import json
import os.path
import zipfile
from uuid import uuid4

import requests
from fastapi import APIRouter, Body, Depends, HTTPException, Query
from requests import HTTPError
from starlette.responses import FileResponse

from citynexus_api.config import config
from citynexus_api.middleware.keycloak import get_user, is_logged_in
from citynexus_api.model.create_prediction_input import CreatePredictionInput
from citynexus_api.model.map_type import MapType
from citynexus_api.model.user import User
from citynexus_api.util.data_accessor import default_project_names
from citynexus_api.util.backend_service import available_predictions_file, DayType, delete_available_prediction, \
    create_new_prediction, find_prediction_zips, find_xai_output, merge_geojson_from_zips, \
    monitor_available_predictions, data_accessor, log, get_available_scenarios, run_external_model

router = APIRouter(tags=["CityNexus Predictions API"])

@router.get("", response_class=FileResponse)
async def get_predictions(user: User = Depends(get_user)):
    monitor_available_predictions(user["user"])
    try:
        response = data_accessor.get_file_response(
            user["user"], os.path.join("predictions", available_predictions_file), create=True
        )
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response
    except Exception:
        log.exception("Error getting available predictions.")
        raise HTTPException(status_code=404, detail="File not available")


@router.get("/{prediction_id}/{map_type}", response_class=FileResponse)
async def get_prediction(
    prediction_id: str,
    map_type: MapType,
    user: User = Depends(get_user),
    day_type: DayType = Query(None, description="Day type"),
    city: str = Query("copenhagen", description="City name"),
):
    try:
        log.info(
            f"get_prediction: prediction_id={prediction_id}, map_type={map_type}, day_type={day_type}, user_id={user['user']}, city={city}"
        )
        match map_type:
            case MapType.data:
                prediction_zips = find_prediction_zips(user["user"], prediction_id, day_type.value)
                if not prediction_zips:
                    prediction_zips = find_prediction_zips(None, prediction_id, day_type.value)

                if prediction_zips:
                    if len(prediction_zips) > 1:
                        merge_geojson_from_zips(user["user"], prediction_zips, prediction_zips[0])
                    return data_accessor.get_file_response_custom(prediction_zips[0])
            case MapType.xai_impact | MapType.xai_diff:
                xai_file = await get_xai_file(map_type, prediction_id, user)

                if xai_file:
                    return data_accessor.get_file_response_custom(xai_file[0])
            case MapType.xai:
                xai_impact_file = await get_xai_file(MapType.xai_impact, prediction_id, user)
                xai_diff_file = await get_xai_file(MapType.xai_diff, prediction_id, user)

                if xai_impact_file and xai_diff_file:
                    xai_zip = f"{prediction_id}_{city}_{day_type}_xai.zip"
                    with zipfile.ZipFile(xai_zip, "w", zipfile.ZIP_DEFLATED, compresslevel=-12) as zip_file:
                        zip_file.write(xai_impact_file[0], arcname="xai_impact.geojson")
                        zip_file.write(xai_diff_file[0], arcname="xai_diffs.geojson")
                    return data_accessor.get_file_response_custom(xai_zip)
            case MapType.config:
                return data_accessor.get_file_response(None, os.path.join("base_map", "base_prediction", city, "config.json"))
    except Exception:
        log.exception("Error loading prediction file")
        raise HTTPException(status_code=500, detail="Error loading prediction file")

    raise HTTPException(status_code=404, detail=f"Prediction file {prediction_id} with map type {map_type}, day type {day_type} and city {city} not found")


async def get_xai_file(map_type, prediction_id, user):
    xai_file = find_xai_output(user["user"], prediction_id, map_type)
    if not xai_file:
        xai_file = find_xai_output(None, prediction_id, map_type)
    return xai_file


@router.post("", response_model=str)
def create_prediction(
    create_prediction_input: CreatePredictionInput = Body(), user: User = Depends(get_user), name: str = Query(None, description="Prediction name")
):
    if not is_logged_in(user):
        raise HTTPException(status_code=403, detail="Forbidden")

    prediction_id = str(uuid4())
    flood_model_config = create_prediction_input.flood_model_input
    xai_config = create_prediction_input.xai_input
    scenario_id = create_prediction_input.scenarioId

    scenarios = get_available_scenarios(user["user"])
    scenario = next((scenario for scenario in scenarios if scenario["id"] == scenario_id), None)
    if scenario:
        city = scenario.get("city")
        project = scenario.get("project")
    else:
        city = None
        project = None
    mobility_model_url = config.mobility["url"].format(city=f"-{city}" if project != "immerseon" else "")

    # if we have immerseon related data, run the flood model
    if flood_model_config:
        try:
            flood_model_input = {
                "simulation_id": {
                    "user_id": user["user"],
                    "prediction_id": prediction_id,
                },
                "flood_model_input": flood_model_config,
            }
            run_external_model(flood_model_input, config.flood["url"])
        except requests.RequestException:
            log.exception("Error calling flood model analysis API")
            raise HTTPException(status_code=500, detail="Error calling flood model analysis API")

    try:
        mobility_model_input = {
            "simulation_id": {
                "user_id": user["user"],
                "prediction_id": prediction_id,
            },
            "mobility_model_input": create_prediction_input.mobility_model_input,
            "flood_model_input": flood_model_config is not None,
            "xai_input": xai_config,
        }

        log.debug(mobility_model_input)
        run_external_model(mobility_model_input, mobility_model_url)
    except Exception as e:
        error_message = f"Error calling mobility model analysis API at {mobility_model_url}: {e.__class__.__name__}"
        log.exception(error_message)
        if isinstance(e, HTTPError) and e.response.status_code == 409:
            raise HTTPException(status_code=500, detail="Too many simulations running, please try again later")
        raise HTTPException(status_code=500, detail=error_message)

    day_types = create_prediction_input.mobility_model_input["scenario"]["day type"]
    scenario = create_prediction_input.mobility_model_input["scenario"]
    for dt in day_types:
        is_xai = xai_config and xai_config["day_type"] == dt
        create_new_prediction(
            user["user"],
            prediction_id,
            scenario_id,
            name,
            dt,
            scenario,
            city,
            project,
            flood_model_config,
            xai_config if is_xai else None,
        )
    return prediction_id


@router.delete("/{prediction_id}", response_model=str)
def delete_prediction(
    prediction_id: str, day_type: DayType = Query(None, description="Day type"), user: User = Depends(get_user)
):
    if not is_logged_in(user) or prediction_id in default_project_names:
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        prediction_zips = find_prediction_zips(user["user"], prediction_id, day_type.value)
        for prediction_zip in prediction_zips:
            if prediction_zip:
                data_accessor.delete_object_custom(prediction_zip)
        is_prediction_deleted = delete_available_prediction(user["user"], prediction_id, day_type.value)
    except Exception:
        log.exception("Error deleting prediction")
        raise HTTPException(status_code=500, detail="Error deleting prediction")

    if not is_prediction_deleted:
        raise HTTPException(status_code=404, detail="Prediction not found")
    else:
        return prediction_id


@router.get("/{name}", response_model=bool)
async def is_prediction_name_used(name: str, scenario_id: str = Query(...), user: User = Depends(get_user)):
    if not is_logged_in(user):
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        with data_accessor.read_file(
            user_id=user["user"], sub_path=os.path.join("predictions", available_predictions_file), create=False
        ) as predictions:
            if predictions:
                predictions_json = json.loads(predictions.read().decode("utf-8"))
                for prediction in predictions_json:
                    if prediction.get("name", None) == name and prediction.get("scenario_id", None) == scenario_id:
                        return True
            return False
    except Exception:
        log.exception("Error finding used prediction names.")
        raise HTTPException(status_code=500, detail="Error finding used prediction names.")

import datetime
import json
import logging
import os.path
from enum import Enum
from typing import List
from uuid import uuid4

import requests
from fastapi import APIRouter, HTTPException, Depends, Query, Body
from starlette.responses import StreamingResponse

from citynexus_api.config import config
from citynexus_api.middleware.keycloak import get_user, is_logged_in
from citynexus_api.model.map_type import MapType
from citynexus_api.model.user import User
from citynexus_api.util.s3_accessor import S3Accessor

router = APIRouter(tags=["CityNexus Predictions API"])
s3_accessor = S3Accessor()
log = logging.getLogger(__name__)


class DayType(str, Enum):
    weekday = "weekday"
    weekend = "weekend"


class ProcessingStatus(str, Enum):
    DONE = "DONE"
    PENDING = "PENDING"
    ERROR = "ERROR"


def get_available_predictions(user_id: str | None):
    try:
        return json.loads(
            s3_accessor.read_file(user_id, "predictions/available_predictions.json", create=True)["Body"]
            .read()
            .decode("utf-8")
        )
    except Exception as _:
        return []


def write_available_predictions(user_id: str | None, predictions: List[dict]):
    s3_accessor.write_file(
        user_id,
        f"predictions/available_predictions.json",
        json.dumps(predictions, indent=2, sort_keys=True, default=str),
    )


def delete_available_prediction(user_id: str | None, prediction_id: str, day_type: str):
    predictions = get_available_predictions(user_id)
    for i, prediction in enumerate(predictions):
        if prediction["id"] == prediction_id and prediction["dayType"] == day_type:
            predictions.pop(i)
            break
    write_available_predictions(user_id, predictions)


def delete_scenario_predictions(user_id: str | None, scenario_id: str):
    predictions = get_available_predictions(user_id)
    for i, prediction in enumerate(predictions):
        if prediction["scenarioId"] == scenario_id:
            prediction_zip = find_prediction_zip(user_id, prediction["id"], prediction["dayType"])
            if prediction_zip:
                s3_accessor.delete_object_custom(prediction_zip)
            predictions.pop(i)
    write_available_predictions(user_id, predictions)


def create_new_prediction(
    user_id: str | None, prediction_id: str, scenario_id: str, name: str, day_type: str, scenario: dict
):
    predictions = get_available_predictions(user_id)
    predictions.append(
        {
            "id": prediction_id,
            "scenarioId": scenario_id,
            "name": name,
            "date": datetime.datetime.utcnow(),
            "timeSlot": scenario["time slots"],
            "bicyclePercentage": scenario["bycicle percentage"],
            "eVehiclePercentage": scenario["evehicle percentage"],
            "dayType": day_type,
            "visible": True,
            "processingStatus": ProcessingStatus.PENDING,
        }
    )
    write_available_predictions(user_id, predictions)


def find_prediction_zip(user_id: str | None, prediction_id: str, day_type: str):
    predictions = s3_accessor.list_bucket(user_id, f"predictions/{prediction_id}")
    for obj in predictions:
        if obj["Key"].endswith(".zip") and day_type in os.path.basename(obj["Key"]):
            return obj["Key"]
    return None


# this checks if there are any pending predictions for the user and if so, if they have finished processing
def monitor_available_predictions(user_id: str | None):
    predictions = get_available_predictions(user_id)
    has_changed = False
    for prediction in predictions:
        if prediction["processingStatus"] == ProcessingStatus.PENDING:
            try:
                s3_objects = s3_accessor.list_bucket(user_id, f'predictions/{prediction["id"]}')
                if not s3_objects:
                    raise Exception("Empty list of predictions")

                for obj in s3_objects:
                    if obj["Key"].endswith(".zip") and prediction["dayType"] in os.path.basename(obj["Key"]):
                        prediction["processingStatus"] = ProcessingStatus.DONE
                        has_changed = True
                        break
            except Exception as _:
                if datetime.datetime.utcnow() - datetime.datetime.strptime(
                    prediction["date"], "%Y-%m-%d %H:%M:%S.%f"
                ) > datetime.timedelta(days=1):
                    prediction["processingStatus"] = ProcessingStatus.ERROR
                    has_changed = True

    if has_changed:
        write_available_predictions(user_id, predictions)


@router.get("", response_class=StreamingResponse)
async def get_predictions(user: User = Depends(get_user)):
    monitor_available_predictions(user["user"])
    try:
        return s3_accessor.get_streaming_response(user["user"], "predictions/available_predictions.json", create=True)
    except Exception as _:
        raise HTTPException(status_code=404, detail="File not available")


@router.get("/{prediction_id}/{map_type}", response_class=StreamingResponse)
async def get_prediction(
    prediction_id: str,
    map_type: MapType,
    user: User = Depends(get_user),
    day_type: DayType = Query(None, description="Day type"),
):
    try:
        if map_type.lower() == MapType.data:
            prediction_zip = find_prediction_zip(user["user"], prediction_id, day_type.value)
            if not prediction_zip:
                prediction_zip = find_prediction_zip(None, prediction_id, day_type.value)

            if prediction_zip:
                return s3_accessor.get_streaming_response_custom(prediction_zip)
            else:
                raise HTTPException(status_code=404, detail="prediction not found")
        else:
            return s3_accessor.get_streaming_response(None, f"base_map/base_prediction/config.json")
    except Exception as _:
        raise HTTPException(status_code=404, detail="prediction not found")


@router.post("", response_model=str)
def create_prediction(
    file_content: dict = Body(), user: User = Depends(get_user), name: str = Query(None, description="Prediction name")
):
    if not is_logged_in(user):
        raise HTTPException(status_code=403, detail="Forbidden")

    scenario_id = file_content["scenarioId"]
    time_slots = file_content["mobility_model_input"]["scenario"]["time slots"]
    day_types = file_content["mobility_model_input"]["scenario"]["day type"]

    prediction_id = str(uuid4())
    try:
        model_input = {
            "simulation_id": {
                "user_id": user["user"],
                "prediction_id": prediction_id,
            },
            "mobility_model_input": file_content["mobility_model_input"],
        }

        log.debug(model_input)
        response = requests.post(config.mobility["url"], json=model_input)
        response.raise_for_status()
    except requests.RequestException:
        log.exception("Error calling mobility model analysis API")
        raise HTTPException(status_code=500, detail=f"Error calling mobility model analysis API")

    for day_type in day_types:
        create_new_prediction(user["user"], prediction_id, scenario_id, name, day_type, scenario)
    return prediction_id


@router.delete("/{prediction_id}", response_model=str)
def delete_prediction(
    prediction_id: str, day_type: DayType = Query(None, description="Day type"), user: User = Depends(get_user)
):
    if not is_logged_in(user) or prediction_id == "2024-06-04":
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        prediction_zip = find_prediction_zip(user["user"], prediction_id, day_type.value)
        if prediction_zip:
            s3_accessor.delete_object_custom(prediction_zip)
        delete_available_prediction(user["user"], prediction_id, day_type.value)
        return prediction_id
    except Exception as _:
        raise HTTPException(status_code=404, detail="prediction not found")


@router.get("/{name}", response_model=bool)
async def is_prediction_name_used(name: str, user: User = Depends(get_user)):
    if not is_logged_in(user):
        raise HTTPException(status_code=403, detail="Forbidden")

    predictions = s3_accessor.read_file(
        user["user"], "predictions/available_predictions.json", create=False, raise_error=True
    )

    if predictions:
        predictions_json = json.loads(predictions["Body"].read().decode("utf-8"))
        for prediction in predictions_json:
            if prediction.get("name", None) == name:
                return True
    return False

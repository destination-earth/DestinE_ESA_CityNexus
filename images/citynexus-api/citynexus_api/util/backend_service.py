import datetime
import json
import logging
import os
from enum import Enum
from typing import Optional, List

import orjson
import requests
import zipfile_isal as zipfile

from citynexus_api.model.map_type import MapType
from citynexus_api.util.data_accessor import DataAccessor

available_predictions_file = "available_predictions.json"
data_zip_file = "data.zip"

data_accessor = DataAccessor()
log = logging.getLogger(__name__)


class DayType(str, Enum):
    weekday = "weekday"
    weekend = "weekend"


class ProcessingStatus(str, Enum):
    DONE = "DONE"
    PENDING = "PENDING"
    ERROR = "ERROR"


def get_available_predictions(user_id: Optional[str]):
    try:
        with data_accessor.read_file(
            user_id=user_id, sub_path=os.path.join("predictions", available_predictions_file), create=True
        ) as data:
            return json.loads(data.read().decode("utf-8"))
    except Exception as e:
        log.exception("Error getting available predictions: " + str(e))
        return []


def write_available_predictions(user_id: Optional[str], predictions: List[dict]):
    data_accessor.write_file(
        user_id,
        os.path.join("predictions", available_predictions_file),
        json.dumps(predictions, indent=2, sort_keys=True, default=str),
    )


def delete_available_prediction(user_id: Optional[str], prediction_id: str, day_type: str):
    predictions = get_available_predictions(user_id)
    for i, prediction in enumerate(predictions):
        if prediction["id"] == prediction_id and prediction["dayType"] == day_type:
            predictions.pop(i)
            write_available_predictions(user_id, predictions)
            return True
    return False


def delete_scenario_predictions(user_id: Optional[str], scenario_id: str):
    predictions = get_available_predictions(user_id)
    remaining_predictions = list()
    for i, prediction in enumerate(predictions):
        if prediction["scenarioId"] == scenario_id:
            prediction_zips = find_prediction_zips(user_id, prediction["id"], prediction["dayType"])
            for prediction_zip in prediction_zips:
                data_accessor.delete_object_custom(prediction_zip)
        else:
            remaining_predictions.append(prediction)
    write_available_predictions(user_id, remaining_predictions)


def create_new_prediction(
    user_id: Optional[str],
    prediction_id: str,
    scenario_id: str,
    name: str,
    day_type: str,
    scenario: dict,
    city: str,
    project: str,
    flood_model: Optional[dict],
    xai_config: Optional[dict],
):
    predictions = get_available_predictions(user_id)
    prediction = {
        "id": prediction_id,
        "scenarioId": scenario_id,
        "name": name,
        "date": datetime.datetime.now(),
        "timeSlot": scenario["time slots"],
        "bicyclePercentage": scenario["bycicle percentage"],
        "eVehiclePercentage": scenario["evehicle percentage"],
        "dayType": day_type,
        "visible": True,
        "city": city,
        "project": project,
        "processingStatus": ProcessingStatus.PENDING,
    }
    if flood_model is not None:
        prediction["floodModel"] = flood_model
    if xai_config is not None:
        prediction["xaiConfig"] = xai_config
    predictions.append(prediction)
    write_available_predictions(user_id, predictions)


def find_prediction_zips(user_id: str | None, prediction_id: str, day_type: str) -> List[str]:
    predictions = data_accessor.list_files_in_folder(user_id, os.path.join("predictions", prediction_id))
    matching_zips = [obj for obj in predictions if obj.endswith(".zip") and day_type in os.path.basename(obj)]
    return matching_zips


def find_xai_output(user_id: str | None, prediction_id: str, xai_type: MapType) -> List[str]:
    try:
        files = data_accessor.list_files_in_folder(user_id, os.path.join("predictions", prediction_id))
        match xai_type:
            case MapType.xai_impact:
                filename = "xai_impact.geojson"
            case MapType.xai_diff:
                filename = "xai_diffs.geojson"
            case _:
                raise FileNotFoundError(f"Invalid xai type {xai_type}")
        return [file for file in files if file.endswith(filename)]
    except Exception:
        logging.exception("Error finding XAI output")
        return []


def merge_geojson_from_zips(user_id: str, zip_files: List[str], output_zip: str):
    merged_geojson = {"type": "FeatureCollection", "features": []}
    name = None
    crs = None
    first_geojson = True

    for zip_file in zip_files:
        with zipfile.ZipFile(zip_file, "r") as z:
            for file_name in z.namelist():
                if file_name.endswith(".geojson"):

                    with z.open(file_name) as f:
                        geojson_data = orjson.loads(f.read())

                        # Take name and crs from the first GeoJSON file
                        if first_geojson:
                            name = geojson_data.get("name", "")
                            crs = geojson_data.get("crs", {})
                            first_geojson = False

                        merged_geojson["features"].extend(geojson_data["features"])

    merged_geojson["name"] = name
    merged_geojson["crs"] = crs

    data_accessor.write_file_compressed(
        user_id=user_id,
        object_key=output_zip,
        content=orjson.dumps(merged_geojson),
        file_type="geojson",
        is_custom=True,
    )

    # Remove the remaining zip files except the first one
    for zip_file in zip_files[1:]:
        data_accessor.delete_object_custom(zip_file)

    # Remove all .csv files in the same folder as output_zip
    output_folder = os.path.dirname(output_zip)
    for file in data_accessor.list_files_in_folder(user_id, output_folder):
        if file.endswith(".csv"):
            data_accessor.delete_object_custom(file)


# this checks if there are any pending predictions for the user and if so, if they have finished processing
def monitor_available_predictions(user_id: str | None):
    predictions = get_available_predictions(user_id)
    has_changed = False
    for prediction in predictions:
        if prediction["processingStatus"] == ProcessingStatus.PENDING:
            try:
                result_files = data_accessor.list_files_in_folder(user_id, os.path.join("predictions", prediction["id"]))
                if not result_files:
                    raise Exception("Empty list of predictions")

                for obj in result_files:
                    if obj.endswith(".zip") and prediction["dayType"] in os.path.basename(obj):
                        prediction["processingStatus"] = ProcessingStatus.DONE
                        has_changed = True
                        break
            except Exception:
                if datetime.datetime.now() - datetime.datetime.strptime(
                    prediction["date"], "%Y-%m-%d %H:%M:%S.%f"
                ) > datetime.timedelta(days=1):
                    prediction["processingStatus"] = ProcessingStatus.ERROR
                    has_changed = True

    if has_changed:
        write_available_predictions(user_id, predictions)


available_datasets_file = "available_datasets.json"


def get_available_scenarios(user_id: str | None):
    try:
        with data_accessor.read_file(
            user_id=user_id,
            sub_path=os.path.join("scenarios", available_datasets_file),
            create=True
        ) as data:
            return json.loads(data.read().decode("utf-8"))
    except Exception as e:
        log.exception("Error getting available scenarios: " + str(e))
        return []


def write_available_scenarios(user_id: str | None, scenarios: List[dict]):
    data_accessor.write_file(
        user_id,
        os.path.join("scenarios", available_datasets_file),
        json.dumps(scenarios, indent=2, sort_keys=True, default=str)
    )


def find_available_scenario(user_id: str | None, scenario_id: str):
    scenarios = get_available_scenarios(user_id)
    for i, scenario in enumerate(scenarios):
        if scenario["id"] == scenario_id:
            return i, scenarios
    return None, scenarios


def delete_available_scenario(user_id: str | None, scenario_id: str):
    scenarios = get_available_scenarios(user_id)
    for i, scenario in enumerate(scenarios):
        if scenario["id"] == scenario_id:
            scenarios.pop(i)
            data_accessor.write_file(user_id, os.path.join("scenarios", available_datasets_file), json.dumps(scenarios))
            return True
    return False


def update_existing_scenario(user_id: str | None, idx: int, name: str, scenarios: List[dict], nb_changes: int):
    scenarios[idx]["name"] = name
    scenarios[idx]["size"] = nb_changes
    write_available_scenarios(user_id, scenarios)


def create_new_scenario(
    user_id: str | None, scenario_id: str, name: str, description: str, nb_changes: int, project: str, city: str
):
    scenarios = get_available_scenarios(user_id)
    scenarios.append(
        {
            "id": scenario_id,
            "label": name,
            "description": description,
            "project": project,
            "imageUrl": f"https://twincity-data.s3.de.io.cloud.ovh.net/img/thumbnail_{project}.jpg",
            "size": nb_changes,
            "visible": True,
            "city": city
        }
    )
    write_available_scenarios(user_id, scenarios)


def run_external_model(model_input, model_url):
    response = requests.post(model_url, json=model_input)
    response.raise_for_status()

import json
from typing import List
from uuid import uuid4

from botocore.exceptions import ClientError
from fastapi import APIRouter, HTTPException, Depends, Body, Query
from starlette.responses import StreamingResponse

from citynexus_api.api.v1.predictions import delete_scenario_predictions
from citynexus_api.middleware.keycloak import get_user, is_logged_in
from citynexus_api.model.map_name import MapName
from citynexus_api.model.map_type import MapType
from citynexus_api.model.project_name import ProjectName
from citynexus_api.model.user import User
from citynexus_api.util.s3_accessor import S3Accessor

router = APIRouter(tags=["CityNexus Scenarios API"])
s3_accessor = S3Accessor()


def get_available_scenarios(user_id: str | None):
    try:
        return json.loads(
            s3_accessor.read_file(user_id, "scenarios/available_datasets.json", create=True)["Body"]
            .read()
            .decode("utf-8")
        )
    except Exception as _:
        return []


def write_available_scenarios(user_id: str | None, scenarios: List[dict]):
    s3_accessor.write_file(
        user_id, f"scenarios/available_datasets.json", json.dumps(scenarios, indent=2, sort_keys=True, default=str)
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
            break
    s3_accessor.write_file(user_id, f"scenarios/available_datasets.json", json.dumps(scenarios))


def update_existing_scenario(user_id: str | None, idx: int, name: str, scenarios: List[dict], nb_changes: int):
    scenarios[idx]["name"] = name
    scenarios[idx]["size"] = nb_changes
    write_available_scenarios(user_id, scenarios)


def create_new_scenario(
    user_id: str | None, scenario_id: str, name: str, description: str, nb_changes: int, project: str
):
    scenarios = get_available_scenarios(user_id)
    scenarios.append(
        {
            "id": scenario_id,
            "label": name,
            "description": description,
            "project": project,
            "imageUrl": f"https://twincity-data.s3.de.io.cloud.ovh.net/img/thumbnail-{project}.jpg",
            "size": nb_changes,
            "visible": True,
        }
    )
    write_available_scenarios(user_id, scenarios)


@router.get("", response_class=StreamingResponse)
async def get_scenarios(user: User = Depends(get_user)):
    try:
        return s3_accessor.get_streaming_response(user["user"], "scenarios/available_datasets.json", create=True)
    except Exception as _:
        raise HTTPException(status_code=404, detail="File not available")


@router.get("/{scenario_id}/{map_name}/{map_type}", response_class=StreamingResponse)
async def get_scenario_user_changes_data(
    scenario_id: str, map_name: MapName, map_type: MapType, user: User = Depends(get_user)
):
    try:
        if map_name == MapName.user_changes:
            try:
                return s3_accessor.get_streaming_response(user["user"], f"scenarios/{scenario_id}/data.zip")
            except ClientError as ex:
                # if there are no user changes saved, load the default scenario's empty user changes
                if ex.response["Error"]["Code"] == "NoSuchKey":
                    return s3_accessor.get_streaming_response(None, f"scenarios/default_scenario/data.zip")
                else:
                    raise
        else:
            if map_type == MapType.data:
                return s3_accessor.get_streaming_response(None, f"base_map/{map_name.name}/data.zip")
            else:
                return s3_accessor.get_streaming_response(None, f"base_map/{map_name.name}/config.json")
    except Exception as _:
        raise HTTPException(status_code=404, detail="Scenario not found")


@router.post("", response_model=str)
def create_scenario(
    file_content: dict = Body(),
    user: User = Depends(get_user),
    name: str = Query(None, description="Scenario name"),
    project: ProjectName = Query(None, description="Project name"),
):
    if not is_logged_in(user) or not project in user["roles"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    scenario_id = str(uuid4())
    data = file_content["data"]
    description = file_content["description"]
    s3_accessor.write_file_compressed(
        user["user"],
        f"scenarios/{scenario_id}/data.zip",
        json.dumps(data, indent=2, sort_keys=True, default=str),
        "json",
    )

    mobility_model_input = data["changes"]["mobility_model_input"]
    nb_changes = len(mobility_model_input["grid"]) + len(mobility_model_input["road_network"])
    create_new_scenario(user["user"], scenario_id, name, description, nb_changes, project)
    return scenario_id


@router.put("/{scenario_id}", response_model=str)
def update_scenario(
    scenario_id: str,
    file_content: dict = Body(),
    user: User = Depends(get_user),
    name: str = Query(None, description="Scenario name"),
):
    if not is_logged_in(user):
        raise HTTPException(status_code=403, detail="Forbidden")

    idx, scenarios = find_available_scenario(user["user"], scenario_id)
    if idx is None:
        raise HTTPException(status_code=404, detail=f"Scenario id {scenario_id} not found")

    s3_accessor.write_file_compressed(
        user["user"],
        f"scenarios/{scenario_id}/data.zip",
        json.dumps(file_content, indent=2, sort_keys=True, default=str),
        "json",
    )
    nb_changes = len(file_content["changes"]["mobility_model_input"]["grid"]) + len(
        file_content["changes"]["mobility_model_input"]["road_network"]
    )
    update_existing_scenario(user["user"], idx, name, scenarios, nb_changes)
    return scenario_id


@router.delete("/{scenario_id}", response_model=str)
def delete_scenario(scenario_id: str, user: User = Depends(get_user)):
    if not is_logged_in(user) or scenario_id == "default_scenario":
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        delete_scenario_predictions(user["user"], scenario_id)
        s3_accessor.delete_object(user["user"], f"scenarios/{scenario_id}/data.zip")
        delete_available_scenario(user["user"], scenario_id)
        return scenario_id
    except Exception as _:
        raise HTTPException(status_code=404, detail="Scenario not found")


@router.get("/{name}", response_model=bool)
async def is_scenario_name_used(name: str, user: User = Depends(get_user)):
    if not is_logged_in(user):
        raise HTTPException(status_code=403, detail="Forbidden")

    scenarios = s3_accessor.read_file(user["user"], "scenarios/available_datasets.json", create=False, raise_error=True)

    if scenarios:
        scenarios_json = json.loads(scenarios["Body"].read().decode("utf-8"))
        for scenario in scenarios_json:
            if scenario.get("label", None) == name:
                return True
    return False

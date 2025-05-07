import json
import os.path
from uuid import uuid4
import zipfile
import io
from fastapi import APIRouter, HTTPException, Depends, Request, Query
from starlette.responses import FileResponse

from citynexus_api.model.create_scenario_input import CreateScenarioInput
from citynexus_api.util.backend_service import delete_scenario_predictions, available_datasets_file, \
    find_available_scenario, delete_available_scenario, update_existing_scenario, create_new_scenario, data_accessor, \
    data_zip_file
from citynexus_api.middleware.keycloak import get_user, is_logged_in
from citynexus_api.model.map_name import MapName
from citynexus_api.model.map_type import MapType
from citynexus_api.model.project_name import ProjectName
from citynexus_api.model.user import User
from citynexus_api.util.data_accessor import default_project_names

router = APIRouter(tags=["CityNexus Scenarios API"])

@router.get("", response_class=FileResponse)
async def get_scenarios(user: User = Depends(get_user)):
    try:
        response = data_accessor.get_file_response(user["user"], os.path.join("scenarios", available_datasets_file), create=True)
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response
    except Exception as _:
        raise HTTPException(status_code=404, detail="File not available")


@router.get("/{scenario_id}/{map_name}/{map_type}", response_class=FileResponse)
async def get_scenario_user_changes_data(
    scenario_id: str, map_name: MapName, map_type: MapType, user: User = Depends(get_user)
):
    try:
        if map_name == MapName.user_changes:
            try:
                return data_accessor.get_file_response(user["user"], os.path.join("scenarios", scenario_id, data_zip_file))
            except FileNotFoundError:
                # if there are no user changes saved, load the default scenario's empty user changes
                return data_accessor.get_file_response(None, os.path.join("scenarios", scenario_id, data_zip_file))
        else:
            if map_type == MapType.data:
                return data_accessor.get_file_response(None, os.path.join("base_map", map_name.name, scenario_id, data_zip_file))
            else:
                return data_accessor.get_file_response(None, os.path.join("base_map", map_name.name, scenario_id, "config.json"))
    except Exception as _:
        raise HTTPException(status_code=404, detail="Scenario not found")


@router.post("", response_model=str)
async def create_scenario(
    request: Request,
    user: User = Depends(get_user),
    name: str = Query(None, description="Scenario name"),
    project: ProjectName = Query(None, description="Project name"),
    city: str = Query(None, description="City name"),
):
    if not is_logged_in(user):
        raise HTTPException(status_code=403, detail="Forbidden")

    # Check for zip encoding
    if request.headers.get("content-encoding", "").lower() == "zip":
        # Read the zipped body
        body = await request.body()
        with zipfile.ZipFile(io.BytesIO(body), 'r') as zip_ref:
            with zip_ref.open('data.json') as data_file:
                file_content: CreateScenarioInput = json.load(data_file)
        description = file_content.get('description', '')
        data = file_content.get('data')
    else:
        # Fallback to old behavior
        file_content: CreateScenarioInput = await request.json()
        description = file_content.get('description', '')
        data = file_content.get('data')

    scenario_id = str(uuid4())
    data_accessor.write_file_compressed(
        user["user"],
        os.path.join("scenarios", scenario_id, data_zip_file),
        json.dumps(data, indent=2, sort_keys=True, default=str),
        "json",
    )

    mobility_model_input = data["changes"]["mobility_model_input"]
    nb_changes = len(mobility_model_input["grid"]) + len(mobility_model_input["road_network"])
    create_new_scenario(user["user"], scenario_id, name, description, nb_changes, project.value, city)
    return scenario_id


@router.put("/{scenario_id}", response_model=str)
async def update_scenario(
    scenario_id: str,
    request: Request,
    user: User = Depends(get_user),
    name: str = Query(None, description="Scenario name"),
):
    if not is_logged_in(user):
        raise HTTPException(status_code=403, detail="Forbidden")

    idx, scenarios = find_available_scenario(user["user"], scenario_id)
    if idx is None:
        raise HTTPException(status_code=404, detail=f"Scenario id {scenario_id} not found")

    # Check for zip encoding
    if request.headers.get("content-encoding", "").lower() == "zip":
        body = await request.body()
        with zipfile.ZipFile(io.BytesIO(body), 'r') as zip_ref:
            with zip_ref.open('data.json') as data_file:
                file_content = json.load(data_file)
    else:
        file_content = await request.json()

    data_accessor.write_file_compressed(
        user["user"],
        os.path.join("scenarios", scenario_id, data_zip_file),
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
    if not is_logged_in(user) or scenario_id in default_project_names:
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        delete_scenario_predictions(user["user"], scenario_id)
        data_accessor.delete_object(user["user"], os.path.join("scenarios", scenario_id, data_zip_file))
        is_scenario_deleted = delete_available_scenario(user["user"], scenario_id)
    except Exception as _:
        raise HTTPException(status_code=500, detail=f"Error when deleting scenario {scenario_id}")

    if not is_scenario_deleted:
        raise HTTPException(status_code=404, detail=f"Scenario {scenario_id} not found")
    else:
        return scenario_id


@router.get("/{name}", response_model=bool)
async def is_scenario_name_used(name: str, city: str = Query(...), user: User = Depends(get_user)):
    if not is_logged_in(user):
        raise HTTPException(status_code=403, detail="Forbidden")

    with data_accessor.read_file(user["user"], os.path.join("scenarios", available_datasets_file), create=False) as scenarios:
        if scenarios:
            scenarios_json = json.loads(scenarios.read().decode("utf-8"))
            for scenario in scenarios_json:
                if scenario.get("label", None) == name and scenario.get("city", None) == city:
                    return True
        return False

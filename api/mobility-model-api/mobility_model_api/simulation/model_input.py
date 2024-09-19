import json
from copy import deepcopy
from pathlib import Path
from typing import Any

from mobility_model_api.model.generic import SimulationID
from mobility_model_api.simulation.xai_record import XAIRecord, XAIRecordType

MODEL_INPUT_BASE_PATH = Path("/model_input")


def create_xai_records(model_input: dict[str, any], day_type: str, time_slot: int) -> list[XAIRecord]:
    """
    Creates a full set of model inputs required by the XAI blackbox approach.
    The set contains a JSON input for each road_id with all modifications except that road_id.
    :param model_input: The model_input as defined by the user.
    :param day_type: The day type (weekend or weekday) of the simulation used in the XAI analysis.
    :param time_slot: The time slot of the simulation used in the XAI analysis.
    :return: A list of modified model inputs.
    """
    return [
        XAIRecord(
            XAIRecordType.MODIFICATION,
            road_id=road_id,
            model_input=create_model_input_modification(model_input, road_id, day_type, time_slot),
        )
        for road_id in get_road_ids(model_input)
    ]


def store_input_file(input_file: Path, content: dict[str, Any]) -> None:
    """
    Stores the JSON request content on the disk for the model to read as input.
    :param input_file: The path of the model input file.
    :param content: The JSON content of the model input file.
    """

    input_file.parent.mkdir(parents=True, exist_ok=True)
    with open(input_file, "w") as file:
        json.dump(content, file, indent=2)


def get_road_ids(model_input: dict[str, any]) -> set[str]:
    """
    Extracts the road_ids from the model_input file given as dict.
    :param model_input: The model_input file given as dict.
    :return: A list of all road_ids as string.
    """
    road_network = model_input["road_network"]
    return {road_id for road_id in road_network}


def derive_input_file_path(simulation_id: SimulationID, xai_suffix: str = ""):
    """
    Derive from the SimulationID the path including file name under which the model input JSON is saved.
    Append a suffix to the path for storing temporary XAI outputs.
    :param simulation_id: The SimulationDI of the entire model run.
    :param xai_suffix: The suffix appended for XAI usage.
    :return: The path including file name under which the model input JSON is saved.
    """
    suffix = f"_{xai_suffix}" if xai_suffix else ""
    return MODEL_INPUT_BASE_PATH / f"{simulation_id.user_id}_{simulation_id.prediction_id}{suffix}.json"


def create_model_input_modification(
    model_input: dict[str, any], road_id: str, day_type: str, time_slot: int
) -> dict[str, any]:
    """
    Removes one road modification identified by road_id from the model_input dict and sets a specific time slot.
    :param model_input: The JSON from which the road modification is removed.
    :param road_id: The road modification to remove.
    :param day_type: The day type (weekend or weekday) to set.
    :param time_slot: The time slot to set.
    :return: The model_input dict without the road modification identified by road_id and specific time slot.
    """
    model_input_modified = deepcopy(model_input)
    del model_input_modified["road_network"][road_id]
    model_input_modified["scenario"]["day type"] = [day_type.strip().lower()]
    model_input_modified["scenario"]["time slots"] = [time_slot]
    return model_input_modified

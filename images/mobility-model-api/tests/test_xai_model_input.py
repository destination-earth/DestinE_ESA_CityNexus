from pathlib import Path
from unittest.mock import patch

from mobility_model_api.model.generic import SimulationID
from mobility_model_api.simulation.model_input import (
    create_model_input_modification,
    create_xai_records,
    derive_input_file_path,
    get_road_ids,
)
from mobility_model_api.simulation.xai_record import XAIRecord, XAIRecordType
from tests.fixtures import model_input


def test_get_road_ids(model_input):
    road_ids = get_road_ids(model_input)
    assert len(road_ids) == 4


def test_create_model_input_modification(model_input):
    road_to_remove = "20049"
    day_type = "weekday"
    time_slot = 17
    model_input_modified = create_model_input_modification(model_input, road_to_remove, day_type, time_slot)
    assert len(model_input_modified["road_network"]) == 3
    assert len(model_input["road_network"]) == 4, "The original dict must not be modified!"
    assert model_input_modified["scenario"]["time slots"] == [time_slot]
    assert model_input_modified["scenario"]["day type"] == [day_type]


def test_create_xai_records(model_input):
    day_type = "weekday"
    time_slot = 17
    xai_records = create_xai_records(model_input, day_type, time_slot)
    assert len(xai_records) == 4
    for record in xai_records:
        assert type(record) == XAIRecord
        assert record.type == XAIRecordType.MODIFICATION
        assert len(record.road_id) > 0
        assert type(record.model_input) == dict


@patch("mobility_model_api.simulation.model_input.MODEL_INPUT_BASE_PATH", Path("/mock_path"))
def test_derive_input_file_path_default_case():
    simulation_id = SimulationID(user_id="user", prediction_id="pred")
    result_path = derive_input_file_path(simulation_id)
    assert result_path == Path("/mock_path/user_pred.json")


@patch("mobility_model_api.simulation.model_input.MODEL_INPUT_BASE_PATH", Path("/mock_path"))
def test_derive_input_file_path_xai_suffix():
    simulation_id = SimulationID(user_id="user", prediction_id="pred")
    # noinspection SpellCheckingInspection
    result_path = derive_input_file_path(simulation_id, xai_suffix="xaisuf")
    # noinspection SpellCheckingInspection
    assert result_path == Path("/mock_path/user_pred_xaisuf.json")

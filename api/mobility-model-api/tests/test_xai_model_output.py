from pathlib import Path
from unittest.mock import patch

import pytest
from geopandas import GeoDataFrame

from mobility_model_api.model.generic import SimulationID
from mobility_model_api.simulation.model_output import (
    derive_output_path,
    find_time_slot_in_time_window,
    get_output_prefix,
    load_as_dict,
    load_as_geodf,
    load_result_zip,
)

MODEL_OUTPUT = Path("./mobility_model_api/data/results_12012391.zip")


def test_get_output_prefix():
    output_prefix = get_output_prefix("20049")
    assert output_prefix == "XAI_20049"


@pytest.mark.integration
def test_load_result_zip_as_dict():
    result_content = load_result_zip(MODEL_OUTPUT, load_as_dict)
    assert type(result_content) == dict
    assert result_content.get("features") is not None


@pytest.mark.integration
def test_load_result_zip_as_geodf():
    result_content = load_result_zip(MODEL_OUTPUT, load_as_geodf)
    assert type(result_content) == GeoDataFrame
    assert len(result_content) > 0


@patch("mobility_model_api.simulation.model_output.MODEL_OUTPUT_BASE_PATH", Path("/mock_path"))
def test_derive_output_path_default_case():
    simulation_id = SimulationID(user_id="user", prediction_id="pred")
    result_path = derive_output_path(simulation_id)
    assert result_path == Path("/mock_path/user/predictions/pred/")


@patch("mobility_model_api.simulation.model_output.MODEL_OUTPUT_BASE_PATH", Path("/mock_path"))
def test_derive_output_path_run_xai():
    simulation_id = SimulationID(user_id="user", prediction_id="pred")
    result_path = derive_output_path(simulation_id, is_xai=True)
    assert result_path == Path("/mock_path/user/predictions/pred/xai")


def test_find_time_slot_in_time_window():
    actual = find_time_slot_in_time_window(
        time_windows=["weekday_17", "weekday_18", "weekend_17", "weekend_18"],
        day_type=" WEEKDAY ",
        time_slot=17,
    )
    assert actual == "weekday_17"


def test_find_time_slot_in_time_window_not_found():
    with pytest.raises(ValueError):
        find_time_slot_in_time_window(
            time_windows=["weekday_17", "weekday_18"],
            day_type="asdf",
            time_slot=0,
        )

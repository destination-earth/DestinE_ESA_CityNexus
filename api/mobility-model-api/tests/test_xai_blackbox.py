from pathlib import Path

import pytest
from geopandas import GeoDataFrame

from mobility_model_api.model.generic import SimulationID
from mobility_model_api.simulation.model_run import run_xai_blackbox
from mobility_model_api.simulation.xai_blackbox import calculate_modification_impact
from mobility_model_api.simulation.xai_record import XAIRecord, XAIRecordType
from tests.fixtures import model_input


@pytest.mark.integration
def test_run_xai_blackbox(model_input):
    simulation_id = SimulationID(user_id="user", prediction_id="pred")
    area_of_interest = [(12.467, 55.604), (12.490, 55.614)]
    xai_attribute = "no2"
    day_type = "weekday"
    time_slot = 17
    run_xai_blackbox(simulation_id, model_input, area_of_interest, xai_attribute, day_type, time_slot)
    assert True


@pytest.mark.integration
def test_calculate_modification_impact():
    simulation_id = SimulationID(user_id="user", prediction_id="pred")
    data_path = Path("./mobility_model_api/data")

    xai_baseline = XAIRecord(
        type=XAIRecordType.BASELINE,
        simulation_id=simulation_id,
        road_id=None,
        model_output_file_path=data_path / "results_full.zip",
    )

    xai_records = [
        XAIRecord(
            type=XAIRecordType.MODIFICATION,
            simulation_id=simulation_id,
            road_id="12012391",
            model_output_file_path=data_path / "results_12012391.zip",
        ),
        XAIRecord(
            type=XAIRecordType.MODIFICATION,
            simulation_id=simulation_id,
            road_id="23240405",
            model_output_file_path=data_path / "results_23240405.zip",
        ),
        XAIRecord(
            type=XAIRecordType.MODIFICATION,
            simulation_id=simulation_id,
            road_id="25019206",
            model_output_file_path=data_path / "results_25019206.zip",
        ),
        XAIRecord(
            type=XAIRecordType.MODIFICATION,
            simulation_id=simulation_id,
            road_id="25019207",
            model_output_file_path=data_path / "results_25019207.zip",
        ),
    ]

    area_of_interest = [(12.467, 55.604), (12.490, 55.614)]
    xai_attribute = "no2"
    day_type = "weekday"
    time_slot = 17
    xai_records, gdf_modification_impact = calculate_modification_impact(
        xai_baseline, xai_records, area_of_interest, xai_attribute, day_type, time_slot
    )
    assert type(gdf_modification_impact) == GeoDataFrame
    assert len(gdf_modification_impact) == 4
    for rec in xai_records:
        assert type(rec.xai_result) == GeoDataFrame
        assert len(rec.xai_result) > 0

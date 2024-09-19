import logging
import shutil
import subprocess
from pathlib import Path
from typing import Any

from geopandas import GeoDataFrame

from mobility_model_api.model.generic import SimulationID
from mobility_model_api.simulation.model_input import (
    create_xai_records,
    derive_input_file_path,
    store_input_file,
)
from mobility_model_api.simulation.model_output import (
    TargetAreaType,
    derive_output_path,
    find_latest_file,
)
from mobility_model_api.simulation.xai_blackbox import (
    calculate_modification_impact,
    XAI_IMPACT_FILENAME,
    XAI_DIFFERENCE_FILENAME,
)
from mobility_model_api.simulation.xai_record import (
    XAIException,
    XAIRecord,
    XAIRecordType,
)

MODEL_BIN_PATH = Path("/run_mobility_model")
MAX_MODIFICATIONS = 10


def run_xai_blackbox(
    simulation_id: SimulationID,
    model_input: dict[str, Any],
    area_of_interest: TargetAreaType,
    xai_attribute: str,
    day_type: str,
    time_slot: int,
):
    """
    Prepares and runs all required steps for the XAI Blackbox approach:
     - Loading the baseline model result
     - Preparing and running the simulations for all XAI modifications
     - Performing the XAI analysis
     - Storing the XAI output files.
    :param simulation_id: The SimulationID of the model run.
    :param model_input: The input JSON of the mobility model without API metadata.
    :param area_of_interest: The area of interest in which the xai_attribute is compared between modifications and baseline.
    :param xai_attribute: The model result attribute that is compared in the XAI analysis, e.g. NO2 emissions.
    :param day_type: The day type (weekend or weekday) of the simulation that is used in the XAI analysis.
    :param time_slot: The time slot of the simulation that is used in the XAI analysis.
    """

    output_path = derive_output_path(simulation_id, is_xai=True)
    logging.info(f"XAI output path: {output_path}")

    xai_baseline = XAIRecord(XAIRecordType.BASELINE, simulation_id=simulation_id)
    xai_baseline.model_output_file_path = find_latest_file(derive_output_path(simulation_id), file_pattern="*.zip")

    xai_records = create_xai_records(model_input, day_type, time_slot)
    if len(xai_records) > MAX_MODIFICATIONS:
        raise XAIException(f"XAI can be used for up to {MAX_MODIFICATIONS} modifications.")

    run_xai_simulations(xai_records, simulation_id, output_path)

    logging.info("Start XAI analysis")
    xai_records, gdf_impact = calculate_modification_impact(
        xai_baseline, xai_records, area_of_interest, xai_attribute, day_type, time_slot
    )

    logging.info("Collect and save XAI results")
    gdf_full = combine_xai_diff_results(xai_baseline, xai_records, xai_attribute)

    impact_output_path = derive_output_path(simulation_id) / XAI_IMPACT_FILENAME
    logging.info(f"Save XAI modification impact results: {impact_output_path}")
    gdf_impact.to_file(impact_output_path, driver="GeoJSON")

    difference_output_path = derive_output_path(simulation_id) / XAI_DIFFERENCE_FILENAME
    logging.info(f"Save XAI modification difference results: {difference_output_path}")
    gdf_full.to_file(difference_output_path, driver="GeoJSON")

    # delete XAI folder containing intermediate files
    logging.info(f"Remove XAI temp files: {output_path}")
    shutil.rmtree(output_path)


def run_xai_simulations(xai_records: list[XAIRecord], simulation_id: SimulationID, output_path: Path) -> None:
    """
    Prepares and runs model simulations for all XAI modifications.
    :param xai_records: The set of XAI modifications as XAIRecord objects.
    :param simulation_id: The SimulationID of the model run.
    :param output_path: The base output path of the XAI model simulations.
    """
    for i, xai_record in enumerate(xai_records):
        xai_record.model_input_file_path = derive_input_file_path(simulation_id, xai_suffix=xai_record.road_id)
        xai_record.model_output_path = output_path / xai_record.road_id
        run_counter = f"{i + 1}/{len(xai_records)}"
        logging.info(f"Store model input file for XAI ({run_counter}): {xai_record.model_input_file_path}")
        store_input_file(xai_record.model_input_file_path, xai_record.model_input)
        logging.info(f"Run XAI simulation {run_counter}")
        run_model(xai_record.model_input_file_path, xai_record.model_output_path)
        xai_record.model_output_file_path = find_latest_file(xai_record.model_output_path, file_pattern="*.zip")


def run_model(input_file_path: Path, output_path: Path, create_trajectories: bool = False) -> int:
    """
    Executes the model locally and provides the input JSON file path as well as the output path.
    :param input_file_path: The file path of the model input file.
    :param output_path: The file path of the model output.
    :param create_trajectories: True, if the model shall create the trajectories file.
    :return: The return code of the model process.
    """
    run_cmd = [
        str(MODEL_BIN_PATH.absolute()),
        "--json-path",
        str(input_file_path.absolute()),
        "--output-path",
        str(output_path.absolute()),
    ]

    if create_trajectories:
        run_cmd += ["--return-od", "true"]

    output_path.mkdir(parents=True, exist_ok=True)
    proc = subprocess.run(run_cmd, capture_output=True)
    logging.info(proc.stdout.decode("UTF-8"))

    if proc.returncode:
        logging.error("Mobility Model run failed.")
    else:
        logging.info("Mobility Model run successfully completed.")

    return proc.returncode


def combine_xai_diff_results(xai_baseline: XAIRecord, xai_records: list[XAIRecord], xai_attribute: str) -> GeoDataFrame:
    """
    Combines all XAI results (one for each road segment modification) into one GeoDataFrame with two columns each:
        - the xai_attribute value of each simulation
        - the difference between the xai_attribute of modification and baseline simulation result
    :param xai_baseline: The baseline XAIRecord.
    :param xai_records: A list of modification XAIRecords.
    :param xai_attribute: The attribute the XAI analysis is based on.
    :return A combined GeoDataFrame containing all XAI results per road modification.
    """
    gdf_full = xai_baseline.model_output.copy()
    for record in xai_records:
        gdf_subset = record.xai_result[["osm_id", xai_attribute, f"{xai_attribute}_diff"]].copy()
        gdf_subset = gdf_subset.rename(
            columns={
                xai_attribute: f"{xai_attribute}_{record.road_id}",
                f"{xai_attribute}_diff": f"{xai_attribute}_diff_{record.road_id}",
            }
        )
        gdf_full = gdf_full.merge(gdf_subset, on=["osm_id"], how="outer")
    return gdf_full

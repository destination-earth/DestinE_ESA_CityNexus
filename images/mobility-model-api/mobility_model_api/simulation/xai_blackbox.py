import logging

import numpy as np
from geopandas import GeoDataFrame

from mobility_model_api.simulation.model_output import (
    TargetAreaType,
    filter_time_slot,
    get_target_area,
    load_as_geodf,
    load_result_zip,
)
from mobility_model_api.simulation.xai_record import XAIRecord

XAI_DIFFERENCE_FILENAME = "xai_diffs.geojson"
XAI_IMPACT_FILENAME = "xai_impact.geojson"


def calculate_modification_impact(
    xai_baseline: XAIRecord,
    xai_records: list[XAIRecord],
    area_of_interest: TargetAreaType,
    xai_attribute: str,
    day_type: str,
    time_slot: int,
) -> tuple[list[XAIRecord], GeoDataFrame]:
    """
    Runs the entire XAI blackbox approach analysis:
        - loads model outputs for baseline and modifications
        - filters data for road modifications, area_of_interest and time slot
        - calculates the XAI results
    :param xai_baseline: The baseline XAIRecord.
    :param xai_records: A list of modification XAIRecords.
    :param area_of_interest: The area of interest in which the xai_attribute is compared between modifications and baseline.
    :param xai_attribute: The model result attribute that is compared in the XAI analysis, e.g. NO2 emissions.
    :param day_type: The day_type (weekend or weekday) of the simulation that is used in the XAI analysis.
    :param time_slot: The time slot of the simulation that is used in the XAI analysis.
    """
    road_ids = [rec.road_id for rec in xai_records]
    gdf_modification_impact = prepare_xai_baseline(xai_baseline, road_ids, area_of_interest, day_type, time_slot)
    xai_records = load_xai_modification_results(xai_records, area_of_interest, day_type, time_slot)
    xai_baseline.xai_value_sum = xai_baseline.model_output[xai_attribute].sum()

    xai_records = calculate_xai_values(xai_baseline, xai_records, xai_attribute)
    road_id_to_impact = calculate_impact(xai_records)
    gdf_modification_impact[f"{xai_attribute}_impact"] = gdf_modification_impact["osm_id"].map(road_id_to_impact)

    return xai_records, gdf_modification_impact


def prepare_xai_baseline(
    xai_baseline: XAIRecord, road_ids: list[str], area_of_interest: TargetAreaType, day_type: str, time_slot: int
) -> GeoDataFrame:
    """
    Loads the baseline simulation output into the record and prepares the GeoDataFrame
    for calculating the modification impact.
    :param xai_baseline: The baseline XAIRecord.
    :param road_ids: The osm_ids of the roads for which the impact is calculated.
    :param area_of_interest: The area of interest in which the xai_attribute is compared between modifications and baseline.
    :param day_type: The day type (weekend or weekday) of the simulation that is used in the XAI analysis.
    :param time_slot: The time slot of the simulation that is used in the XAI analysis.
    :returns: GeoDataFrame containing the modified roads for calculating the modification impact.
    """
    logging.info(f"Load XAI baseline file: {xai_baseline.model_output_file_path}")
    gdf_baseline = load_result_zip(xai_baseline.model_output_file_path, load_as_geodf)
    gdf_baseline = filter_time_slot(gdf_baseline, day_type, time_slot)
    xai_baseline.model_output = get_target_area(gdf_baseline, area_of_interest)
    gdf_modification_impact = gdf_baseline[gdf_baseline["osm_id"].isin(road_ids)].copy()

    # delete full size baseline dataset, only use gdf filtered by target area and time slot from here
    del gdf_baseline

    return gdf_modification_impact


def load_xai_modification_results(
    xai_records: list[XAIRecord], area_of_interest: TargetAreaType, day_type: str, time_slot: int
) -> list[XAIRecord]:
    """
    Loads the simulation results for all modifications into the xai_records.
    :param xai_records: A list of modification XAIRecords.
    :param area_of_interest: The area of interest in which the xai_attribute is compared between modifications and baseline.
    :param day_type: The day type (weekend or weekday) of the simulation that is used in the XAI analysis.
    :param time_slot: The time slot of the simulation that is used in the XAI analysis.
    :returns: The list of xai_records with modifications loaded into their model_output attribute.
    """
    for i, xai_record in enumerate(xai_records):
        run_counter = f"{i + 1}/{len(xai_records)}"
        logging.info(f"Load XAI input ({run_counter}): {xai_record.model_output_path}")
        gdf_modification = load_result_zip(xai_record.model_output_file_path, load_as_geodf)
        xai_record.model_output = get_target_area(
            filter_time_slot(gdf_modification, day_type, time_slot), area_of_interest
        )
        # delete full size modification dataset, only use gdf filtered by target area and time slot from here
        del gdf_modification

    return xai_records


def calculate_xai_values(xai_baseline: XAIRecord, xai_records: list[XAIRecord], xai_attribute: str) -> list[XAIRecord]:
    """
    Calculates the raw XAI values for each modification and returns the updated records.
    :param xai_baseline: The baseline XAIRecord.
    :param xai_records: A list of modification XAIRecords.
    :param xai_attribute: The model result attribute that is compared in the XAI analysis, e.g. NO2 emissions.
    :returns: The updated list of modification XAIRecords.
    """
    for i, xai_record in enumerate(xai_records):
        xai_record.xai_result = xai_record.model_output.copy()
        xai_record.xai_result[f"{xai_attribute}_diff"] = (
            xai_baseline.model_output[xai_attribute] - xai_record.model_output[xai_attribute]
        )
        xai_record.xai_value_sum = xai_record.model_output[xai_attribute].sum()
        xai_record.xai_value_diff = xai_baseline.xai_value_sum - xai_record.xai_value_sum
        xai_record.xai_value_percentage = -(xai_record.xai_value_diff / xai_baseline.xai_value_sum)

    return xai_records


def calculate_impact(xai_records: list[XAIRecord]) -> dict[str, float]:
    """
    Calculates the normalized impact of each modification and returns the updated records.
    :param xai_records: A list of modification XAIRecords.
    :returns: A dict that correlates the road_id to the modification impact.
    """
    attribute_values = [rec.xai_value_sum for rec in xai_records]
    attribute_value_mean_diff = np.mean(attribute_values) - attribute_values
    attribute_values_mean_diff_norm_ind = [
        2 * (x - min(attribute_value_mean_diff)) / (max(attribute_value_mean_diff) - min(attribute_value_mean_diff)) - 1
        for x in attribute_value_mean_diff
    ]
    max_abs_val = max(attribute_value_mean_diff, key=abs)
    attribute_value_mean_diff_norm = [float(x / max_abs_val) for x in attribute_value_mean_diff]

    road_ids = [rec.road_id for rec in xai_records]
    road_id_to_impact = dict(zip(road_ids, attribute_value_mean_diff_norm))
    return road_id_to_impact

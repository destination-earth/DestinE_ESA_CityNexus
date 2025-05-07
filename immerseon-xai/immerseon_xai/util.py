from pathlib import Path
from typing import Callable, Any

import geopandas as gpd
from geopandas import GeoDataFrame
from shapely.geometry import box


def get_target_area(result_file: GeoDataFrame, target_area: list[float]) -> GeoDataFrame:
    """
    Creates a copy of the GeoDataFrame that includes only road segments within the provided target_area.
    :param result_file: The full set of road segments.
    :param target_area: The target area to filter.
    :return: A copy of the filtered GeoDataFrame.
    """
    bbox = box(*target_area)
    return result_file[result_file.geometry.within(bbox)].copy()


def filter_time_slot(result_file: GeoDataFrame, time_slot: int = 0):
    """
    Selects a single time slot from the given GeoDataFrame.
    :param result_file: The GeoDataFrame to filter.
    :param time_slot: The index of the time slot to select.
    :return: The filtered GeoDataFrame.
    """
    time_slot_timestamp = sorted(result_file["time_window"].unique())[time_slot]
    return result_file[result_file["time_window"] == time_slot_timestamp]


def load_result_generic(data_path: Path, file_template: str) -> Callable[[Any], GeoDataFrame]:
    def load_result(**kwargs: Any) -> GeoDataFrame:
        """
        Loads a GeoJSON file identified by a file_suffix into a GeoDataFrame.
        :param kwargs: The key-value pairs for filling the file_template that identifies the GeoJSON file.
        :return: The loaded GeoDataFrame.
        """
        result_path = data_path / file_template.format(**kwargs)
        print(result_path)
        result = gpd.read_file(result_path)
        return filter_time_slot(result, time_slot=0).sort_values(by=["osm_id"])

    return load_result


def split_gdf(gdf: GeoDataFrame, *, left_cols: list[str], right_cols: list[str]):
    """
    Split a GeoDataFrame into two parts based on column names.
    :param gdf: The GeoDataFrame to split.
    :param left_cols: List of column names for the left GeoDataFrame.
    :param right_cols: List of column names for the right GeoDataFrame.
    :return: A tuple containing two GeoDataFrames (left_gdf, right_gdf).
    """

    if not set(left_cols).issubset(gdf.columns) or not set(right_cols).issubset(gdf.columns):
        raise ValueError("Some columns in left_cols or right_cols are not present in the GeoDataFrame.")

    left_gdf = gdf[left_cols]
    right_gdf = gdf[right_cols]

    return left_gdf, right_gdf

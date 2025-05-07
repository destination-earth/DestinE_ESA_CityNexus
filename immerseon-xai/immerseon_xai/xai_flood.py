from pathlib import Path

import pandas as pd
import geopandas as gpd

from immerseon_xai.util import get_target_area, load_result_generic, split_gdf


DATA_PATH = Path("./data")
RESULT_FILE_TEMPLATE = "rain_{rain}_sea_{sea}.geojson"
AREA_OF_INTEREST_VR = [12.56520, 55.61530, 12.57615, 55.62297]
AREA_OF_INTEREST_FULL = [10, 50, 20, 60]
ID_COL = "osm_id"
METADATA_COLS = [ID_COL, "geometry"]
VALUE_COLS = [ID_COL, "flood_depth", "occupancy", "speed"]

load_result = load_result_generic(DATA_PATH, RESULT_FILE_TEMPLATE)


def calculate_flood_diff():
    base_low_gdf = get_target_area(load_result(rain=0, sea=0), AREA_OF_INTEREST_FULL)
    base_medium_gdf = get_target_area(load_result(rain=200, sea=10), AREA_OF_INTEREST_FULL)
    base_high_gdf = get_target_area(load_result(rain=800, sea=40), AREA_OF_INTEREST_FULL)
    high_rain_gdf = get_target_area(load_result(rain=800, sea=0), AREA_OF_INTEREST_FULL)
    high_sea_gdf = get_target_area(load_result(rain=0, sea=40), AREA_OF_INTEREST_FULL)

    # TODO(AA) remove midpoints after demo
    midpoints_gdf = get_target_area(gpd.read_file(DATA_PATH / "flood_roads_midpoints.geojson"), AREA_OF_INTEREST_FULL)
    midpoints_df = midpoints_gdf[[ID_COL, "longitude", "latitude"]]

    flood_data = []
    for rain in [0, 200, 800]:
        for sea in [0, 10, 40]:
            gdf = get_target_area(load_result(rain=rain, sea=sea), AREA_OF_INTEREST_FULL)
            for _, row in gdf.iterrows():
                flood_data.append(
                    {
                        ID_COL: row[ID_COL],
                        "rain": rain,
                        "sea": sea,
                        "flood_depth": row["flood_depth"],
                        "occupancy": row["occupancy"],
                        "speed": row["speed"],
                    }
                )
    flood_df = pd.DataFrame(flood_data)

    road_influence = []
    for road, road_df in flood_df.groupby(ID_COL):
        variance_total = road_df["flood_depth"].var()
        variance_rain = road_df.groupby("rain")["flood_depth"].mean().var()
        variance_sea = road_df.groupby("sea")["flood_depth"].mean().var()
        influence_rain = (variance_rain / variance_total) * 100 if variance_total != 0 else 0
        # TODO(AA): use calculated influence if influence_rain and influence_sea are closer together and both below 100
        # influence_sea = (variance_sea / variance_total) * 100 if variance_total != 0 else 0
        influence_sea = 100 - influence_rain if influence_rain != 0 else 0
        road_influence.append({ID_COL: road, "rain_influcence": influence_rain, "sea_influence": influence_sea})
    influence_df = pd.DataFrame(road_influence)

    base_low_metadata_gdf, base_low_values_gdf = split_gdf(base_low_gdf, left_cols=METADATA_COLS, right_cols=VALUE_COLS)
    base_medium_metadata_gdf, base_medium_values_gdf = split_gdf(
        base_medium_gdf, left_cols=METADATA_COLS, right_cols=VALUE_COLS
    )
    base_high_metadata_gdf, base_high_values_gdf = split_gdf(
        base_high_gdf, left_cols=METADATA_COLS, right_cols=VALUE_COLS
    )
    high_rain_df = high_rain_gdf[VALUE_COLS]
    high_sea_df = high_sea_gdf[VALUE_COLS]
    high_rain_df = high_rain_df.rename(
        columns={"flood_depth": "flood_depth_rain", "occupancy": "occupancy_rain", "speed": "speed_rain"}
    )
    high_sea_df = high_sea_df.rename(
        columns={"flood_depth": "flood_depth_sea", "occupancy": "occupancy_sea", "speed": "speed_sea"}
    )
    diff_df = pd.merge(base_low_values_gdf, high_rain_df, on="osm_id").merge(high_sea_df, on="osm_id")
    diff_df["flood_depth_rain_diff"] = diff_df["flood_depth_rain"] - diff_df["flood_depth"]
    diff_df["flood_depth_sea_diff"] = diff_df["flood_depth_sea"] - diff_df["flood_depth"]
    diff_df["occupancy_rain_diff"] = diff_df["occupancy_rain"] - diff_df["occupancy"]
    diff_df["occupancy_sea_diff"] = diff_df["occupancy_sea"] - diff_df["occupancy"]
    diff_df["speed_rain_diff"] = diff_df["speed_rain"] - diff_df["speed"]
    diff_df["speed_sea_diff"] = diff_df["speed_sea"] - diff_df["speed"]
    diff_df = diff_df[
        [
            "osm_id",
            "flood_depth_rain_diff",
            "flood_depth_sea_diff",
            "occupancy_rain_diff",
            "occupancy_sea_diff",
            "speed_rain_diff",
            "speed_sea_diff",
        ]
    ]

    # used as xai_impact.geojson in web app
    xai_result_influence_gdf = base_medium_metadata_gdf.merge(base_medium_values_gdf, on=ID_COL).merge(
        influence_df, on=ID_COL
    )

    # used as xai_diff.geojson in web app
    xai_result_diff_gdf = base_medium_metadata_gdf.merge(diff_df, on=ID_COL)

    # used as xai_result_vestamager.geojson in VR app
    xai_result_vr_gdf = (
        base_medium_metadata_gdf.merge(base_medium_values_gdf, on=ID_COL)
        .merge(midpoints_df, on=ID_COL)
        .merge(influence_df, on=ID_COL)
        .merge(diff_df, on=ID_COL)
    )
    xai_result_vr_gdf = get_target_area(xai_result_vr_gdf, AREA_OF_INTEREST_VR)
    # VR app uses/requires "flood_depth_rain" and interprets its values as meters
    xai_result_vr_gdf["flood_depth_rain"] = xai_result_vr_gdf["flood_depth"] / 10
    value_cols = [
        "flood_depth",
        "occupancy",
        "speed",
        "rain_influcence",
        "sea_influence",
        "flood_depth_rain_diff",
        "flood_depth_sea_diff",
        "occupancy_rain_diff",
        "occupancy_sea_diff",
        "speed_rain_diff",
        "speed_sea_diff",
        "flood_depth_rain",
    ]
    xai_result_vr_gdf[value_cols] = xai_result_vr_gdf[value_cols].round(3)

    xai_result_influence_gdf.to_file("./data/xai_impact.geojson", driver="GeoJSON")
    xai_result_diff_gdf.to_file("./data/xai_diffs.geojson", driver="GeoJSON")
    xai_result_vr_gdf.to_file("./data/xai_result_vestamager.geojson", driver="GeoJSON")

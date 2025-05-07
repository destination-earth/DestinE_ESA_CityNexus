from pathlib import Path

import numpy as np
import pandas as pd
import geopandas as gpd
import matplotlib.pyplot as plt
from immerseon_xai.util import get_target_area, load_result_generic, split_gdf

DATA_PATH = Path("./data")
RESULT_FILE_TEMPLATE = "{suffix}.geojson"

load_result = load_result_generic(DATA_PATH, RESULT_FILE_TEMPLATE)

AREA_OF_INTEREST = [12.56520, 55.61530, 12.57615, 55.62297]


def rename_cols(df, suffix):
    return df.rename(columns={col: col + suffix for col in df.columns})


def xai_diff_impact(default, high, low, value_cols):
    low, _ = split_gdf(low, left_cols=value_cols, right_cols=[])
    high, _ = split_gdf(high, left_cols=value_cols, right_cols=[])
    diff = high - low
    diff["flood_depth"] = diff["flood_depth"].clip(lower=0)
    diff["speed"] = diff["speed"].clip(upper=0)
    diff = diff.replace([0, 0.0], np.nan)
    impact = diff / default
    impact = impact.replace([float("inf"), -float("inf")], np.nan)
    impact = impact.replace([0, 0.0], np.nan)
    return diff, impact


def calculate_flood_diff():
    default = load_result("default")
    sea_low = load_result("sea_low")
    sea_high = load_result("sea_high")
    river_low = load_result("river_low")
    river_high = load_result("river_high")
    rain_low = load_result("rain_low")
    rain_high = load_result("rain_high")

    value_cols = ["flood_depth", "occupancy", "speed"]
    base_gdf, default_values = split_gdf(
        default, left_cols=["osm_id", "time_window", "geometry"], right_cols=value_cols
    )

    sea_diff, sea_impact = xai_diff_impact(default_values, sea_high, sea_low, value_cols)
    river_diff, river_impact = xai_diff_impact(default_values, river_high, river_low, value_cols)
    rain_diff, rain_impact = xai_diff_impact(default_values, rain_high, rain_low, value_cols)

    sea_diff = rename_cols(sea_diff, suffix="_sea_diff")
    sea_impact = rename_cols(sea_impact, suffix="_sea_impact")
    river_diff = rename_cols(river_diff, suffix="_river_diff")
    river_impact = rename_cols(river_impact, suffix="_river_impact")
    rain_diff = rename_cols(rain_diff, suffix="_rain_diff")
    rain_impact = rename_cols(rain_impact, suffix="_rain_impact")

    xai_diff = pd.concat(
        [
            base_gdf,
            sea_diff,
            river_diff,
            rain_diff,
        ],
        axis=1,
    )
    xai_impact = pd.concat(
        [
            base_gdf,
            sea_impact,
            river_impact,
            rain_impact,
        ],
        axis=1,
    )
    xai_diff.to_file("./data/xai_diffs.geojson", driver="GeoJSON")
    xai_impact.to_file("./data/xai_impact.geojson", driver="GeoJSON")


def plot_results(xai_gdf):
    xai_result = get_target_area(xai_gdf, AREA_OF_INTEREST)
    xai_cols = set(xai_result.columns) - {"osm_id", "time_window", "geometry"}

    for col in xai_cols:
        norm = plt.Normalize(vmin=xai_result[col].min(), vmax=xai_result[col].max())
        cmap = plt.cm.RdBu
        fig, ax = plt.subplots(figsize=(6, 6))
        for _, row in xai_result.iterrows():
            line = row["geometry"]
            attribute_value = row[col]
            color = cmap(norm(attribute_value))
            ax.plot(*line.coords.xy, color=color, linewidth=2)
        sm = plt.cm.ScalarMappable(cmap=cmap, norm=norm)
        sm.set_array([])
        fig.colorbar(sm, ax=ax)
        plt.tight_layout()
        plt.xlabel("Longitude")
        plt.ylabel("Latitude")
        plt.title(col)
        # plt.savefig(f"img/xai_{col}.png")
        plt.show()

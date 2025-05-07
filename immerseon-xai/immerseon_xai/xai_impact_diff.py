from pathlib import Path

import numpy as np
from geopandas import GeoDataFrame
from matplotlib import colors as mcolors, pyplot as plt

from immerseon_xai.util import get_target_area, load_result_generic

DATA_PATH = Path("./data")
RESULT_FILE_TEMPLATE = "results_{suffix}.geojson"
BASE_SUFFIX = "base"
FULL_SUFFIX = "full"
MODIFIED_ROADS = ["12012391", "23240405", "25019206", "25019207"]
AREA_OF_INTEREST = [12.467, 55.604, 12.490, 55.614]

load_result = load_result_generic(DATA_PATH, RESULT_FILE_TEMPLATE)


def calculate_no2_impact():
    # file_base = load_result(BASE_SUFFIX)
    # no2_base = get_target_area(file_base, AREA_OF_INTEREST)["no2"].sum()

    file_full = load_result(FULL_SUFFIX)
    no2_full = get_target_area(file_full, AREA_OF_INTEREST)["no2"].sum()
    no2_modified = [get_target_area(load_result(road_id), AREA_OF_INTEREST)["no2"].sum() for road_id in MODIFIED_ROADS]

    no2_diff = no2_full - no2_modified
    no2_percentage = -(no2_diff / no2_full)
    osm_id_to_no2_diff = dict(zip(MODIFIED_ROADS, no2_percentage.tolist()))
    print(osm_id_to_no2_diff)

    no2_mean = np.mean(no2_modified)
    no2_mean_diff = no2_mean - no2_modified
    no2_mean_diff_norm_ind = [
        2 * (x - min(no2_mean_diff)) / (max(no2_mean_diff) - min(no2_mean_diff)) - 1 for x in no2_mean_diff
    ]
    max_abs_val = max(no2_mean_diff, key=abs)
    no2_mean_diff_norm = [x / max_abs_val for x in no2_mean_diff]
    osm_id_to_no2_mean_diff = dict(zip(MODIFIED_ROADS, no2_mean_diff_norm))

    modified_roads = file_full[file_full["osm_id"].isin(MODIFIED_ROADS)].copy()
    modified_roads["no2_diff"] = modified_roads["osm_id"].map(osm_id_to_no2_mean_diff)

    target_area = get_target_area(file_full, AREA_OF_INTEREST)

    plot_results(file_full, modified_roads, target_area)


def plot_results(file_full: GeoDataFrame, modified_roads: GeoDataFrame, target_area: GeoDataFrame) -> None:
    fig, ax = plt.subplots(figsize=(10, 8), dpi=120)
    target_area.plot(ax=ax, color="grey")
    modified_roads.plot(ax=ax, color="blue", linewidth=3)
    ax.set_title(f"Modified road segments")
    # plt.show()
    plt.savefig("img/1_modified_segments.png")

    fig, ax = plt.subplots(figsize=(10, 8), dpi=120)
    target_area.plot(ax=ax, column="no2", legend=True, cmap="RdYlGn_r")
    ax.set_title(f"NO2 baseline")
    # plt.show()
    plt.savefig("img/2_no2_baseline.png")

    fig, ax = plt.subplots(figsize=(10, 8), dpi=120)
    target_area.plot(ax=ax, column="no2", legend=True, cmap="RdYlGn_r")
    ax.set_title(f"NO2 simulation")
    # plt.show()
    plt.savefig("img/3_no2_simulation.png")

    for osm_id in MODIFIED_ROADS:
        modified_file = load_result(osm_id)
        target_area_modified = get_target_area(modified_file, AREA_OF_INTEREST)
        fig, ax = plt.subplots(figsize=(10, 8), dpi=120)
        target_area_modified.plot(ax=ax, column="no2", legend=True, cmap="RdYlGn_r")
        ax.set_title(f"NO2 simulation (osm_id: {osm_id})")
        plt.savefig(f"img/4_simulation_subset_{osm_id}.png")

    norm = mcolors.TwoSlopeNorm(vmin=modified_roads["no2_diff"].min(), vcenter=0, vmax=modified_roads["no2_diff"].max())
    fig, ax = plt.subplots(figsize=(10, 8), dpi=120)
    target_area.plot(ax=ax, color="grey")
    modified_roads.plot(ax=ax, column="no2_diff", legend=True, cmap="RdYlGn_r", linewidth=3, norm=norm)
    ax.set_title(f"Impact on NO2 per modified road segment")
    # plt.show()
    plt.savefig("img/5_no2_impact.png")

    target_area_full = get_target_area(file_full, AREA_OF_INTEREST)
    for osm_id in MODIFIED_ROADS:
        modified_file = load_result(osm_id)
        target_area_modified = get_target_area(modified_file, AREA_OF_INTEREST).copy()
        target_area_modified["no2_diff"] = target_area_full["no2"] - target_area_modified["no2"]
        print(target_area_modified["no2_diff"].sum())
        norm = mcolors.TwoSlopeNorm(
            vmin=target_area_modified["no2_diff"].min(), vcenter=0, vmax=target_area_modified["no2_diff"].max()
        )
        fig, ax = plt.subplots(figsize=(10, 8), dpi=120)
        target_area_modified.plot(ax=ax, column="no2_diff", legend=True, cmap="RdYlGn_r", norm=norm)
        ax.set_title(f"NO2 differences (osm_id: {osm_id})")
        # plt.show()
        plt.savefig(f"img/6_no2_diff_subset_{osm_id}.png")
    plt.close()

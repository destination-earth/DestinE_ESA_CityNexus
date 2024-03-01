"""Main code file, contains all command entrypoints."""

import argparse
import os
from pathlib import Path

import boto3
import geopandas as gpd
import pandas as pd
from h3 import h3
from shapely.geometry import Polygon

from data_handling.config import config

# the absolute root path of the repository
ROOT_PATH = Path(os.path.dirname(__file__)).parents[1]


def run_parquet_to_csv():
    """Entrypoint of the parquet_to_csv command."""
    args = _read_parquet_args()
    _parquet_to_csv(args.parquet_file, args.value_column)


def run_parquet_to_geojson():
    """Entrypoint of the parquet_to_geojson command."""
    args = _read_parquet_args()
    _parquet_to_geojson(args.parquet_file, args.value_column)


def run_download_file():
    """Entrypoint of the download_file command."""
    parser = argparse.ArgumentParser()
    parser.add_argument("filename", type=str, help="The filename to download.")
    args = parser.parse_args()
    _download_file(args.filename)


def _parquet_to_csv(parquet_file: str, value_column: str):
    """
    Converts a parquet file into CSV format and saved it into the same directory.
    :param parquet_file: Path to a parquet file relative to the repository root directory.
        The File must contain a index column "h3-id" and a value column.
    :param value_column: The name of the value column available in the parquet file.
    """
    parquet_path = _check_parquet(parquet_file)
    df = pd.read_parquet(parquet_path)
    output_path = f"{parquet_path.parent}/{parquet_path.stem}.csv"
    df.to_csv(output_path, columns=[value_column])
    print(f"Input file converted and saved as: {output_path}")


def _parquet_to_geojson(parquet_file: str, value_column: str):
    """
    Converts a parquet file into GeoJSON format and saved it into the same directory.
    :param parquet_file: Path to a parquet file relative to the repository root directory.
        The File must contain a index column "h3-id" and a value column.
    :param value_column: The name of the value column available in the parquet file.
    """
    parquet_path = _check_parquet(parquet_file)
    df = pd.read_parquet(parquet_path)

    coordinates = [h3.h3_to_geo_boundary(h3_id, geo_json=True) for h3_id in df.index]
    polygons = [Polygon(coords) for coords in coordinates]

    gdf = gpd.GeoDataFrame(geometry=polygons, data=df, columns=[value_column])
    output_path = f"{parquet_path.parent}/{parquet_path.stem}.geojson"
    gdf.to_file(output_path, driver="GeoJSON")
    print(f"Input file converted and saved as: {output_path}")


def _read_parquet_args() -> argparse.Namespace:
    """
    Reads the command line arguments required for accessing the parquet file data.
    :return: The Namespace containing the arguments.
    """
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "parquet_file", type=str, help="The path of the parquet file to convert."
    )
    parser.add_argument(
        "value_column", type=str, help="The value column inside the parquet file."
    )
    return parser.parse_args()


def _download_file(filename: str):
    """
    Downloads a file from the Object Storage and saves it into the download_dir defined in the config.toml
    :param filename: The full name of the file to download.
    """
    s3 = boto3.client(
        "s3",
        aws_access_key_id=config.OVH["access_key"],
        aws_secret_access_key=config.OVH["secret_key"],
        endpoint_url=config.OVH["endpoint_url"],
        region_name=config.OVH["region"],
    )

    bucket = config.OVH["bucket"]
    filename_normalized = filename.replace("/", "_")
    output_path = ROOT_PATH / config.local["download_dir"] / filename_normalized

    print(f"Downloading '{filename}' and save as: {output_path}")
    s3.download_file(bucket, filename, output_path)
    print("Download complete.")


def _list_bucket(s3, bucket):
    """
    Lists all files in the given bucket.
    :param s3: The boto3 client for accessing the storage bucket.
    :param bucket: The name of the bucket.
    """
    all_files = s3.list_objects_v2(Bucket=bucket)
    print(f'List of files in bucket "{bucket}":')
    for file in all_files["Contents"]:
        print(
            f'\t{file["Key"]}: size: {file["Size"]} bytes, last modified: {file["LastModified"]}'
        )


def _check_parquet(parquet_file: str) -> Path:
    """
    Checks if the given path leads to a valid parquet file.
    :param parquet_file: The path to the parquet file relative to the repository root.
    :return: The absolute path to the parquet file.
    """
    parquet_path = ROOT_PATH / parquet_file
    if not parquet_path.is_file() or parquet_path.suffix != ".parquet":
        print(f"{parquet_file} is not a parquet file.")
    return parquet_path

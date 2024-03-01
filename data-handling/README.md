# Data Handling Utilities
Provides commands to download files from the OVH Object Storage
and convert them into CSV or GeoJSON.

## Installation
### Create virtual environment (optional)
```
poetry env use python3.11
poetry shell
```

### Install from `pyproject.toml`
`poetry install`

### Configure
Before using the OVH download command, create a `config.toml` file
from the template and add credentials of an OVH service account.

## Run tests
(Currently not available)
Run tests via Poetry or directly with PyTest
 - `poetry run pytest`

## Run commands

### Download files from OVH
The following command downloads a file into the download directory specified in the `config.toml`.

`poetry run download_file <filename>`

In case the file contains `/`, it will be replaced by `_`.

### Convert parquet files to CSV or GeoJSON
Run one of the following commands to convert a parquet file:

 - `poetry run parquet_to_csv <parguet_file> <value_column>` 
 - `poetry run parquet_to_geojson <parguet_file> <value_column>`
 
The parquet file must contain at least an index column `h3-id` and a value column.
The converted file is stored in the same folder as the input file.

## Run dev tools
Some linters and formatters are included and can be used as follows:
 - black: `poetry run black .`
 - isort: `poetry run isort .`
 - pylint: `poetry run pylint data_handling`

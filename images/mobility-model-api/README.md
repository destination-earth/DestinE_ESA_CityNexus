# CityNexus Mobility Model API project
## Installation
### Create virtual environment (optional)
```
poetry env use python3.11
poetry shell
```

### Install from `pyproject.toml`
`poetry install`

## Run tests
- `poetry run pytest`
 
Integration tests require additional files in `data` folder and can be omitted or run exclusively:
- `poetry run pytest -m "integration"`
- `poetry run pytest -m "not integration"` 

## Run dev tools
Some linters and formatters are included and can be used as follows:
- black: `poetry run black .`
- isort: `poetry run isort .`
 
## Serve Mobility Model API (hot code reloading)
 - `poetry run uvicorn mobility_model_api.api.app:app --reload`

### Mount S3 storage

1. Install `s3fs-fuse`:
   ```bash
   sudo apt-get install -y s3fs
   ```

2. Configure Your S3 Credentials:
   Ensure you have your credentials set up in a file:
   ```bash
   echo "ACCESS_KEY_ID:SECRET_ACCESS_KEY" > ~/.passwd-s3fs
   chmod 600 ~/.passwd-s3fs
   ```

3. Create a Mount Point:
   Create a directory where you want to mount the S3 bucket:
   ```bash
   sudo mkdir ~/model_output
   ```

4. Mount the S3 Bucket with a Custom Endpoint:
   Use `s3fs` with the `url`, `use_path_request_style`, and `endpoint` options to mount the bucket:
   ```bash
   s3fs twincity-data ~/model_output -o passwd_file=~/.passwd-s3fs -o url=ENDPOINT_URL -o use_path_request_style
   ```

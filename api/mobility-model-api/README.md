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

## Run dev tools
Some linters and formatters are included and can be used as follows:
 - black: `poetry run black .`
 - isort: `poetry run isort .`
 
## Serve Mobility Model API (hot code reloading)
 - `poetry run uvicorn mobility_model_api.api.app:app --reload`

### Authenticate requests
Requests require an authorization header with valid access token: 
`curl -X 'GET' -H 'Authorization: Token <ACCESS_TOKEN>' 'http://127.0.0.1:8000/api/v1/mobility-model/analysis?user_id=user&analysis_id=analysis'`
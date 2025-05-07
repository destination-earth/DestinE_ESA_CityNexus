# CityNexus Backend API project
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
 - `poetry run uvicorn citynexus_api.api.app:app --reload`

## Run API with HTTPS support

Running the API with HTTPS support is done automatically via nginx proxy on the visualization machine. Below is the 
nginx configuration file on OVH Cloud.

```
//etc/nginx/conf.d # cat citynexus.conf
```
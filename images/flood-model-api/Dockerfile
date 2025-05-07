FROM gitlab.esa.int:4567/ai4eo/immersive-eo/flood-model:v0.2

ENV PYTHONFAULTHANDLER=1 \
  PYTHONUNBUFFERED=1 \
  PIP_NO_CACHE_DIR=off \
  PIP_DISABLE_PIP_VERSION_CHECK=on \
  POETRY_NO_INTERACTION=1 \
  #POETRY_VIRTUALENVS_CREATE=false \
  POETRY_CACHE_DIR='/var/cache/pypoetry' \
  POETRY_HOME='/usr/local' \
  POETRY_VERSION=1.7.1

RUN apt update && apt install -y curl && \
    curl -sSL https://install.python-poetry.org | python3 -

RUN mkdir /model_output
WORKDIR /flood-model-api
COPY poetry.lock pyproject.toml README.md /flood-model-api/
COPY flood_model_api /flood-model-api/flood_model_api/

RUN poetry install --no-interaction --no-ansi

ENTRYPOINT ["poetry", "run", "uvicorn", "flood_model_api.api.app:app", "--host", "0.0.0.0", "--port", "8000"]

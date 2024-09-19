FROM registry.solenix.ch/slxengde-citynexus-2023/mobility-model:latest

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

RUN mkdir /model_input /model_output
WORKDIR /mobility-model-api
COPY poetry.lock pyproject.toml README.md /mobility-model-api/
COPY mobility_model_api/ /mobility-model-api/mobility_model_api/

RUN poetry install --no-interaction --no-ansi

CMD ["poetry", "run", "uvicorn", "mobility_model_api.api.app:app", "--host", "0.0.0.0", "--port", "8000"]

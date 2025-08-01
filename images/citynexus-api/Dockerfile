FROM python:3.11-alpine

ENV PYTHONFAULTHANDLER=1 \
  PYTHONUNBUFFERED=1 \
  PIP_NO_CACHE_DIR=off \
  PIP_DISABLE_PIP_VERSION_CHECK=on \
  POETRY_NO_INTERACTION=1 \
  #POETRY_VIRTUALENVS_CREATE=false \
  POETRY_CACHE_DIR='/var/cache/pypoetry' \
  POETRY_HOME='/usr/local' \
  POETRY_VERSION=1.7.1

ARG KEYCLOAK_SERVER
ARG KEYCLOAK_REALM
ARG KEYCLOAK_CLIENT_ID
ARG STORAGE_PATH
ARG BASE_URL
ENV KEYCLOAK_REALM=$KEYCLOAK_REALM
ENV KEYCLOAK_SERVER=$KEYCLOAK_SERVER
ENV KEYCLOAK_CLIENT_ID=$KEYCLOAK_CLIENT_ID
ENV STORAGE_PATH=$STORAGE_PATH
ENV BASE_URL=$BASE_URL

RUN apk add curl envsubst && \
    curl -sSL https://install.python-poetry.org | python3 -

WORKDIR /citynexus-api
COPY poetry.lock pyproject.toml README.md /citynexus-api/
COPY citynexus_api /citynexus-api/citynexus_api/

RUN poetry install --no-interaction --no-ansi

RUN pip uninstall -y setuptools && \
    pip install --force-reinstall --no-cache-dir setuptools==75.0.0

RUN find /usr/local/lib/python3.11/site-packages/ -name 'setuptools-65.5.0*' -exec rm -rf {} + && \
    find /usr/local/venv/lib/python3.11/site-packages/ -name 'setuptools-65.5.0*' -exec rm -rf {} +

RUN envsubst < /citynexus-api/citynexus_api/config.toml.template > /citynexus-api/citynexus_api/config.toml

CMD ["poetry", "run", "uvicorn", "citynexus_api.api.app:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]

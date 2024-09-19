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

ARG OVH_ENDPOINT
ARG OVH_ACCESS_KEY
ARG OVH_SECRET_KEY
ARG KEYCLOAK_SERVER
ARG KEYCLOAK_REALM
ARG KEYCLOAK_CLIENT_ID
ENV OVH_ENDPOINT=$OVH_ENDPOINT
ENV OVH_ACCESS_KEY=$OVH_ACCESS_KEY
ENV OVH_SECRET_KEY=$OVH_SECRET_KEY
ENV KEYCLOAK_REALM=$KEYCLOAK_REALM
ENV KEYCLOAK_SERVER=$KEYCLOAK_SERVER
ENV KEYCLOAK_CLIENT_ID=$KEYCLOAK_CLIENT_ID

RUN apk add curl envsubst && \
    curl -sSL https://install.python-poetry.org | python3 -

WORKDIR /citynexus-api
COPY poetry.lock pyproject.toml README.md /citynexus-api/
COPY citynexus_api/ /citynexus-api/citynexus_api/

RUN poetry install --no-interaction --no-ansi
RUN envsubst < /citynexus-api/citynexus_api/config.toml.template > /citynexus-api/citynexus_api/config.toml

CMD ["poetry", "run", "uvicorn", "citynexus_api.api.app:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]

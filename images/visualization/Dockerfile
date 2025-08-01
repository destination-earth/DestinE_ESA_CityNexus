# Image 1 - Build the bundle
FROM node:18.20.7-alpine as build

## Docker build arguments with defaults
ARG BACKEND_API_ENDPOINT
ENV BACKEND_API_ENDPOINT=$BACKEND_API_ENDPOINT
ARG KEYCLOAK_CLIENT_ID
ENV KEYCLOAK_CLIENT_ID=$KEYCLOAK_CLIENT_ID
ARG KEYCLOAK_AUTHORITY
ENV KEYCLOAK_AUTHORITY=$KEYCLOAK_AUTHORITY

## Change working directory and copy all relevant files
WORKDIR /home/node/app

COPY desp ./desp
COPY src ./src
COPY babel.config.js package.json webpack.config.js yarn.lock favicon.ico favicon-immerseon.ico index.html index-immerseon.html ./

## Special handling for index.html if we are running immerseon
RUN case "$BACKEND_API_ENDPOINT" in \
        *"immerseon"*) \
            mv ./index-immerseon.html ./index.html; \
            mv ./favicon-immerseon.ico ./favicon.ico; \
            ;; \
    esac

## Write an .env file based on build arguments
RUN echo "DATA_URL="$BACKEND_API_ENDPOINT > .env_vars
RUN echo "REACT_APP_KEYCLOAK_AUTHORITY="$KEYCLOAK_AUTHORITY >> .env_vars
RUN echo "REACT_APP_KEYCLOAK_CLIENT_ID="$KEYCLOAK_CLIENT_ID >> .env_vars


## Build application bundle
RUN yarn install
RUN npm run build

# Image 2 - Serve the bundle

FROM httpd:2.4.63-alpine as server

RUN apk update && apk upgrade --available && \
    apk add --no-cache expat libxml2

COPY --from=build /home/node/app/build /usr/local/apache2/htdocs/
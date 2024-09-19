# Image 1 - Build the bundle
FROM node:18.20.2 as build

## Docker build arguments with defaults
ARG GITLAB_API_TOKEN='empty'
ENV GITLAB_API_TOKEN_ENV=$GITLAB_API_TOKEN
ARG KEYCLOAK_CLIENT_ID
ENV KEYCLOAK_CLIENT_ID=$KEYCLOAK_CLIENT_ID
ARG KEYCLOAK_AUTHORITY
ENV KEYCLOAK_AUTHORITY=$KEYCLOAK_AUTHORITY

## Change working directory and copy all relevant files
WORKDIR /home/node/app

COPY src/ ./src
COPY babel.config.js index.html package.json webpack.config.js yarn.lock ./

## Write an .env file based on build arguments
RUN echo "GITLAB_API_TOKEN="$GITLAB_API_TOKEN_ENV > .env_vars
RUN echo "REACT_APP_KEYCLOAK_AUTHORITY="$KEYCLOAK_AUTHORITY >> .env_vars
RUN echo "REACT_APP_KEYCLOAK_CLIENT_ID="$KEYCLOAK_CLIENT_ID >> .env_vars

## Build application bundle
RUN yarn install
RUN npm run build



# Image 2 - Serve the bundle

FROM httpd:2.4 as server

COPY --from=build /home/node/app/build /usr/local/apache2/htdocs/
# Image 1 - Build the bundle
FROM node:18.20.2 as build

## Docker build arguments with defaults
ARG GITLAB_API_TOKEN='empty'
ENV GITLAB_API_TOKEN_ENV=$GITLAB_API_TOKEN

## Change working directory and copy all relevant files
WORKDIR /home/node/app

COPY src/ ./src
COPY babel.config.js ./
COPY index.html ./
COPY package.json ./
COPY webpack.config.js ./
COPY yarn.lock ./

## Write an .env file based on build arguments
RUN touch .env
RUN echo "GITLAB_API_TOKEN="$GITLAB_API_TOKEN_ENV >> .env

## Build application bundle
RUN yarn install
RUN npm run build



# Image 2 - Serve the bundle

FROM httpd:2.4 as server

COPY --from=build /home/node/app/build /usr/local/apache2/htdocs/
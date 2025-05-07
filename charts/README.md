# Set up CityNexus inside Minikube

This instruction is for Windows machine use case.

## Start Minikube

This command will start Minikube with the profile **minikube**

`minikube start -p minikube docker-env`

## Point to the Docker inside Minikube to build Docker images there

`eval $(minikube docker-env)`

or

`& minikube -p citynexus docker-env --shell powershell | Invoke-Expression`

## Build the CityNexus containers

Executing these commands in the **visualization** folder directory. The variable values can be found in the [Gitlab CICD pipeline](https://gitlab.solenix.ch/slxengde-citynexus-2023/visualization/-/settings/ci_cd).

- Frontend:

`docker build --pull --build-arg BACKEND_API_ENDPOINT=$BACKEND_API_ENDPOINT --build-arg KEYCLOAK_AUTHORITY=${KEYCLOAK_SERVER}realms/${KEYCLOAK_REALM} --build-arg KEYCLOAK_CLIENT_ID=$KEYCLOAK_CLIENT_ID -t citynexus-frontend .`

- Backend (API)

`docker build --pull --build-arg KEYCLOAK_REALM=$KEYCLOAK_REALM --build-arg KEYCLOAK_SERVER=$KEYCLOAK_SERVER --build-arg KEYCLOAK_CLIENT_ID=$KEYCLOAK_CLIENT_ID -t citynexus-api ./api/citynexus-api`

- Mobility Model API:

`docker build --pull -t citynexus-mobility-model-api ./api/mobility-model-api`

## Create the deployments

`kubectl apply -f <path-to-folder-containing-all-deployment-files>`

For instance:

`kubectl apply -f .\minikube\`

## Verify that all pods created and run successfully

`kubectl get deployments`

`kubectl get pods`

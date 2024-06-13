import logging
import sys
from http import HTTPStatus
from typing import Any, Dict

from fastapi import Depends, FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi_keycloak_middleware import KeycloakConfiguration, setup_keycloak_middleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from mobility_model_api.api.v1.analysis import MobilityModelException, api_router
from mobility_model_api.model.generic import ApiResponse
from mobility_model_api.util.exception_helper import derive_exception_message

KEYCLOAK_SERVER = "https://iam.ivv.desp.space/"
KEYCLOAK_REALM = "desp"
KEYCLOAK_CLIENT_ID = "citynexus"


logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s: %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


app = FastAPI(title="CityNexus Mobility Model API", openapi_url="/openapi.json")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

# available claims: ['exp', 'iat', 'auth_time', 'jti', 'iss', 'sub', 'typ', 'azp',
# 'session_state', 'resource_access', 'scope', 'sid', 'preferred_username']
keycloak_config = KeycloakConfiguration(
    url=KEYCLOAK_SERVER,
    realm=KEYCLOAK_REALM,
    client_id=KEYCLOAK_CLIENT_ID,
    authentication_scheme="Token",
    claims=["preferred_username", "resource_access"],
)


async def map_user(userinfo: Dict[str, Any]) -> Dict[str, Any]:
    """
    Reads the claims specified in KeycloakConfiguration from the user's access_token and maps them
    to a custom user object, which is added to the request object to be used from endpoints.
    :param userinfo: Subset of claims as specified in KeycloakConfiguration.
    :return: Custom user object.
    """
    user = {
        "name": userinfo["preferred_username"],
        "access": userinfo["resource_access"],
    }
    return user


async def get_user(request: Request) -> Dict[str, Any]:
    """
    Reads the custom user object from the request for further processing before it is used by the endpoints.
    Can be for example used to verify the user in the database or load additional information.
    :param request: The API request including custom user object.
    :return: A transformed representation of the user object.
    """
    user_name = request.user["name"]
    user_access = request.user["access"]
    return {
        "user": user_name,
        "access": user_access,
    }


setup_keycloak_middleware(
    app,
    keycloak_configuration=keycloak_config,
    user_mapper=map_user,
)


@app.get(
    "/",
    tags=["CityNexus API"],
    status_code=HTTPStatus.OK.value,
    response_model=ApiResponse,
)
async def root(user: Dict[str, Any] = Depends(get_user)) -> ApiResponse:
    """
    Endpoint that returns the name of this REST API for testing purposes.
    """
    print(user)
    return ApiResponse(response=app.title)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exceptions: RequestValidationError):
    """Exception handler for validation errors."""
    response = {"detail": exceptions.errors()}
    return JSONResponse(response, status_code=HTTPStatus.UNPROCESSABLE_ENTITY.value)


@app.exception_handler(MobilityModelException)
async def dataset_exception_handler(request: Request, ex: MobilityModelException):
    """Exception handler for errors in the mobility-model endpoints."""
    response = {"detail": derive_exception_message(ex, default_msg="Error in mobility-model endpoint")}
    return JSONResponse(response, status_code=HTTPStatus.UNPROCESSABLE_ENTITY.value)


def run():
    """Runs this API locally on uvicorn for debugging purposes."""
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")


if __name__ == "__main__":
    run()

from http import HTTPStatus

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from starlette.requests import Request
from starlette.responses import JSONResponse

from citynexus_api.api.v1.predictions import router as predictions_router
from citynexus_api.api.v1.scenarios import router as scenarios_router
from citynexus_api.middleware.cors import add_cors_middleware
from citynexus_api.middleware.keycloak import add_keycloak_middleware
from citynexus_api.middleware.logging import add_logging_middleware
from citynexus_api.middleware.user_request_mapping import (
    add_user_request_mapping_middleware,
)
from citynexus_api.model.generic import ApiResponse
from citynexus_api.util.logging import (
    configure_api_logger,
    configure_uvicorn_logger,
)

MODEL_API_PREFIX = "/api/v1/citynexus"

configure_api_logger()
configure_uvicorn_logger()

app = FastAPI(title="CityNexus API", openapi_url="/openapi.json")
app.include_router(predictions_router, prefix=f"{MODEL_API_PREFIX}/predictions")
app.include_router(scenarios_router, prefix=f"{MODEL_API_PREFIX}/scenarios")

# order matters, last-added middleware is first in queue
add_logging_middleware(app)
add_user_request_mapping_middleware(app)
add_keycloak_middleware(app)
add_cors_middleware(app)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exceptions: RequestValidationError):
    """Exception handler for validation errors."""
    response = {"detail": exceptions.errors()}
    return JSONResponse(response, status_code=HTTPStatus.UNPROCESSABLE_ENTITY.value)


@app.get(
    "/",
    tags=["CityNexus API"],
    status_code=HTTPStatus.OK.value,
    response_model=ApiResponse,
)
async def root() -> ApiResponse:
    """
    Endpoint that returns the name of this REST API for testing purposes.
    """
    return ApiResponse(response=app.title)


def run():
    """Runs this API locally on uvicorn for debugging purposes."""
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")


if __name__ == "__main__":
    run()

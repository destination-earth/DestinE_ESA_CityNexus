import logging
import sys
from http import HTTPStatus

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from starlette.requests import Request
from starlette.responses import JSONResponse

from citynexus_api.api.v1.predictions import router as predictions_router
from citynexus_api.api.v1.scenarios import router as scenarios_router
from citynexus_api.middleware.cors import add_cors_middleware
from citynexus_api.middleware.keycloak import add_keycloak_middleware

from citynexus_api.model.generic import ApiResponse

MODEL_API_PREFIX = "/api/v1/citynexus"

logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s: %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="CityNexus CityNexus API", openapi_url="/openapi.json")
app.include_router(predictions_router, prefix=f"{MODEL_API_PREFIX}/predictions")
app.include_router(scenarios_router, prefix=f"{MODEL_API_PREFIX}/scenarios")

# order matters, last-added middleware is first in queue
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

import logging
from http import HTTPStatus

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from mobility_model_api.api.v1.analysis import api_router
from mobility_model_api.model.generic import ApiResponse
from mobility_model_api.util.exception_helper import derive_exception_message
from mobility_model_api.util.exceptions import MobilityModelException

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s:  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

app = FastAPI(title="CityNexus Mobility Model API", openapi_url="/openapi.json")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


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

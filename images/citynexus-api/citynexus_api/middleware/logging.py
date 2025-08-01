import logging
from datetime import datetime, timezone

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from citynexus_api.util.logging import configure_json_logger

logger = logging.getLogger(__name__)

DATE_ISO_FORMAT = "%Y-%m-%dT%H:%M:%SZ"


class LoggingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, logger: logging.Logger):
        super().__init__(app)
        self.logger = logger

    async def dispatch(self, request, call_next):
        """Logs every endpoint request using the JSON logger."""
        event_timestamp = datetime.now(timezone.utc)
        response = await call_next(request)
        response_time_ms = int((datetime.now(timezone.utc) - event_timestamp).total_seconds() * 1000)

        if request.url.path.startswith("/api"):
            user_id = getattr(request.state, "user", "unauthenticated")
            self.logger.info(
                "Incoming request",
                extra={
                    "@timestamp": datetime.now(timezone.utc).strftime(DATE_ISO_FORMAT),
                    "service_name:": "citynexus",
                    "event_timestamp": event_timestamp.strftime(DATE_ISO_FORMAT),
                    "event_type": "incoming_request",
                    "user_id": user_id,
                    "url": request.url.path,
                    "http_method": request.method,
                    "query_params": dict(request.query_params),
                    "status_code": response.status_code,
                    "response_time_ms": response_time_ms,
                },
            )
        return response


def add_logging_middleware(app):
    middleware_logger = logging.getLogger("endpoint_logger")
    configure_json_logger(middleware_logger)
    app.add_middleware(LoggingMiddleware, logger=middleware_logger)

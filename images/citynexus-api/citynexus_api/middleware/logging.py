import logging
from datetime import datetime, timezone

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class LoggingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, logger: logging.Logger):
        super().__init__(app)
        self.logger = logger

    async def dispatch(self, request, call_next):
        """ Logs every endpoint request using the JSON logger. """
        response = await call_next(request)
        if user_id := getattr(request.state, "user", "unauthenticated"):
            self.logger.info(
                "Incoming request",
                extra={
                    "event_timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "http_method": request.method,
                    "url": str(request.url),
                    "status_code": response.status_code,
                    "user_id": user_id,
                },
            )
        return response


def add_logging_middleware(app, logger):
    app.add_middleware(LoggingMiddleware, logger=logger)

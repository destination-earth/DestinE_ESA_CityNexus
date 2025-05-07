from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from citynexus_api.middleware.keycloak import get_user


class UserRequestMappingMiddleware(BaseHTTPMiddleware):
    """ Reads the user from the request and adds the name request state that is used by the logging middleware. """
    async def dispatch(self, request: Request, call_next):
        user = await get_user(request)

        if user and (username := user.get("user")):
            request.state.user = username
        else:
            request.state.user = "unauthenticated"

        response = await call_next(request)
        return response


def add_user_request_mapping_middleware(app):
    app.add_middleware(UserRequestMappingMiddleware)

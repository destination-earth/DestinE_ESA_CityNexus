import typing

from fastapi_keycloak_middleware import KeycloakMiddleware, KeycloakConfiguration
from starlette.requests import HTTPConnection
from starlette.types import Receive, Scope, Send, ASGIApp


class KeycloakWithGuestsMiddleware(KeycloakMiddleware):
    def __init__(
        self,
        app: ASGIApp,
        keycloak_configuration: KeycloakConfiguration,
        exclude_patterns: typing.List[str] = None,
        user_mapper: typing.Callable[[typing.Dict[str, typing.Any]], typing.Awaitable[typing.Any]] = None,
        scope_mapper: typing.Callable[[typing.List[str]], typing.Awaitable[typing.List[str]]] = None,
    ):
        super().__init__(app, keycloak_configuration, exclude_patterns, user_mapper, scope_mapper)

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope['type'] == 'lifespan':
            # Lifespan scope, proceed without using HTTPConnection
            await self.app(scope, receive, send)
        else:
            # It's either an HTTP or WebSocket scope, so proceed with your logic
            conn = HTTPConnection(scope)
            auth_header = conn.headers.get("Authorization", None)

        # skip authentication if no authorization header (user is a guest)
        if not auth_header or auth_header == "Token undefined":
            await self.app(scope, receive, send)
        else:
            await super().__call__(scope, receive, send)

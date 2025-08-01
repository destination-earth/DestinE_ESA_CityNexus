import logging
import typing
from typing import Dict, Any

from fastapi import Depends, FastAPI
from fastapi.security import OpenIdConnect
from fastapi_keycloak_middleware.schemas.exception_response import ExceptionResponse
from starlette.requests import Request

from fastapi_keycloak_middleware import setup_keycloak_middleware, KeycloakConfiguration

from citynexus_api.middleware.guest import KeycloakWithGuestsMiddleware
from citynexus_api.config import config

KEYCLOAK_REALM = config.keycloak["realm"]
KEYCLOAK_SERVER = config.keycloak["server"]
KEYCLOAK_CLIENT_ID = config.keycloak["client_id"]
log = logging.getLogger(__name__)

# available claims: ['exp', 'iat', 'auth_time', 'jti', 'iss', 'sub', 'typ', 'azp',
# 'session_state', 'resource_access', 'scope', 'sid', 'preferred_username']
keycloak_config = KeycloakConfiguration(
    url=KEYCLOAK_SERVER,
    realm=KEYCLOAK_REALM,
    client_id=KEYCLOAK_CLIENT_ID,
    authentication_scheme="Token",
    claims=["sub"],
    reject_on_missing_claim=False,
)


async def map_user(userinfo: Dict[str, Any]) -> Dict[str, Any]:
    """
    Reads the claims specified in KeycloakConfiguration from the user's access_token and maps them
    to a custom user object, which is added to the request object to be used from endpoints.
    :param userinfo: Subset of claims as specified in KeycloakConfiguration.
    :return: Custom user object.
    """
    user = {
        "name": userinfo["sub"],
        "access": userinfo.get("resource_access", None)
    }
    return user


async def get_user(request: Request) -> Dict[str, Any]:
    """
    Reads the custom user object from the request for further processing before it is used by the endpoints.
    Can be for example used to verify the user in the database or load additional information.
    :param request: The API request including custom user object.
    :return: A transformed representation of the user object.
    """
    if "user" in request.scope:
        user_name = request.user["name"]
        user_access = request.user["access"]
        return {"user": user_name, "access": user_access}
    else:
        return {"user": None, "access": None}


def is_logged_in(user):
    return user["user"] is not None


# taken from the keycloak code (setup.py), but modified to replace KeycloakMiddleware with
# our override KeycloakWithGuestsMiddleware
def setup_keycloak_middleware(  # pylint: disable=too-many-arguments
    app: FastAPI,
    keycloak_configuration: KeycloakConfiguration,
    exclude_patterns: typing.List[str] = None,
    user_mapper: typing.Callable[[typing.Dict[str, typing.Any]], typing.Awaitable[typing.Any]] = None,
    scope_mapper: typing.Callable[[typing.List[str]], typing.Awaitable[typing.List[str]]] = None,
    add_exception_response: bool = True,
    add_swagger_auth: bool = False,
    swagger_auth_scopes: typing.List[str] = None,
    swagger_auth_pkce: bool = True,
    swagger_scheme_name: str = "keycloak-openid",
):
    """
    This function can be used to initialize the middleware on an existing
    FastAPI application. Note that the middleware can also be added directly.

    This function adds the benefit of automatically adding correct response
    types as well as the OpenAPI configuration.

    :param app: The FastAPI app instance, required
    :param keycloak_configuration: KeyCloak configuration object. For potential
        options, see the KeycloakConfiguration schema.
    :type keycloak_configuration: KeycloakConfiguration
    :param exclude_patterns: List of paths that should be excluded from authentication.
        Defaults to an empty list. The strings will be compiled to regular expressions
        and used to match the path. If the path matches, the middleware
        will skip authentication.
    :type exclude_patterns: typing.List[str], optional
    :param user_mapper: Custom async function that gets the userinfo extracted from AT
        and should return a representation of the user that is meaningful to you,
        the user of this library, defaults to None
    :type user_mapper:
        typing.Callable[ [typing.Dict[str, typing.Any]], typing.Awaitable[typing.Any] ]
        optional
    :param scope_mapper: Custom async function that transforms the claim values
        extracted from the token to permissions meaningful for your application,
        defaults to None
    :type scope_mapper: typing.Callable[[typing.List[str]], typing.List[str]], optional
    :param add_exception_response: Whether to add exception responses for 401 and 403.
        Defaults to True.
    :type add_exception_response: bool, optional
    :param add_swagger_auth: Whether to add OpenID Connect authentication to the OpenAPI
        schema. Defaults to False.
    :type add_swagger_auth: bool, optional
    :param swagger_auth_scopes: Scopes to use for the Swagger UI authentication.
        Defaults to ['openid', 'profile'].
    :type swagger_auth_scopes: typing.List[str], optional
    :param swagger_auth_pkce: Whether to use PKCE with the Swagger UI authentication.
        Defaults to True.
    :type swagger_auth_pkce: bool, optional
    :param swagger_scheme_name: Name of the OpenAPI security scheme. Defaults to
        'keycloak-openid'.
    :type swagger_scheme_name: str, optional
    """

    # Add middleware
    app.add_middleware(
        KeycloakWithGuestsMiddleware,
        keycloak_configuration=keycloak_configuration,
        user_mapper=user_mapper,
        scope_mapper=scope_mapper,
        exclude_patterns=exclude_patterns,
    )

    # Add exception responses if requested
    if add_exception_response:
        router = app.router if isinstance(app, FastAPI) else app
        if 401 not in router.responses:
            log.debug("Adding 401 exception response")
            router.responses[401] = {
                "description": "Unauthorized",
                "model": ExceptionResponse,
            }
        else:
            log.warning("Middleware is configured to add 401 exception" " response but it already exists")

        if 403 not in router.responses:
            log.debug("Adding 403 exception response")
            router.responses[403] = {
                "description": "Forbidden",
                "model": ExceptionResponse,
            }
        else:
            log.warning("Middleware is configured to add 403 exception" " response but it already exists")
    else:
        log.debug("Skipping adding exception responses")

    # Add OpenAPI schema
    if add_swagger_auth:
        suffix = "/.well-known/openid-configuration"
        security_scheme = OpenIdConnect(
            openIdConnectUrl=f"{keycloak_configuration.url}realms/{keycloak_configuration.realm}{suffix}",
            scheme_name=swagger_scheme_name,
            auto_error=False,
        )
        client_id = (
            keycloak_configuration.swagger_client_id
            if keycloak_configuration.swagger_client_id
            else keycloak_configuration.client_id
        )
        scopes = swagger_auth_scopes if swagger_auth_scopes else ["openid", "profile"]
        swagger_ui_init_oauth = {
            "clientId": client_id,
            "scopes": scopes,
            "appName": app.title,
            "usePkceWithAuthorizationCodeGrant": swagger_auth_pkce,
        }
        app.swagger_ui_init_oauth = swagger_ui_init_oauth
        app.router.dependencies.append(Depends(security_scheme))


def add_keycloak_middleware(app):
    setup_keycloak_middleware(
        app,
        keycloak_configuration=keycloak_config,
        user_mapper=map_user,
    )

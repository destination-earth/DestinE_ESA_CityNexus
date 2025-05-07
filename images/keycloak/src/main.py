import json
from os import environ as env
from pprint import pprint

from jwt.utils import base64url_decode
from keycloak import KeycloakOpenID

SERVER_URL = "https://iam.ivv.desp.space/"
CLIENT_ID = "citynexus"
REALM = "desp"
KEPLER_URL = "https://immerseon.solenix.ch"


def decode_jwt(token):
    header, payload, signature = token.split(".")
    return {
        "header": json.loads(base64url_decode(header).decode("utf-8")),
        "payload": json.loads(base64url_decode(payload).decode("utf-8")),
        "signature": base64url_decode(signature),
    }


def main():
    print("Connect to Keycloak server...")
    keycloak_openid = KeycloakOpenID(
        server_url=SERVER_URL,
        client_id=CLIENT_ID,
        realm_name=REALM,
    )

    print("Load OpenID well-knowns...")
    config_well_known = keycloak_openid.well_known()

    print("Authentication URL:")
    auth_url = keycloak_openid.auth_url(redirect_uri=KEPLER_URL, scope="openid", state="state_info")
    print(auth_url)

    code = input("Open the Authentication URL, log in and provide the content of the GET parameter 'code': ")

    print("Retrieve tokens...", end="")
    token = keycloak_openid.token(grant_type="authorization_code", code=code, redirect_uri=KEPLER_URL)

    print("Access Token (decoded):")
    pprint(decode_jwt(token["access_token"]))
    print()

    print("User Info:")
    userinfo = keycloak_openid.userinfo(token["access_token"])
    pprint(userinfo)

    print("access_token")
    print(token["access_token"])


if __name__ == "__main__":
    main()

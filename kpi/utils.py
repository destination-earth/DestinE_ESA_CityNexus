import json
import logging
from urllib.parse import parse_qs, urlparse

import requests
from lxml import html


def set_config(conf_path):
    with open(conf_path, "r") as f:
        conf_dict = json.loads(f.read())
    return conf_dict


def set_logger(service_name, log_file, log_level="INFO"):
    level = logging.getLevelName(log_level)
    logging.basicConfig(
        level=level,
        format="[%(asctime)s.%(msecs)03d][%(name)s][%(levelname)s]: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        filename=log_file,
        filemode="a",
    )
    logger_obj = logging.getLogger(service_name)
    return logger_obj


def generate_access_token(conf_dict):
    try:
        with requests.Session() as s:
            # Get the auth url
            response = s.get(
                url=conf_dict["auth"]["iam_url"] + "realms/desp/protocol/openid-connect/auth",
                params={
                    "client_id": conf_dict["auth"]["auth_url"]["client_id"],
                    "client_secret": conf_dict["auth"]["auth_url"]["client_secret"],
                    "redirect_uri": conf_dict["auth"]["auth_url"]["redirect_uri"],
                    "scope": conf_dict["auth"]["auth_url"]["scope"],
                    "response_type": conf_dict["auth"]["auth_url"]["response_type"],
                },
            )
            response.raise_for_status()
            auth_url = html.fromstring(response.content.decode()).forms[0].action

            # Login and get auth code
            login = s.post(
                auth_url,
                data={
                    "username": conf_dict["auth"]["login"]["username"],
                    "password": conf_dict["auth"]["login"]["password"],
                },
                allow_redirects=eval(conf_dict["auth"]["login"]["allow_redirects"]),
            )

            # We expect a 302 status code
            if login.status_code == 200:
                tree = html.fromstring(login.content)
                error_message_element = tree.xpath('//span[@id="input-error"]/text()')
                error_message = error_message_element[0].strip() if error_message_element else "Error message not found"
                raise Exception(error_message)

            if login.status_code != 302:
                raise Exception("Login failed")

            auth_code = parse_qs(urlparse(login.headers["Location"]).query)["code"][0]

            # Use the auth code to get the token
            response = requests.post(
                conf_dict["auth"]["iam_url"] + "realms/desp/protocol/openid-connect/token",
                data={
                    "client_id": conf_dict["auth"]["token"]["client_id"],
                    "client_secret": conf_dict["auth"]["auth_url"]["client_secret"],
                    "redirect_uri": conf_dict["auth"]["token"]["redirect_uri"],
                    "code": auth_code,
                    "grant_type": conf_dict["auth"]["token"]["grant_type"],
                    "scope": conf_dict["auth"]["token"]["scope"],
                },
            )

            if response.status_code != 200:
                raise Exception("Failed to get token for DESP " + conf_dict["service_tag"])

            # instead of storing the access token, we store the offline_access (kind of "refresh") token
            token = response.json()["access_token"]
            return token
    except Exception as e:
        raise Exception("Failed to generate token for DestinE " + conf_dict["service_tag"] + ": " + str(e))

    return None

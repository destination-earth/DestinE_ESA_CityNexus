import os
import sys
import time
from datetime import datetime, timezone

from elasticsearch import Elasticsearch

sys.path.append(os.path.dirname(os.path.realpath(__file__)) + "/..")
from utils import generate_access_token, set_config, set_logger

### PART 1 – VARIABLES DEFINITION ###
dir_path = os.path.dirname(os.path.realpath(__file__))
conf_dict = set_config(dir_path + "/conf.json")
logger_obj = set_logger(conf_dict["service_tag"], conf_dict["log_file"])
exception_details = ""

if eval(conf_dict["monitoring"]["enabled"]):
    es = Elasticsearch(
        [conf_dict["monitoring"]["url"]],
        headers={"Authorization": "ApiKey " + conf_dict["monitoring"]["api_key"]},
        verify_certs=eval(conf_dict["monitoring"]["verify_certs"]),
    )

# TODO(AA):  set other custom parameters


### PART 2 – AUTHENTICATION ###
try:
    start_time = time.perf_counter()
    access_token = generate_access_token(conf_dict)
    login_time = time.perf_counter() - start_time
except Exception as e:
    exception_details = str(e)

timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
if exception_details == "":
    login_data = {
        "@timestamp": timestamp,
        "event_timestamp": timestamp,
        "event_type": "login_completed",
        "response_status": "OK",
        "response_time": str(login_time),
    }
    logger_obj.info("Login successful - Login Time: " + str(login_time) + " sec")
    exception_details = ""
else:
    login_data = {
        "@timestamp": timestamp,
        "event_timestamp": timestamp,
        "event_type": "login_failed",
        "response_status": "NOK",
        "error_detail": exception_details,
    }
    logger_obj.error("Login failed - Exception Details: " + exception_details)

if eval(conf_dict["monitoring"]["enabled"]):
    login_request = es.index(index=conf_dict["monitoring"]["index"], document=login_data)

### PART 3 – MEASUREMENT OF RELIABILITY OF THE SERVICE ###
try:
    # TODO(AA): custom instructions to measure the reliability of the service
    pass
except Exception as e:
    exception_details = str(e)

timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
if exception_details == "":
    data = {
        "@timestamp": timestamp,
        "event_timestamp": timestamp,
        "event_type": "reliability_measurement_completed",
        "response_status": "OK",
        # TODO(AA): other custom fields
    }
    logger_obj.info("Reliability measurement completed")
else:
    data = {
        "@timestamp": timestamp,
        "event_timestamp": timestamp,
        "event_type": "reliability_measurement_failed",
        "response_status": "NOK",
        # TODO(AA): other custom fields
        "error_detail": exception_details,
    }
    logger_obj.error("Reliability measurement failed - Exception Details: " + exception_details)

if eval(conf_dict["monitoring"]["enabled"]):
    request = es.index(index=conf_dict["monitoring"]["index"], document=data)

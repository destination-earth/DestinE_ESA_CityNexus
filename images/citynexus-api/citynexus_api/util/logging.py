import logging
import sys
from logging.handlers import TimedRotatingFileHandler

from pythonjsonlogger import json as json_logger

LOG_FORMAT = "%(asctime)s: %(levelname)s - %(message)s"
LOG_FILE = "citynexus.log"


def configure_api_logger():
    """
    Configure the default logger so that the output is written to the console and to a logfile in daily rotation.
    """
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(logging.Formatter(LOG_FORMAT))
    file_handler = TimedRotatingFileHandler(LOG_FILE, when="midnight", interval=1, backupCount=7, encoding="utf-8")
    file_handler.setFormatter(logging.Formatter(LOG_FORMAT))
    logging.basicConfig(
        level=logging.INFO,
        handlers=[stream_handler, file_handler],
    )


def configure_json_logger(middleware_logger: logging.Logger):
    """
    Configure the middleware logger so that the output is written to the console and to a logfile in daily rotation.
    """
    json_handler = logging.StreamHandler()
    json_handler.setFormatter(json_logger.JsonFormatter())
    json_file_handler = TimedRotatingFileHandler(LOG_FILE, when="midnight", interval=1, backupCount=7, encoding="utf-8")
    json_file_handler.setFormatter(json_logger.JsonFormatter())
    middleware_logger.setLevel(logging.INFO)
    middleware_logger.handlers = [json_handler, json_file_handler]


def configure_uvicorn_logger():
    """
    Configure the uvicorn loggers so that the output is written to the console and to a logfile in daily rotation.
    """
    for name in ["uvicorn", "uvicorn.error", "uvicorn.access"]:
        stream_handler = logging.StreamHandler(sys.stdout)
        stream_handler.setFormatter(logging.Formatter(LOG_FORMAT))
        file_handler = TimedRotatingFileHandler(LOG_FILE, when="midnight", interval=1, backupCount=7, encoding="utf-8")
        file_handler.setFormatter(logging.Formatter(LOG_FORMAT))
        uvicorn_logger = logging.getLogger(name)
        uvicorn_logger.setLevel(logging.INFO)
        uvicorn_logger.handlers = [stream_handler, file_handler]
        uvicorn_logger.propagate = False

"""Provides a config dict loaded from the config.toml file."""

import os
from pathlib import Path
from types import SimpleNamespace

import tomli

CONFIG_PATH = Path(os.path.dirname(__file__)) / "config.toml"


def _load_config(config_path: Path) -> SimpleNamespace:
    """
    Loads the configuration from the config_path into a SimpleNamespace.
    :param config_path: The path to the config.toml.
    :return: The loaded configuration as SimpleNamespace object.
    """
    with open(config_path, "rb") as f:
        settings = tomli.load(f)
        return SimpleNamespace(**settings)


config = _load_config(CONFIG_PATH)

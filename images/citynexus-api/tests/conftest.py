from typing import Generator

import os
import shutil
import pytest
from fastapi.testclient import TestClient
from citynexus_api.api.app import app
from citynexus_api.middleware.keycloak import get_user


TEST_ID = "test_id"


@pytest.fixture(scope="session", autouse=True)
def remove_test_user_data_folder():
    folder_path = os.path.join(os.path.dirname(__file__), "../../../data/test_user")
    normalized_path = os.path.normpath(folder_path)
    if os.path.exists(normalized_path):
        shutil.rmtree(normalized_path)
    yield  # This allows the fixture to run code before and after the tests if needed.


@pytest.fixture(scope="function", autouse=True)
def mock_write_file_custom(mocker):
    mocker.patch("citynexus_api.api.v1.predictions.uuid4", return_value=TEST_ID)
    mocker.patch("citynexus_api.api.v1.scenarios.uuid4", return_value=TEST_ID)


@pytest.fixture(scope="function", autouse=True)
def mock_delete_object_custom(mocker):
    mocker.patch("os.remove")


@pytest.fixture(scope="function", autouse=True)
def mock_run_external_model(mocker):
    mocker.patch('citynexus_api.api.v1.predictions.run_external_model')


@pytest.fixture
def client_guest() -> Generator:
    app.dependency_overrides[get_user] = lambda: {"user": None, "access": None}
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def client_logged_in() -> Generator:
    app.dependency_overrides[get_user] = lambda: {"user": "test_user", "access": "test_access"}
    with TestClient(app) as test_client:
        yield test_client

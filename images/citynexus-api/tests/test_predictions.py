from tests.conftest import client_guest, client_logged_in, TEST_ID

valid_create_prediction_payload = {
    "scenarioId": "4e61e14f-c43e-48d5-be19-1b3561a57854",
    "mobility_model_input": {
        "grid": {},
        "road_network": {},
        "scenario": {
            "bycicle percentage": 0,
            "evehicle percentage": 0,
            "day type": [
                "weekday"
            ],
            "time slots": [
                3
            ]
        }
    }
}


def test_get_predictions_success(client_guest):
    """Test that a guest user can get a list of their predictions"""
    response = client_guest.get("/api/v1/citynexus/predictions")
    assert response.text != '[]'
    assert response.status_code == 200


def test_get_predictions_logged_in_success(client_logged_in):
    """Test that a logged in user can get a list of their predictions"""
    response = client_logged_in.get("/api/v1/citynexus/predictions")
    assert response.text == '[]'
    assert response.status_code == 200


def test_create_prediction_guest_failure(client_guest):
    """Test that a guest cannot create a prediction"""
    response = client_guest.post("/api/v1/citynexus/predictions?name=test_name", json=valid_create_prediction_payload)
    assert response.status_code == 403


def test_create_prediction_invalid_payload(client_logged_in):
    """Test that a logged in user cannot create a prediction with an invalid payload"""
    payload = {}  # Invalid payload structure
    response = client_logged_in.post("/api/v1/citynexus/predictions?name=test_name", json=payload)
    assert response.status_code == 422


def test_create_prediction_success(client_logged_in):
    """Test that a logged in user can create a prediction"""
    response = client_logged_in.post("/api/v1/citynexus/predictions?name=test_name",
                                     json=valid_create_prediction_payload)
    assert response.status_code == 200


def test_get_prediction_success(client_guest):
    """Test that a guest can get a prediction"""
    prediction_id = TEST_ID
    map_type = "config"  # Example map type, adjust based on actual usage
    response = client_guest.get(f"/api/v1/citynexus/predictions/{prediction_id}/{map_type}")
    assert response.status_code == 200


def test_get_prediction_not_found(client_guest):
    """Test that a guest cannot get a non-existing prediction"""
    prediction_id = "non_existing_id"
    map_type = "data"
    response = client_guest.get(f"/api/v1/citynexus/predictions/{prediction_id}/{map_type}?day_type=weekday")
    assert response.status_code == 404


def test_is_prediction_name_used_true(client_logged_in):
    """Test that a logged in user can check if a prediction name is used"""
    prediction_name = "test_name"
    response = client_logged_in.get(f"/api/v1/citynexus/predictions/{prediction_name}")
    assert response.status_code == 200
    assert response.json() == True


def test_is_prediction_name_used_false(client_logged_in):
    """Test that a logged in user can check if a prediction name is not used"""
    prediction_name = "unused_name"
    response = client_logged_in.get(f"/api/v1/citynexus/predictions/{prediction_name}")
    assert response.status_code == 200
    assert response.json() == False


def test_delete_prediction_guest_failure(client_guest):
    """Test that a guest cannot delete a prediction"""
    prediction_id = TEST_ID
    response = client_guest.delete(f"/api/v1/citynexus/predictions/{prediction_id}")
    assert response.status_code == 403


def test_delete_prediction_success(client_logged_in):
    """Test that a logged in user can delete a prediction"""
    prediction_id = TEST_ID
    response = client_logged_in.delete(f"/api/v1/citynexus/predictions/{prediction_id}?day_type=weekday")
    assert response.status_code == 200


def test_delete_prediction_not_found(client_logged_in):
    """Test that a logged in user cannot delete a non-existing prediction"""
    prediction_id = "non_existing_id"
    response = client_logged_in.delete(f"/api/v1/citynexus/predictions/{prediction_id}?day_type=weekday")
    assert response.status_code == 404
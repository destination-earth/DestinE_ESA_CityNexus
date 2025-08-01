from tests.conftest import client_guest, TEST_ID

valid_create_scenario_payload = {
    "data": {
        "changes": {
            "mobility_model_input": {
                "grid": [],
                "road_network": []
            }
        }
    }, "description": "A test scenario"
}


valid_update_scenario_payload = {
    "changes": {
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
}


def test_create_scenario_incorrect_input(client_logged_in):
    """Tests that a scenario cannot be created with invalid input"""
    payload = {"data": "some_data", "description": "A test scenario"}
    response = client_logged_in.post("/api/v1/citynexus/scenarios", json=payload)
    assert response.status_code == 422


def test_create_scenario_success(client_logged_in):
    """Tests that a scenario can be created with valid input"""
    response = client_logged_in.post(f"/api/v1/citynexus/scenarios?project=citynexus&city=copenhagen&name={TEST_ID}", json=valid_create_scenario_payload)
    assert response.status_code == 200


def test_create_scenario_unauthorized(client_guest):
    """Tests that a guest cannot create a scenario"""
    response = client_guest.post("/api/v1/citynexus/scenarios", json=valid_create_scenario_payload)
    assert response.status_code == 403


def test_get_scenarios_success(client_guest):
    """Tests that a guest can get a list of all scenarios"""
    response = client_guest.get("/api/v1/citynexus/scenarios")
    assert response.status_code == 200


def test_update_scenario_success(client_logged_in):
    """Tests that a logged in user can update a scenario"""
    scenario_id = TEST_ID
    response = client_logged_in.put(f"/api/v1/citynexus/scenarios/{scenario_id}", json=valid_update_scenario_payload)
    assert response.status_code == 200


def test_update_scenario_not_found(client_logged_in):
    """Tests that a user cannot update a non-existent scenario"""
    scenario_id = "non_existent_id"
    response = client_logged_in.put(f"/api/v1/citynexus/scenarios/{scenario_id}", json=valid_update_scenario_payload)
    assert response.status_code == 404


def test_update_scenario_unauthorized(client_guest):
    """Tests that a guest cannot update a scenario"""
    scenario_id = "any_id"
    response = client_guest.put(f"/api/v1/citynexus/scenarios/{scenario_id}", json=valid_update_scenario_payload)
    assert response.status_code == 403


def test_delete_scenario_success(client_logged_in):
    """Tests that a logged in user can delete a scenario"""
    scenario_id = TEST_ID
    response = client_logged_in.delete(f"/api/v1/citynexus/scenarios/{scenario_id}")
    assert response.status_code == 200


def test_delete_scenario_unauthorized(client_guest):
    """Tests that a guest cannot delete a scenario"""
    scenario_id = "any_id"
    response = client_guest.delete(f"/api/v1/citynexus/scenarios/{scenario_id}")
    assert response.status_code == 403


def test_delete_scenario_not_found(client_logged_in):
    """Tests that a user cannot delete a non-existent scenario"""
    scenario_id = "non_existent_id"
    response = client_logged_in.delete(f"/api/v1/citynexus/scenarios/{scenario_id}")
    assert response.status_code == 404
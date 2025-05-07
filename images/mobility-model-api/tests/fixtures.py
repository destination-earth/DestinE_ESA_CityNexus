import pytest


@pytest.fixture
def model_simulation_input():
    return {
        "simulation_id": {
            "user_id": "LqU3V6pSQpalg0v8TDITdFkeQhIeBF4AuBnDAdmA",
            "prediction_id": "0a1vj9ZHrmoq4PxSw1ac5G-xT9Bga9zOwkM_ZKzl",
        },
        "mobility_model_input": {},
    }


@pytest.fixture
def model_input():
    return {
        "grid": {},
        "road_network": {
            "18381": {"tunnel": True, "speed": 30},
            "20049": {"tunnel": True, "speed": 30},
            "24267": {"tunnel": True, "speed": 30},
            "24272": {"tunnel": True, "speed": 30},
        },
        "scenario": {
            "bycicle percentage": 0,
            "evehicle percentage": 0,
            "day type": ["weekday"],
            "time slots": [3],
        },
    }

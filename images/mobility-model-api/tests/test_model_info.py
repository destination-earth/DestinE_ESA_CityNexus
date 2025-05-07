import pytest
from shapely.geometry.linestring import LineString

from mobility_model_api.api.v1.model_info import _calculate_midpoint
from mobility_model_api.util.exceptions import MobilityModelException


def test_calculate_midpoint_empty_line():
    with pytest.raises(MobilityModelException):
        _calculate_midpoint(LineString([]))


def test_calculate_midpoint_two_coordinates():
    result = _calculate_midpoint(LineString([(1.0, 2.0), (3.0, 4.0)]))
    assert result == (2.0, 3.0)  # Midpoint calculation


def test_calculate_midpoint_three_coordinates():
    result = _calculate_midpoint(LineString([(1.0, 2.0), (3.0, 4.0), (5.0, 6.0)]))
    assert result == (3.0, 4.0)


def test_calculate_midpoint_four_coordinates():
    result = _calculate_midpoint(LineString([(1.0, 2.0), (3.0, 4.0), (5.0, 6.0), (7.0, 8.0)]))
    assert result == (5.0, 6.0)

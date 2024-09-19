from enum import Enum


class MapName(str, Enum):
    user_changes = "user_changes"
    base_roads = "base_roads"
    base_grid = "base_grid"

from enum import Enum


class MapType(str, Enum):
    data = "data"
    config = "config"
    xai_impact = "xai_impact"
    xai_diff = "xai_diffs"
    xai = "xai"

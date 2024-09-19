class InvalidAccessException(Exception):
    """The path based on UserAnalysis information points to an invalid directory,
    i.e. not inside the output directory."""

    pass


class NoResultException(Exception):
    """No simulation result has been found in the output directory."""

    pass


class MobilityModelException(Exception):
    """Top-level exception for errors within the mobility-model endpoints."""

    pass

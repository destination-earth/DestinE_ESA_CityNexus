import logging
import subprocess
from itertools import chain
from pathlib import Path

from flood_model_api.model.flood_model_input import FloodModelInput
from flood_model_api.util.exceptions import FloodModelException

# absolute path of the model executable
MODEL_BIN_PATH = Path("/run_flood_model")

# mapping from FloodModelInput field to corresponding model parameter
MODEL_PARAMETER_MAP = {
    "resolution": "--resolution",
    "rain_intensity": "--rain-intensity",
    "sea_discharge": "--sea-discharge",
    "river_discharge": "--river-discharge",
}


def run_model(model_parameters: FloodModelInput, output_file: Path) -> int:
    """
    Executes the model locally and stores the result in the output path.
    :param model_parameters: The input parameters of the model.
    :param output_file: The path and name of the output file.
    :return: The return code of the model process.
    """

    model_args = list(
        chain.from_iterable(
            (MODEL_PARAMETER_MAP[key], str(value)) for key, value in model_parameters.model_dump().items()
        )
    )

    output_args = [
        "--output-path",
        str(output_file.parent.absolute()),
        "--file-name",
        output_file.stem,
    ]

    run_model_cmd = [str(MODEL_BIN_PATH.absolute())] + model_args + output_args
    logging.info("> " + " ".join(run_model_cmd))

    output_file.parent.mkdir(parents=True, exist_ok=True)
    proc = subprocess.run(run_model_cmd, capture_output=True)
    logging.info(proc.stdout.decode("UTF-8"))
    logging.warning(proc.stderr.decode("UTF-8"))

    if proc.returncode:
        raise FloodModelException("Flood Model run failed.")
    else:
        logging.info("Flood Model run successfully completed.")

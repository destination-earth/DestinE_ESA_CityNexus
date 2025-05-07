# Flood Model

## Overview

This program is designed to run simulations of flood levels in a region. 

## Parameters

### Input Parameters

- `--resolution`:
  - **Type**: `int`
  - **Description**: Resolution of the pixel's output in meters.
  - **Usage**: Optional
  - **Default**: 100
  
- `--rain-intensity`:
  - **Type**: `float`
  - **Description**: Input the value of mm/h of rainfall
  - **Usage**: Optional
  - **Default**: 20
  
- `--sea-discharge`:
  - **Type**: `float`
  - **Description**: Factor increase of sea discharge.
  - **Usage**: Optional
  - **Default**: 1

- `--river-discharge`:
  - **Type**: `float`
  - **Description**: Factor increase of river discharge.
  - **Usage**: Optional
  - **Default**: 1

- `--output-path`:
  - **Type**: `str`
  - **Description**: Directory where output file will be saved.
  - **Default**: `/home/results`
  - **Usage**: Optional

- `--file-name`:
  - **Type**: `str`
  - **Description**: Prefix for the output .tiff file.
  - **Default**: `results_simulation`
  - **Usage**: Optional

# Mobility Model

## Overview

This program is designed to run simulations that involve the generation and the processing of origin-destination (OD) matrices and the subsequent simulation of predicted traffic flows through a physical model. It offers various parameters to customize the simulation, control output, and optimize performance.

## Parameters

### Flood Parameters

- `--flood-depth-map`:
  - **Type**: `str`
  - **Description**: Path to the tiff flood model output file
  - **Usage**: Required
  
- `--flood-depth-closing`:
  - **Type**: `float`
  - **Description**: Flood depth of a road used to close a road in meters
  - **Default**: 0.5
  - **Usage**: Optiponal
  
- `--flood-depth-slowing`:
  - **Type**: `float` or None
  - **Description**: Flood depth used to slow down a road (if None it does not slow down)
  - **Default**: None
  - **Usage**: Optiponal
  
- `--slow-down-speed`:
  - **Type**: `float`
  - **Description**: Slow down speed in km/h when reaching the flood depth slowing threshold
  - **Default**: 20
  - **Usage**: Optiponal

### Input Parameters

- `--json-path`:
  - **Type**: `str`
  - **Description**: Path to the JSON file containing the simulation parameters.
  - **Usage**: Required

#### Input json structure

The JSON structure is divided into three main sections:
1. `road_network`
2. `grid`
3. `scenario` (required)

The road network and the grid could also be left empty inside (with just an empty {} as a value) and the parameter used will be the default one for each road and cell.
It should be noted that it is necessary only to input what should differ from the default parameters, which can be found inside the container as a roads.geojson and grid.geojson file.

The `road_network` section contains details about various road segments identified by unique IDs. Each road segment has the following possible attributes:
- `closed` (boolean): Indicates whether the road segment is closed (optional).
- `underground` (boolean): Indicates whether the road segment is underground (optional).
- `speed` (integer): The speed limit for the road segment in km/h (optional).

Example:
```json
"road_network": {
    "53160": {
        "closed": true
    },
    "175049": {
        "closed": false,
        "underground": true
    },
    "75871": {
        "closed": false,
        "speed": 200,
        "underground": false
    }
}
```
 
The `grid` section contains details about different grid cells identified by unique IDs. Each grid cell has the following attributes:

`landuse` (object): Describes the land use distribution within the grid cell with possible values:
- `residential` (float): Proportion of residential land use.
- `commercial` (float): Proportion of commercial land use.
- `agricultural` (float): Proportion of agricultural land use.
- `industrial` (float): Proportion of industrial land use.
- `natural` (float): Proportion of natural land use, it is intended as untouched by active human activity.

`pois` (object): Describes the number of points of interest (POIs) within the grid cell for different categories:
- `food` (integer)
- `fun` (integer)
- `health` (integer)
- `infrastructure` (integer)
- `school` (integer)
- `services` (integer)
- `shop` (integer)
- `sport` (integer)
- `tourism` (integer)

`population` (object): Contains population information:
- `static` (integer): The total population estimated to be inside the grid cell.

Example:
```json
"grid": {
    "891f058aa73ffff": {
        "landuse": {
            "residential": 0.4,
            "commercial": 0.6,
            "agricultural": 0.0,
            "industrial": 0.0
        },
        "pois": {
            "food": 0,
            "fun": 0,
            "health": 0,
            "infrastructure": 0,
            "school": 0,
            "services": 0,
            "shop": 0,
            "sport": 0,
            "tourism": 0
        },
        "population": {
            "static": 1000
        }
    }
}
```

The `scenario` section describes the simulation scenario with the following attributes, it is the only section that is entirely `mandatory` to be filled:
- `bicycle percentage` (float): Proportion of bicycles in use.
- `evehicle percentage` (float): Proportion of electric vehicles in use.
- `day type` (array of strings): Types of days for the scenario (e.g., "weekend").
- `time slots` (array of integers): Time slots during the day (e.g., hours).

Example:
```json
"scenario": {
    "bicycle percentage": 0.1,
    "evehicle percentage": 0.1,
    "day type": ["weekend"],
    "time slots": [3]
}
```

### Output Parameters

- `--base-day`:
  - **Type**: `int`
  - **Description**: Unix time value representing the base date for the output (in UTC). It should be used for visualization purposes only.
  - **Default**: `1713736800`
  - **Usage**: Optional

- `--output-path`:
  - **Type**: `str`
  - **Description**: Directory where output files will be saved.
  - **Default**: `/home/`
  - **Usage**: Optional

- `--file-name`:
  - **Type**: `str`
  - **Description**: Prefix for the output files.
  - **Default**: `results_simulation`
  - **Usage**: Optional

### Simulation Parameters

- `--return-od`:
  - **Type**: `str`
  - **Description**: If set to 'true', it also saves in the output folder the origin-destination matrix used for the genaration of traffic flows.
  - **Default**: `true`
  - **Usage**: Optional

- `--fast-simulation`:
  - **Type**: `str`
  - **Description**: If set to 'true', it compresses the OD matrix by selecting the most frequent and likely trips according to the probability of the flow. This enables faster physical simulations by discarding unlikely flows. If accuracy is top-priority it should be set to false
  - **Default**: `true`
  - **Usage**: Optional

### Performance Parameters

- `--cpu-to-use`:
  - **Type**: `int`
  - **Description**: Specifies the number of CPU cores to use, reducing path computation time. This parameter is used only in certain steps of the program and not in GPU inference.
  - **Default**: `22`
  - **Usage**: Optional

## Usage Example

To run the simulation with custom parameters, use the following command to run the model executable:

```bash
../run_mobility_model --flood-depth-map /home/flood.tiff --flood-depth-closing 0.5 --flood-depth-slowing 0.3 --slow-down-speed 20 --json-path /path/to/params.json --base-day 1713736800 --output-path /desired/output/path --file-name custom_results --save-unified-output false --return-od false --fast-simulation false --cpu-to-use 16
```

## Default Configuration
If no parameters are specified, the program will use the following default values:

```bash
../run_mobility_model --json-path <required> --flood-depth-map /tmp/message --flood-depth-closing 0.5 --flood-depth-slowing None --base-day 1713736800 --output-path /home/ --file-name results_simulation --save-unified-output false --return-od true --fast-simulation true --cpu-to-use 22
```

## Notes
 - The container contains also the grid and the roads for both id and parameters' look up and visualization purposes.
 - Ensure that the number of CPUs specified in --cpu-to-use does not exceed the available CPUs on your system.
 - The --json-path parameter is mandatory and must be provided for the program to function correctly

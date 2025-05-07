# IMMERSEON XAI 

## Description
This project demonstrates the IMMERSEON blackbox XAI approach based on mobility-model input and output pairs. 

## Features
- Baseline implementation of the XAI blackbox approach. 
- Visualization of NO<sub>2</sub> the results in plots. 

## Installation

### Prerequisites
- Python 3.11+
- Poetry

### Setup
1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/immerseon-xai.git
    cd immerseon-xai
    ```

2. Activate the virtual environment:
    ```bash
    poetry env use python3.11 
    poetry shell
    ```

3. Install application and dependencies:
    ```bash
    poetry install
    ```


## Usage

### Running the Simulation
1. Run the mobility-model using all input JSON files in the `data` directory.
   Note: The mobility-model and its setup is not part of this repository. 
   ```bash
   /run_mobility_model --json-path ./data/input_full.json --output-path ./data
   ```

2. Unzip the results, place the GeoJSON files into the `data` directory and rename them according to the input JSON files
    with `results` as prefix instead of `input` 

3. Run the XAI blackbox approach script.
   ```bash
   calculate_no2_impact
   ```
   The resulting plots are stored in the `img` directory.

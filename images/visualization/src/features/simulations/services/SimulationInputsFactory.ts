import {SimulationInputs} from "../models/SimulationInputs";
import {SimulationParameters} from "../models/SimulationParameters";

export class SimulationInputsFactory {
    private static transformGridData(grid) {
        const result = {};

        Object.keys(grid).forEach(key => {
            const pois = {};
            const landuse = {};
            const population = {};

            Object.keys(grid[key]).forEach(innerKey => {
                if (innerKey.endsWith('_pois')) {
                    const newKey = innerKey.replace('_pois', '');
                    pois[newKey] = grid[key][innerKey];
                } else if (innerKey.endsWith('_landuse')) {
                    const newKey = innerKey.replace('_landuse', '');
                    landuse[newKey] = grid[key][innerKey];
                } else if (innerKey.endsWith('_population')) {
                    const newKey = innerKey.replace('_population', '');
                    population[newKey] = grid[key][innerKey];
                }
            });

            result[key] = {
                ...(Object.keys(pois).length > 0 && {pois}),
                ...(Object.keys(landuse).length > 0 && {landuse}),
                ...(Object.keys(population).length > 0 && {population})
            };
        });

        return result;
    }

    public static build(changes: any, simulationParameters: SimulationParameters, isProjectImmerseon: boolean, isShowExplanation: boolean): SimulationInputs {
        const changesToSave = changes.changes;
        const scenarioId = changes.scenarioId;
        const gridChanges = changesToSave.mobility_model_input.grid;
        const roadNetworkChanges = changesToSave.mobility_model_input.road_network;

        const transformedGridData = SimulationInputsFactory.transformGridData(gridChanges);
        return {
            scenarioId,
            mobility_model_input: {
                grid: transformedGridData,
                road_network: roadNetworkChanges,
                scenario: {
                    "bycicle percentage": Number(simulationParameters.bicyclePercentage),
                    "evehicle percentage": Number(simulationParameters.eVehiclePercentage),
                    "day type": simulationParameters.dayType,
                    "time slots": simulationParameters.timeSlot.map(Number),
                }
            },
            ...(isProjectImmerseon && {
                flood_model_input: {
                    "rain_intensity": Number(simulationParameters.rainfall),
                    "sea_discharge": Number(simulationParameters.seaLevelRise),
                    "river_discharge": Number(simulationParameters.riverDischarge)
                }
            }),
            ...(isShowExplanation && {
                xai_input: {
                    // "area_of_interest": [], // TODO default area is hardcoded for now
                    "attribute": simulationParameters.explanationAttribute,
                    "day_type": simulationParameters.explanationDayType,
                    "time_slot": Number(simulationParameters.explanationTimeSlot)
                }
            })
        };
    }
}

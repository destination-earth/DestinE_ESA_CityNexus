export interface SimulationInputs {
    scenarioId: string,
    mobility_model_input: {
        grid: any,
        road_network: any,
        scenario: {
            "bycicle percentage": number,
            "evehicle percentage": number,
            "day type": string[],
            "time slots": string[],
        }
    }
}

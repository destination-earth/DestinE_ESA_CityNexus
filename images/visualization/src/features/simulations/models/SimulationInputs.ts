export interface SimulationInputs {
    scenarioId: string,
    mobility_model_input: {
        project_name: string,
        grid: any,
        road_network: any,
        scenario: {
            "bycicle percentage": number,
            "evehicle percentage": number,
            "day type": string[],
            "time slots": string[]
        }
    },
    xai_input?: {
        "area_of_interest": number[],
        "attribute": string[],
        "day_type": string[],
        "time_slot": string[]
    }
}

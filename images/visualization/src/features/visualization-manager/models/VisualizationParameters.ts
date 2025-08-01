export class VisualizationParameters {
    public parameters: string[] = [];
    public datasets: string[] = [];
}

export const VisualizationParametersValidation = {
  "parameters": {
    validate: (value) => value.length > 0 || "Please select at least one parameter",
  },
  "datasets": {
    validate: (value) => value.length > 0 || "Please select at least one dataset",
  },
};

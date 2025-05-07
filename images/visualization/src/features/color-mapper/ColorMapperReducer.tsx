import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {ascending, index, quantileSorted, thresholdScott} from 'd3-array';

export const scaleTypes = [
  'quantize',
  'log',
  'pow',
  'sqrt',
  'quantile',
  'natural breaks',
] as const;

export type ScaleType = typeof scaleTypes[number];

interface Feature {
  properties: Record<string, number | null>;
}

interface ColorMapperState {
  features: number[];
  parameter: string;
  scaleType: ScaleType;
  colorRange: string[],
  ranges: Record<string, { color: string; legend: string }>;
  minValue: number;
  maxValue: number;
}

const initialState: ColorMapperState = {
  features: [],
  parameter: 'no2',
  scaleType: 'quantize',
  colorRange: [
      "#a6d96a",
      "#a6c162",
      "#a6a95b",
      "#a69153",
      "#a6794c",
      "#a56044",
      "#a5483d",
      "#a53035",
      "#a5182e"
  ],
  ranges: {},
  minValue: 0,
  maxValue: 0
};

const initialLayerState: Record<string, ColorMapperState> = {}; // Starts empty, gets filled with each layer

const colorMapperSlice = createSlice({
  name: 'colorMapper',
  initialState: initialLayerState,
  reducers: {
    setColorMapperFeatures(state, action: PayloadAction<{ layerId: string; features: Feature[]; field: string }>) {
      if (!state[action.payload.layerId]) {
        state[action.payload.layerId] = {
          ...initialState
        };
      }
      state[action.payload.layerId].features = action.payload.features
        .map(d => d.properties[action.payload.field])
        .filter(d => d !== null && !isNaN(d as number))
        .sort(ascending);

      state[action.payload.layerId].minValue = quantileSorted(state[action.payload.layerId].features as number[], 0.05);
      state[action.payload.layerId].maxValue = quantileSorted(state[action.payload.layerId].features as number[], 0.95);
    },
    setColorMapperParameter(state, action: PayloadAction<{ layerId: string; parameter: string }>) {
      state[action.payload.layerId].parameter = action.payload.parameter;
    },
    setColorMapperRange(state, action: PayloadAction<{ layerId: string; colorRange: string[] }>) {
      state[action.payload.layerId].colorRange = action.payload.colorRange;
    },
    setColorMapperScaleType(state, action: PayloadAction<{ layerId: string; scaleType: ScaleType }>) {
      state[action.payload.layerId].scaleType = action.payload.scaleType;
    },
    calculateColorMapping(state, action: PayloadAction<string>) {
      const layerId = action.payload;
      const n_steps = state[layerId].colorRange.length;
      let thresholds: number[] = [];

      // quantile: divides the data into bins containing an equal number of data points
      // quantize: divides the input data range into equally sized bins
      switch (state[layerId].scaleType) {
        case 'log':
          const logMin = 1;
          const logMax = Math.log10(state[layerId].maxValue);
          const logStep = (logMax - logMin) / (n_steps - 1);
          for (let i = 0; i < n_steps; i++) {
            thresholds.push(Math.pow(10, logMin + logStep * i));
          }
          break;
        case 'pow':
          const powMin = Math.pow(state[layerId].minValue, 1 / 2);
          const powMax = Math.pow(state[layerId].maxValue, 1 / 2);
          const powStep = (powMax - powMin) / (n_steps - 1);
          for (let i = 0; i < n_steps; i++) {
            thresholds.push(Math.pow(powMin + powStep * i, 2));
          }
          break;
        case 'sqrt':
          const sqrtMin = Math.sqrt(state[layerId].minValue);
          const sqrtMax = Math.sqrt(state[layerId].maxValue);
          const sqrtStep = (sqrtMax - sqrtMin) / (n_steps - 1);
          for (let i = 0; i < n_steps; i++) {
            thresholds.push(Math.pow(sqrtMin + sqrtStep * i, 2));
          }
          break;
        case 'quantile':
          for (let i = 0; i < n_steps; i++) {
            const idx = Math.floor((i * state[layerId].features.length) / n_steps);
            thresholds.push(state[layerId].features[idx]);
          }
          break;
        case 'natural breaks':
          const thresholdsCount = thresholdScott(state[layerId].features, state[layerId].minValue, state[layerId].maxValue);
          const binSize = (state[layerId].maxValue - state[layerId].minValue) / thresholdsCount;
          for (let i = 1; i < thresholdsCount; i++) {
            thresholds.push(state[layerId].minValue + binSize * i);
          }
          break;
        case 'quantize':
        default:
          const linearStep = (state[layerId].maxValue - state[layerId].minValue) / (n_steps - 1);
          for (let i = 0; i < n_steps; i++) {
            thresholds.push(state[layerId].minValue + linearStep * i);
          }
          break;
      }

      const ranges: Record<string, { color: string; legend: string }> = {};
      thresholds.forEach((value, index) => {
        const hexColor = state[layerId].colorRange[index];
        ranges[value.toFixed(2)] = {
          color: hexColor,
          legend: `<= ${value.toFixed(2)}`,
        };
      });

      state[layerId].ranges = ranges;
    },
  },
});

export const { setColorMapperFeatures, setColorMapperParameter, setColorMapperRange, setColorMapperScaleType, calculateColorMapping } = colorMapperSlice.actions;

export default colorMapperSlice.reducer;

// Helper functions
export const getColorMap = (state: ColorMapperState): [number, string][] => {
  const ranges = state.ranges;
  const keys = Object.keys(ranges);

  const mapper = (val: number) => {
    const matchingKey = keys.find(key => Number(key) >= val);
    return ranges[matchingKey]?.color || state.colorRange[state.colorRange.length - 1]; // Default to maxColor if no match
  };

  return state.features.map(val => [val, mapper(val)]);
};

export const getColorLegends = (state: ColorMapperState): Record<string, string> => {
  const legends: Record<string, string> = {};
  Object.entries(state.ranges).forEach(([, value]) => {
    legends[value.color] = value.legend;
  });
  return legends;
};

export const getColors = (state: ColorMapperState): string[] => {
  return Object.values(state.ranges).map(range => range.color);
};

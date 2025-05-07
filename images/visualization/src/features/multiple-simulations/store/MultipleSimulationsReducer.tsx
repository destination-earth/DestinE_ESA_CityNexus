import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import GeoJsonLayer from "@kepler.gl/layers/dist/geojson-layer/geojson-layer";

interface MultipleSimulationsState {
  originalLayers: Record<string, any>;
}

const initialState: MultipleSimulationsState = {
  originalLayers: {},
};

const multipleSimulationsSlice = createSlice({
  name: 'multipleSimulations',
  initialState: initialState,
  reducers: {
      setOriginalLayer(state, action: PayloadAction<{ datasetId: string; originalLayer: GeoJsonLayer }>) {
          state.originalLayers[action.payload.datasetId] = action.payload.originalLayer;
      },
  }
});

export const { setOriginalLayer } = multipleSimulationsSlice.actions;

export default multipleSimulationsSlice.reducer;

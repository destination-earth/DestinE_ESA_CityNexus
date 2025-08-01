import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../../store";
import {layerVisConfigChange} from "@kepler.gl/actions";
import {setHasChangedMap} from "../../user/userSlice";
import GeoJsonLayer from "@kepler.gl/layers/dist/geojson-layer/geojson-layer"
import {useSelector} from "react-redux";

interface ApplyChangesPayload {
  isMultiSelect: boolean;
  value: string | boolean | number;
  data: any[]; // Define a more specific type if you know the structure of `data`
  parameterIdx: number;
  name: string;
  layerName: string;
}

export const applyChanges = createAsyncThunk(
  'undoRedo/applyChanges',
  async (payload: ApplyChangesPayload, {getState, dispatch}) => {
    const state = getState() as RootState;

    payload.selectedIndexes = state.demo.undoRedo.selectedIndexes;
    dispatch(undoRedoSlice.actions.applyChanges(payload));
    dispatch(setHasChangedMap(true));

    const layerName = payload.layerName;
    const layer = state.demo.keplerGl.map.visState.layers.find((obj) => obj.id === layerName);
    if (layer) {
      dispatch(layerVisConfigChange(layer, {
        strokeColorRange: {
          ...layer.config.visConfig.strokeColorRange
        }
      }));
    }
  }
);

export const triggerMapReload = () => (dispatch, getState) => {
    const state = getState() as RootState;

    if (state.demo.undoRedo.currentId >= 0) {
        dispatch(setHasChangedMap(true));
    } else {
        dispatch(setHasChangedMap(false));
    }

    state.demo.keplerGl.map.visState.layers.forEach((layer: GeoJsonLayer) => {
        dispatch(layerVisConfigChange(layer, {
          strokeColorRange: {
            ...layer.config.visConfig.strokeColorRange
          }
        }));
    });
}

export const replaceData = (dispatch, change, datasets, changeType, original, layerNames) => {
  for (const layerName of layerNames) {
    const dataset = datasets[layerName];
    const parameterIndices = dataset.fields.reduce((acc, obj) => {
      acc[obj.name] = obj.fieldIdx;
      return acc;
    }, {});
    const changedParameterIdx = parameterIndices['changed'];

    for (const id in change[layerName]) {
      const history = change[layerName][id];
      const currentData = dataset.dataContainer.find((row) => row.valueAt(1) == id);

      // replace the current value with the new one
      for (const parameterIdx in history) {
        const value = history[parameterIdx][changeType];
        currentData.values()[parameterIdx] = value;
        // also replace the value in the changes list so both lists stay synced
        dispatch(updateChangesFromUndoRedo({
          layerName: layerName,
          id: id,
          name: dataset.fields[parameterIdx].name,
          value: value
        }));
      }

      // check if the changed parameter should be set (at least one parameter different from original)
      let changed = false;
      for (const originalParameter in original.mobility_model_input[layerName][id]) {
        if (original.mobility_model_input[layerName][id][originalParameter] !== currentData.values()[parameterIndices[originalParameter]]) {
          changed = true;
          break;
        }
      }

      currentData.values()[changedParameterIdx] = changed;
    }
  }
};

export const undo = () => (dispatch, getState) => {
  const state = getState() as RootState;
  const { currentId, history, canUndo, changes } = state.demo.undoRedo;
  const datasets = state.demo.keplerGl.map.visState.datasets;

  if (!canUndo) return;

  // For each change in the history, replace the value in the datasets with the corresponding old value in the history
  const currentChanges = history[currentId];
  replaceData(dispatch, currentChanges, datasets, 'old', changes.original, ['road_network', 'grid']);
  dispatch(setCurrentId(currentId - 1));
  dispatch(triggerMapReload());
};

export const redo = () => (dispatch, getState) => {
  const state = getState() as RootState;
  const { currentId, history, canRedo, changes } = state.demo.undoRedo;
  const datasets = state.demo.keplerGl.map.visState.datasets;

  if (!canRedo) return;

  // For each change in the history, replace the value in the datasets with the corresponding new value in the history
  const nextChanges = history[currentId + 1];
  replaceData(dispatch, nextChanges, datasets, 'new', changes.original, ['road_network', 'grid']);
  dispatch(setCurrentId(currentId + 1));
  dispatch(triggerMapReload());
};

export const setChanges = (payload: ScenarioChanges) => (dispatch, getState) => {
  const state = getState() as RootState;
  const layerChangedIdx = {
      "grid": state.demo.keplerGl.map.visState.datasets['grid']?.fields.findIndex(field => field.name === 'changed'),
      "road_network": state.demo.keplerGl.map.visState.datasets['road_network']?.fields.findIndex(field => field.name === 'changed'),
  }

  const layerSelectedIdx = {
      "grid": state.demo.keplerGl.map.visState.datasets['grid']?.fields.findIndex(field => field.name === 'selected'),
      "road_network": state.demo.keplerGl.map.visState.datasets['road_network']?.fields.findIndex(field => field.name === 'selected'),
  }

  dispatch(undoRedoSlice.actions.setLayerChangedIdx(layerChangedIdx));
  dispatch(undoRedoSlice.actions.setLayerSelectedIdx(layerSelectedIdx));
  dispatch(undoRedoSlice.actions.setChanges(payload));
  dispatch(undoRedoSlice.actions.resetHistory())
};

function setAndStoreParameter(changes, history, layerName, dataEntry, parameterIdx, value, name, layerChangedIdx) {
    const changedParameterIdx = layerChangedIdx[layerName];
    const entryId = dataEntry.values()[1]
    const present = changes.changes.mobility_model_input[layerName]
    const original = changes.original.mobility_model_input[layerName]

    present[entryId] ??= {}; // create if not exists
    original[entryId] ??= {};

    let old_value, new_value;

    if (!present[entryId][name]) {
        const originalValue = dataEntry.values()[parameterIdx];
        new_value = value;
        old_value = originalValue;
        present[entryId][name] = value;
        original[entryId][name] = originalValue;
        dataEntry.values()[changedParameterIdx] = true;
    } else {
        new_value = value;
        old_value = present[entryId][name];
        // if the changed value is identical to the original value, remove the entry from the list of changes
        if (value !== original[entryId][name]) {
            present[entryId][name] = value;
            dataEntry.values()[changedParameterIdx] = true;
        } else {
            delete original[entryId][name];
            delete present[entryId][name];

            if (!Object.keys(original[entryId]).length && !Object.keys(present[entryId]).length) {
                delete original[entryId];
                delete present[entryId];
                dataEntry.values()[changedParameterIdx] = false;
            }
        }
    }

    dataEntry.values()[parameterIdx] = value;

    // return a log of the change for the history
    history[layerName] ||= {};
    history[layerName][entryId] ||= {};
    history[layerName][entryId][parameterIdx] = {
        old: old_value,
        new: new_value
    }
}

interface ScenarioChanges {
  scenarioId: string;
  scenarioName: string;
  scenarioChanges?: any; // Define a more specific type if possible
}

type UndoRedoState = {
  changes: { [key: string]: any };
  history: {};
  currentId: number;
  maxId: number;
  canUndo: boolean;
  canRedo: boolean;
  layerChangedIdx: {
    road_network: number;
    grid: number;
  };
  layerSelectedIdx: {
    road_network: number;
    grid: number;
  };
  selectedRoadTypes: string[];
  selectedIndexes: Set<number>;
  isGridToggled: boolean;
};

const initialState: UndoRedoState = {
  changes: {
    scenarioId: undefined,
    scenarioName: undefined,
    original: {
      mobility_model_input: {
        road_network: {},
        grid: {}
      }
    },
    changes: {
      mobility_model_input: {
        road_network: {},
        grid: {}
      }
    }
  },
  history: {},
  currentId: -1,
  maxId: -1,
  canUndo: false,
  canRedo: false,
  layerChangedIdx: {
    road_network: -1,
    grid: -1
  },
  layerSelectedIdx: {
    road_network: -1,
    grid: -1
  },
  selectedRoadTypes: [],
  selectedIndexes: new Set<number>(),
  isGridToggled: false
};

const undoRedoSlice = createSlice({
  name: "undoRedo",
  initialState,
  reducers: {
    setScenarioId: (state, action: PayloadAction<string>) => {
      state.changes.scenarioId = action.payload;
    },
    setChanges: (
        state,
        action: PayloadAction<ScenarioChanges>
    ) => {
      const { scenarioId, scenarioName, scenarioChanges } = action.payload;
      if (state.changes == undefined
          || state.changes.scenarioId !== scenarioId) {
        if (scenarioChanges === undefined) {
          state.changes = {
            scenarioId: scenarioId,
            scenarioName: scenarioName,
            original: {
              mobility_model_input: {
                road_network: {},
                grid: {}
              }
            },
            changes: {
              mobility_model_input: {
                road_network: {},
                grid: {}
              }
            },
            history: {}
          }
        } else {
          state.changes = {
            changes: {},
            original: {},
            history: {},
            ...scenarioChanges, // overwrite with what was loaded
            scenarioId: scenarioId,
            scenarioName: scenarioName
          }
        }
      }
    },
    applyChanges: (
      state,
      action: PayloadAction<{ isMultiSelect: boolean, value: string | boolean | number, data: any[], parameterIdx: number, name: string, layerName: string, selectedIndexes?: Set<number> }>
    ) => {
      const {
        isMultiSelect,
        value,
        data,
        parameterIdx,
        name,
        layerName,
        selectedIndexes
      } = action.payload;
      const newId = state.currentId + 1;

      // if they exist, remove all keys greater or equal to the current id
      Object.keys(state.history)
        .filter(key => Number(key) >= newId)
        .forEach(key => {
          delete state.history[key];
      });

      state.history[newId] = {}
      if (isMultiSelect) {
          if (layerName === 'grid') {
              data.forEach((dataEntry, i) => {
                  if (selectedIndexes.has(dataEntry._rowIndex)) {
                      setAndStoreParameter(state.changes, state.history[newId], layerName,
                          dataEntry, parameterIdx, value, name, state.layerChangedIdx);
                  }
              });
          } else if (layerName === 'road_network') {
              // for roads, we need to check if the selected road types match
              data.forEach((dataEntry, i) => {
                  if (dataEntry.values()[state.layerSelectedIdx[layerName]]) {
                      setAndStoreParameter(state.changes, state.history[newId], layerName,
                          dataEntry, parameterIdx, value, name, state.layerChangedIdx);
                  }
              });
          }
      } else {
          setAndStoreParameter(state.changes, state.history[newId], layerName,
              data, parameterIdx, value, name, state.layerChangedIdx);
      }

      state.maxId = newId;
      state.currentId = newId;
      state.canUndo = state.currentId >= 0;
      state.canRedo = state.currentId < state.maxId;
    },
    updateChangesFromUndoRedo: (state, action: PayloadAction<{layerName: string, id: string, name: string, value: any}>) => {
      const { layerName, id, name, value } = action.payload;
      state.changes.changes.mobility_model_input[layerName][id][name] = value;
    },
    resetHistory: (state) => {
      state.history = {};
      state.maxId = -1;
      state.currentId = -1;
      state.canUndo = state.currentId >= 0;
      state.canRedo = state.currentId < state.maxId;
    },
    setCurrentId: (state, action: PayloadAction<number>) => {
      state.currentId = action.payload;
      state.canUndo = state.currentId >= 0;
      state.canRedo = state.currentId < state.maxId;
    },
    setLayerChangedIdx(state, action: PayloadAction<{ grid: number; road_network: number }>) {
      state.layerChangedIdx = action.payload
    },
    setLayerSelectedIdx(state, action: PayloadAction<{ grid: number; road_network: number }>) {
      state.layerSelectedIdx = action.payload
    },
    setSelectedRoadTypes(state, action: PayloadAction<string[]>) {
        state.selectedRoadTypes = action.payload
    },
    setIsGridToggled(state, action: PayloadAction<boolean>) {
        state.isGridToggled = action.payload
    },
    setSelectedIndexes(state, action: PayloadAction<number[]>) {
        state.selectedIndexes = new Set(action.payload)
    }
  },
});

export const { setScenarioId, setCurrentId, resetHistory, setSelectedRoadTypes, setIsGridToggled, setSelectedIndexes, updateChangesFromUndoRedo } = undoRedoSlice.actions;
export default undoRedoSlice.reducer;

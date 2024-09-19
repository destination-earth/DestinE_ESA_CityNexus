import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../../store";
import {layerVisConfigChange} from "@kepler.gl/actions";
import {setHasChangedMap} from "../../../components/user/userSlice";
import GeoJsonLayer from "kepler.gl/src/layers/dist/geojson-layer/geojson-layer";

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
    // Dispatch the applyChanges reducer
    dispatch(undoRedoSlice.actions.applyChanges(payload));

    // Run the additional code after applying changes
    dispatch(setHasChangedMap(true));

    const state = getState() as RootState;
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

    if (state.undoRedo.currentId >= 0) {
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

function replaceData(change, dataset, changeType, original) {
  const parameterIndices = dataset.fields.reduce((acc, obj) => {
      acc[obj.name] = obj.fieldIdx;
      return acc;
      }, {}
  );
  const indicesParameters = dataset.fields.reduce((acc, obj) => {
      acc[obj.fieldIdx] = obj.name;
      return acc;
      }, {}
  );
  const changedParameterIdx = parameterIndices['changed'];

  for (const id in change) {
    const history = change[id];
    const currentData = dataset.dataContainer.find((row) => row.valueAt(1) == id);

    // replace the current value with the new one
    for (const parameterIdx in history) {
      const value = history[parameterIdx][changeType];
      currentData.values()[parameterIdx] = value;
    }

    // check if the changed parameter should be set (at least one parameter different from original)
    let changed = false;
    for (const originalParameter in original[id]) {
        if (original[id][originalParameter] !== currentData.values()[parameterIndices[originalParameter]]) {
            changed = true;
            break;
        }
    }

    currentData.values()[changedParameterIdx] = changed;
  }
}

export const undo = () => (dispatch, getState) => {
  const state = getState() as RootState;
  const { currentId, history, canUndo, changes } = state.undoRedo;
  const datasets = state.demo.keplerGl.map.visState.datasets;

  if (!canUndo) return;

  // For each change in the history, replace the value in the datasets with the corresponding old value in the history
  const currentChanges = history[currentId];
  replaceData(currentChanges.road_network, datasets['road_network'], 'old', changes.original.mobility_model_input['road_network']);
  replaceData(currentChanges.grid, datasets['grid'], 'old', changes.original.mobility_model_input['grid']);
  dispatch(setCurrentId(currentId - 1));
  dispatch(triggerMapReload());
};

export const redo = () => (dispatch, getState) => {
  const state = getState() as RootState;
  const { currentId, history, canRedo, changes } = state.undoRedo;
  const datasets = state.demo.keplerGl.map.visState.datasets;

  if (!canRedo) return;

  // For each change in the history, replace the value in the datasets with the corresponding new value in the history
  const nextChanges = history[currentId + 1];
  replaceData(nextChanges.road_network, datasets['road_network'], 'new', changes.original.mobility_model_input['road_network']);
  replaceData(nextChanges.grid, datasets['grid'], 'new', changes.original.mobility_model_input['grid']);
  dispatch(setCurrentId(currentId + 1));
  dispatch(triggerMapReload());
};

export const setChanges = (payload: ScenarioChanges) => (dispatch) => {
  dispatch(undoRedoSlice.actions.setChanges(payload));
};

function setAndStoreParameter(changes, history, layerName, dataEntry, parameterIdx, value, name) {
    const changedParameterIdx = dataEntry.values().length - 1;
    const entryId = dataEntry.values()[1]
    const present = changes.changes.mobility_model_input[layerName]
    const original = changes.original.mobility_model_input[layerName]

    present[entryId] ||= {}; // create if not exists
    original[entryId] ||= {};

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
        if (value != original[entryId][name]) {
            present[entryId][name] = value;
            dataEntry.values()[changedParameterIdx] = true;
        } else {
            delete original[entryId][name];
            delete present[entryId][name];
            dataEntry.values()[changedParameterIdx] = false;
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
  canRedo: false
};

const undoRedoSlice = createSlice({
  name: "undoRedo",
  initialState,
  reducers: {
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
      action: PayloadAction<{ isMultiSelect: boolean, value: string | boolean | number, data: any[], parameterIdx: number, name: string, layerName: string }>
    ) => {
      const {
        isMultiSelect,
        value,
        data,
        parameterIdx,
        name,
        layerName
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
          data.forEach((dataEntry) => {
              setAndStoreParameter(state.changes, state.history[newId], layerName, dataEntry, parameterIdx, value, name);
          });
      } else {
          setAndStoreParameter(state.changes, state.history[newId], layerName, data, parameterIdx, value, name);
      }

      state.maxId = newId;
      state.currentId = newId;
      state.canUndo = state.currentId >= 0;
      state.canRedo = state.currentId < state.maxId;
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
    }
  },
});

export const { setCurrentId, resetHistory } = undoRedoSlice.actions;
export default undoRedoSlice.reducer;

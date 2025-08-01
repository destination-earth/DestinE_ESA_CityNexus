// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import {combineReducers} from 'redux';
import {handleActions} from 'redux-actions';

import keplerGlReducer, {
  combinedUpdaters,
  layerVisConfigChangeUpdater,
  layerVisualChannelChangeUpdater,
  removeDatasetUpdater,
  setPolygonFilterLayerUpdater, setSelectedFeatureUpdater, toggleSplitMapUpdater,
  uiStateUpdaters
} from '@kepler.gl/reducers';
import {processGeojson} from '@kepler.gl/processors';
import KeplerGlSchema, {VisState} from '@kepler.gl/schemas';
import {EXPORT_MAP_FORMATS, FILTER_VIEW_TYPES} from '@kepler.gl/constants';

import {
  INIT,
  LOAD_MAP_SAMPLE_FILE,
  LOAD_PREDICTION_SAMPLE_FILE,
  LOAD_REMOTE_RESOURCE_SUCCESS,
  LOAD_REMOTE_RESOURCE_ERROR,
  SET_SAMPLE_LOADING_STATUS,
  REMOVE_ALL_DATASETS,
  HIGHLIGHT_SELECTED_FEATURE, highlightSelectedFeature, SET_PREDICTION_LOADING_STATUS
} from '../actions';

import {CLOUD_PROVIDERS_CONFIGURATION} from '../constants/default-settings';
import {generateHashId} from '../utils/strings';
import {default as ActionTypes} from "@kepler.gl/actions/dist/action-types";
import {
  layerVisConfigChange,
  layerVisualChannelConfigChange,
  removeDataset,
  setPolygonFilterLayer, setSelectedFeature, toggleSplitMap, VisStateActions
} from "@kepler.gl/actions";
import {Layer} from "@kepler.gl/layers";
import undoRedoReducer from "../features/undo-redo/store/UndoRedoReducer";
import {updateAllLayerDomainData} from "@kepler.gl/reducers/dist/vis-state-updaters";
import {
  applyFilterFieldName, applyFiltersToDatasets,
  FILTER_UPDATER_PROPS,
  LIMITED_FILTER_EFFECT_PROPS,
  set,
  toArray,
  updateFilterDataId
} from "@kepler.gl/utils";
import {assignGpuChannel, setFilterGpuMode} from "@kepler.gl/table";
import xor from "lodash.xor";
import uniq from "lodash.uniq";
import get from "lodash.get";
import * as Console from "node:console";
import {isSplitSelector} from "../kepler-overrides/components/map-container";

export type AppState = {
  appName: String;
  loaded: Boolean;
  predictionMaps: any[];
  sampleMaps: any[];
  isMapLoading: Boolean;
  isPredictionLoading: Boolean;
  error: any;
};

// INITIAL_APP_STATE
const initialAppState: AppState = {
  appName: 'example',
  loaded: false,
  predictionMaps: [],
  sampleMaps: [], // this is used to store sample maps fetch from a remote json file
  isMapLoading: false, // determine whether we are loading a sample map,
  isPredictionLoading: false, // determine whether we are loading a prediction map
  error: null // contains error when loading/retrieving data/configuration
};

// App reducer
export const appReducer = handleActions(
  {
    [INIT]: state => ({
      ...state,
      loaded: true
    }),
    [LOAD_MAP_SAMPLE_FILE]: (state, action) => ({
      ...state,
      sampleMaps: action.samples
    }),
    [LOAD_PREDICTION_SAMPLE_FILE]: (state, action) => ({
      ...state,
      predictionMaps: action.samples
    }),
    [SET_SAMPLE_LOADING_STATUS]: (state, action) => ({
      ...state,
      isMapLoading: action.isMapLoading
    }),
    [SET_PREDICTION_LOADING_STATUS]: (state, action) => ({
      ...state,
      isPredictionLoading: action.isPredictionLoading
    })
  },
  initialAppState
);

const {DEFAULT_EXPORT_MAP} = uiStateUpdaters;

// combine app reducer and keplerGl reducer
// to mimic the reducer state of kepler.gl website
const demoReducer = combineReducers({
  // mount keplerGl reducer
  keplerGl: keplerGlReducer.initialState({
    // In order to provide single file export functionality
    // we are going to set the mapbox access token to be used
    // in the exported file
    uiState: {
      exportMap: {
        ...DEFAULT_EXPORT_MAP,
        [EXPORT_MAP_FORMATS.HTML]: {
          ...DEFAULT_EXPORT_MAP[[EXPORT_MAP_FORMATS.HTML]],
          exportMapboxAccessToken: CLOUD_PROVIDERS_CONFIGURATION.EXPORT_MAPBOX_TOKEN
        }
      }
    },
    visState: {
      loaders: [], // Add additional loaders.gl loaders here
      loadOptions: {} // Add additional loaders.gl loader options here
    },
    mapState: {
      // replace the default location with Copenhagen
      ...keplerGlReducer.initialState.mapState,
      latitude: 55.68361088952501,
      longitude: 12.567379,
    }
  }),
  app: appReducer,
  undoRedo: undoRedoReducer
});

// this can be moved into a action and call kepler.gl action
/**
 *
 * @param state
 * @param action {map: resultset, config, map}
 * @returns {{app: {isMapLoading: boolean}, keplerGl: {map: (state|*)}}}
 */
export const loadRemoteResourceSuccess = (state, action) => {
  const datasetId = action.options.id || generateHashId(6);
  const datasetLabel = action.options.label || 'new dataset';

  const datasets = {
    info: {
      id: datasetId,
      label: datasetLabel
    },
    data: processGeojson(action.response)
  };

  // rename osm_id to id in road network
  datasets.data.fields.map(field => {
    if (field.id === 'osm_id') {
      field.displayName = 'id';
    }
    if (field.id.endsWith('landuse')) {
      field.type = 'real';
      field.analyzerType = 'FLOAT';
    }
  })

  const config = action.config ? KeplerGlSchema.parseSavedConfig(action.config) : null;

  const keplerGlInstance = combinedUpdaters.addDataToMapUpdater(
    state.keplerGl.map, // "map" is the id of your kepler.gl instance
    {
      payload: {
        datasets,
        config,
        options: {
          centerMap: Boolean(!action.config),
          keepExistingConfig: action.keepExistingConfig
        }
      }
    }
  );

  keplerGlInstance.visState.datasets[datasetId].metadata = action.options;

  return {
    ...state,
    app: {
      ...state.app,
      currentSample: action.options,
      isMapLoading: false // we turn off the spinner
    },
    keplerGl: {
      ...state.keplerGl, // in case you keep multiple instances
      map: keplerGlInstance
    }
  };
};

export const removeAllDatasets = (state, action) => {
  // clear the potentially selectedFeature to start with a clean slate
  const setSelectedFeatureAction = setSelectedFeature(null);
  state.keplerGl.map.visState = setSelectedFeatureUpdater(state.keplerGl.map.visState, setSelectedFeatureAction);

  // close the split maps if needed
  if (state.keplerGl.map.visState.splitMaps.length > 0) {
      const toggleSplitMapAction = toggleSplitMap(0);
      state.keplerGl.map.visState = toggleSplitMapUpdater(state.keplerGl.map.visState, toggleSplitMapAction);
  }

  const isPredictionLoaded = state.keplerGl.map.visState?.layers[0]?.id.includes("prediction") === true;
  // remove layers except when prediction -> prediction AND newCity == oldCity
  if (!(action.newDatasetType === "simulation" && isPredictionLoaded
      && action.newCityName === state.app?.currentSample?.city)) {
    Object.keys(state.keplerGl.map.visState.datasets).forEach((datasetId: string) => {
       const action = removeDataset(datasetId);
       state.keplerGl.map.visState = removeDatasetUpdater(state.keplerGl.map.visState, action);
    });
  }

  return state;
}

export const loadRemoteResourceError = (state, action) => {
  const {error, url} = action;

  const errorNote = {
    type: 'error',
    message: error.message || `Error loading ${url}`
  };

  return {
    ...state,
    app: {
      ...state.app,
      isMapLoading: false // we turn of the spinner
    },
    keplerGl: {
      ...state.keplerGl, // in case you keep multiple instances
      map: {
        ...state.keplerGl.map,
        uiState: uiStateUpdaters.addNotificationUpdater(state.keplerGl.map.uiState, {
          payload: errorNote
        })
      }
    }
  };
};

function unHighlightFeatures(visState) {
    for (let datasetId in visState.datasets) {
      const dataset = visState.datasets[datasetId];
      const indexOfSelectedParameter = dataset.fields.findIndex(field => field.id === "selected");
      visState.datasets[datasetId].dataContainer.map((dataRow) => {
        let row = dataRow.values();
        row[indexOfSelectedParameter] = false;
        return row;
      });
    }
    return visState;
}

export const highlightSelectedFeatureUpdater = (state, action) => {
  const selectedLayer: Layer = action.selectedLayer;
  const selectedRoadTypes = state.undoRedo.selectedRoadTypes;

  const dataId = selectedLayer.config.dataId;
  const filteredIdx: Set<number> = state.undoRedo.selectedIndexes;

  // start by configuring the layers as we want: hide other layers, show all indices in selected layer
  for (let datasetId in state.keplerGl.map.visState.datasets) {
      if (datasetId !== dataId) {
        state.keplerGl.map.visState.datasets[datasetId].filteredIndex = [];
      } else {
        // TODO disabling this removes the other layer from the map and the non selected items from the selected layer
        // it also fixes the inconsistencies with the de/selection of a road type with no matching roads
        // for now let's leave it like this, at least it works
        // state.keplerGl.map.visState.datasets[datasetId].filteredIndex =
        //     state.keplerGl.map.visState.datasets[datasetId].allIndexes;
      }
  }

  // configure the highlighting
  for (let datasetId in state.keplerGl.map.visState.datasets) {
    const dataset = state.keplerGl.map.visState.datasets[datasetId];
    const indexOfSelectedParameter = dataset.fields.findIndex(field => field.id === "selected");
    const indexOfRoadTypeParameter = dataset.fields.findIndex(field => field.id === "type");

    // deselect all previously selected entries from other layers
    if (datasetId !== dataId) {
      state.keplerGl.map.visState.datasets[datasetId].dataContainer.map((dataRow) => {
        let row = dataRow.values();
        row[indexOfSelectedParameter] = false;
        return row;
      });
    // select newly selected entries and deselect other entries from current layer
    } else {
      // for the road network specifically, take into account the selected road types
      if (datasetId === 'road_network') {
        const isAnyRoadSelected = state.keplerGl.map.visState.datasets["road_network"].dataContainer
            .find((row, idx) => filteredIdx.has(idx) && selectedRoadTypes.includes(row.valueAt(indexOfRoadTypeParameter))) !== undefined;

        if (!isAnyRoadSelected && selectedRoadTypes.length > 1) {
          return state;
        }

        state.keplerGl.map.visState.datasets[datasetId].dataContainer.map((dataRow, idx) => {
          let row = dataRow.values();
          let value = false;
          // for all roads in the filtered area
          if (filteredIdx.has(idx)) {
            // if there are no selected road types, highlight everything
            if (selectedRoadTypes && selectedRoadTypes.length === 0) {
              value = true;
            // if there are selected road types, highlight only the ones that are selected
            } else if (selectedRoadTypes && selectedRoadTypes.length > 0 && selectedRoadTypes.includes(row[indexOfRoadTypeParameter])) {
              value = true;
            }
          }
          row[indexOfSelectedParameter] = value;
          return row;
        });
      } else {
        state.keplerGl.map.visState.datasets[datasetId].dataContainer.map((dataRow, idx) => {
          let row = dataRow.values();
          row[indexOfSelectedParameter] = filteredIdx.has(idx);
          return row;
        });
      }
    }

    // apply the highlighting by triggering a layer update
    const layer = state.keplerGl.map.visState.layers.find((layer) => layer.config.dataId === datasetId);
    const visualChannelAction = layerVisualChannelConfigChange(layer, {
      ["sizeField"]: state.keplerGl.map.visState.datasets[layer.id].fields[indexOfSelectedParameter]
    }, "size");
    state.keplerGl.map.visState = layerVisualChannelChangeUpdater(state.keplerGl.map.visState, visualChannelAction);
  }

  return state;
}

export function customDeleteFeature(state, action) {
  const selectedLayerIdx = state.keplerGl.map.visState.layers.findIndex((l) => l.id === state.keplerGl.map.visState.filters[0].dataId[0]);
  const selectedLayer = state.keplerGl.map.visState.layers[selectedLayerIdx];

  for (let datasetId in state.keplerGl.map.visState.datasets) {
      state.keplerGl.map.visState.datasets[datasetId].filteredIndex =
          state.keplerGl.map.visState.datasets[datasetId].allIndexes;
  }
  state.keplerGl.map.visState = updateAllLayerDomainData(state.keplerGl.map.visState, ['grid', 'road_network'], state.keplerGl.map.visState.filters[0]);

  if (selectedLayer) {
    state.keplerGl.map.visState = unHighlightFeatures(state.keplerGl.map.visState);
  }

  const nbFeaturesBefore = state.keplerGl.map.visState.editor.features.length;
  let newState = demoReducer(state, action);
  const nbFeaturesAfter = newState.keplerGl.map.visState.editor.features.length;

  if (nbFeaturesBefore >= 1 && nbFeaturesAfter == 0) {
    const layer = newState.keplerGl.map.visState.layers[0]
    const setPolygonFilterLayerAction = setPolygonFilterLayer(layer, newState.keplerGl.map.visState.editor.features[0])
    newState.keplerGl.map.visState = setPolygonFilterLayerUpdater(newState.keplerGl.map.visState, setPolygonFilterLayerAction)
  }

  newState = {
    ...newState,
    undoRedo: {
      ...newState.undoRedo,
      isGridToggled: false,
      selectedRoadTypes: [],
      selectedIndexes: new Set<number>
    },
  };
  return newState;
}

export function customSetFeatures(state, action) {
  const nbFeaturesBefore = state.keplerGl.map.visState.editor.features.length;
  let newState = demoReducer(state, action);
  const nbFeaturesAfter = newState.keplerGl.map.visState.editor.features.length;

  let selectedLayer: undefined;
  if (nbFeaturesBefore == 0 && nbFeaturesAfter >= 1) {
    selectedLayer = newState.keplerGl.map.visState.layers[0]; // select grid by default
    const feature = newState.keplerGl.map.visState.editor.features[0];

    const setPolygonFilterLayerAction = setPolygonFilterLayer(selectedLayer, feature);
    newState.keplerGl.map.visState = setPolygonFilterLayerUpdater(newState.keplerGl.map.visState, setPolygonFilterLayerAction);
  } else {
    const selectedLayerIdx = newState.keplerGl.map.visState.layers.findIndex((l) => l.id === newState.keplerGl.map.visState.filters[0].dataId[0]);
    selectedLayer = newState.keplerGl.map.visState.layers[selectedLayerIdx];
  }

  if (selectedLayer) {
    newState.undoRedo = {
      ...newState.undoRedo,
      selectedIndexes: new Set(newState.keplerGl.map.visState.datasets[selectedLayer.config.dataId].filteredIndex)
    };

    const highlightAction = highlightSelectedFeature(selectedLayer);
    newState = highlightSelectedFeatureUpdater(newState, highlightAction);
  }

  return newState;
}

export function customSetFilters(
  state: VisState,
  action: VisStateActions.SetFilterUpdaterAction
): VisState {
  const visState = state.keplerGl.map.visState;
  const {idx, prop, value, valueIndex = 0} = action.payload ? action.payload : action;
  const oldFilter = visState.filters[idx];

  if (!oldFilter) {
    return state;
  }
  let newFilter = set([prop], value, oldFilter);
  let newVisState = visState;

  const {dataId} = newFilter;

  // Ensuring backward compatibility
  let datasetIds = toArray(dataId);

  switch (prop) {
    // TODO: Next PR for UI if we update dataId, we need to consider two cases:
    // 1. dataId is empty: create a default filter
    // 2. Add a new dataset id
    case FILTER_UPDATER_PROPS.dataId:
      // if trying to update filter dataId. create an empty new filter
      newFilter = updateFilterDataId(dataId);
      break;

    case FILTER_UPDATER_PROPS.name:
      // we are supporting the current functionality
      // TODO: Next PR for UI filter name will only update filter name but it won't have side effects
      // we are gonna use pair of datasets and fieldIdx to update the filter
      const datasetId = newFilter.dataId[valueIndex];
      const {filter: updatedFilter, dataset: newDataset} = applyFilterFieldName(
        newFilter,
        visState.datasets[datasetId],
        value,
        valueIndex,
        {mergeDomain: false}
      );
      if (!updatedFilter) {
        return state;
      }

      newFilter = updatedFilter;

      if (newFilter.gpu) {
        newFilter = setFilterGpuMode(newFilter, visState.filters);
        newFilter = assignGpuChannel(newFilter, visState.filters);
      }

      newVisState = set(['datasets', datasetId], newDataset, visState);

      // only filter the current dataset
      break;
    case FILTER_UPDATER_PROPS.layerId:
      // We need to update only datasetId/s if we have added/removed layers
      // - check for layerId changes (XOR works because of string values)
      // if no differences between layerIds, don't do any filtering
      // @ts-ignore
      const layerDataIds = ['road_network', 'grid'];

      // only filter datasetsIds
      datasetIds = layerDataIds;

      // Update newFilter dataIds
      const newDataIds = uniq<string>(
        newFilter.layerId
          ?.map(lid =>
            get(
              visState.layers.find(l => l.id === lid),
              ['config', 'dataId']
            )
          )
          .filter(d => d) as string[]
      );

      newFilter = {
        ...newFilter,
        dataId: newDataIds
      };

      break;
    default:
      break;
  }

  const enlargedFilter = visState.filters.find(f => f.view === FILTER_VIEW_TYPES.enlarged);

  if (enlargedFilter && enlargedFilter.id !== newFilter.id) {
    // there should be only one enlarged filter
    newFilter.view = FILTER_VIEW_TYPES.side;
  }

  // save new filters to newVisState
  newVisState = set(['filters', idx], newFilter, newVisState);

  // if we are currently setting a prop that only requires to filter the current
  // dataset we will pass only the current dataset to applyFiltersToDatasets and
  // updateAllLayerDomainData otherwise we pass the all list of datasets as defined in dataId
  const datasetIdsToFilter = LIMITED_FILTER_EFFECT_PROPS[prop]
    ? [datasetIds[valueIndex]]
    : datasetIds;

  // filter data
  const filteredDatasets = applyFiltersToDatasets(
    datasetIdsToFilter,
    newVisState.datasets,
    newVisState.filters,
    newVisState.layers
  );

  newVisState = set(['datasets'], filteredDatasets, newVisState);
  // dataId is an array
  // pass only the dataset we need to update
  newVisState = updateAllLayerDomainData(newVisState, datasetIdsToFilter, newFilter);

  return {
    ...state,
    keplerGl: {
      ...state.keplerGl,
      map: {
        ...state.keplerGl.map,
        visState: newVisState
      }
    }
  }
}

const composedUpdaters = {
  [LOAD_REMOTE_RESOURCE_SUCCESS]: loadRemoteResourceSuccess,
  [LOAD_REMOTE_RESOURCE_ERROR]: loadRemoteResourceError,
  [REMOVE_ALL_DATASETS]: removeAllDatasets,
  [HIGHLIGHT_SELECTED_FEATURE]: highlightSelectedFeatureUpdater,
  // Override some of the default actions/reducers
  [ActionTypes.DELETE_FEATURE]: customDeleteFeature,
  [ActionTypes.SET_FEATURES]: customSetFeatures,
  [ActionTypes.SET_FILTER]: customSetFilters
};

const composedReducer = (state, action) => {
  if (composedUpdaters[action.type]) {
    return composedUpdaters[action.type](state, action);
  }
  return demoReducer(state, action);
};

// export demoReducer to be combined in website app
export default composedReducer;

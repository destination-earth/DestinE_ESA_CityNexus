// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import {combineReducers} from 'redux';
import {handleActions} from 'redux-actions';

import keplerGlReducer, {
  combinedUpdaters, setPolygonFilterLayerUpdater,
  uiStateUpdaters
} from '@kepler.gl/reducers';
import {processGeojson, processRowObject, processArrowTable} from '@kepler.gl/processors';
import KeplerGlSchema from '@kepler.gl/schemas';
import {EXPORT_MAP_FORMATS} from '@kepler.gl/constants';

import {
  INIT,
  LOAD_MAP_SAMPLE_FILE,
  LOAD_PREDICTION_SAMPLE_FILE,
  LOAD_REMOTE_RESOURCE_SUCCESS,
  LOAD_REMOTE_RESOURCE_ERROR,
  SET_SAMPLE_LOADING_STATUS
} from '../actions';

import {CLOUD_PROVIDERS_CONFIGURATION} from '../constants/default-settings';
import {generateHashId} from '../utils/strings';
import {default as ActionTypes} from "@kepler.gl/actions/dist/action-types";
import {setPolygonFilterLayer} from "@kepler.gl/actions";

export type AppState = {
  appName: String;
  loaded: Boolean;
  predictionMaps: any[];
  sampleMaps: any[];
  isMapLoading: Boolean;
  error: any;
};

// INITIAL_APP_STATE
const initialAppState: AppState = {
  appName: 'example',
  loaded: false,
  predictionMaps: [],
  sampleMaps: [], // this is used to store sample maps fetch from a remote json file
  isMapLoading: false, // determine whether we are loading a sample map,
  error: null // contains error when loading/retrieving data/configuration
  // {
  //   status: null,
  //   message: null
  // }
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
    }
  }),
  app: appReducer
});

/**
 * Reorders the layers so that any grid layer is at the bottom
 * @param keplerGlInstance
 */
const reorderLayers = (keplerGlInstance) => {
  const layers = keplerGlInstance.visState.layers;
  const gridLayerIndex = layers.findIndex(layer => layer.config.dataId === "grid");

  if (gridLayerIndex !== -1) {
    const layerOrder = keplerGlInstance.visState.layerOrder.filter(id => id !== layers[gridLayerIndex].id);
    layerOrder.push(layers[gridLayerIndex].id);
    keplerGlInstance.visState.layerOrder = layerOrder;
  }
};

// this can be moved into a action and call kepler.gl action
/**
 *
 * @param state
 * @param action {map: resultset, config, map}
 * @returns {{app: {isMapLoading: boolean}, keplerGl: {map: (state|*)}}}
 */
export const loadRemoteResourceSuccess = (state, action) => {
  // TODO: replace generate with a different function
  const datasetId = action.options.id || generateHashId(6);
  const datasetLabel = action.options.label || 'new dataset';
  const {dataUrl} = action.options;
  let processorMethod = processRowObject;
  // TODO: create helper to determine file ext eligibility
  if (dataUrl.includes('.json') || dataUrl.includes('.geojson') || dataUrl.includes('.zip')) {
    processorMethod = processGeojson;
  } else if (dataUrl.includes('.arrow')) {
    processorMethod = processArrowTable;
  }

  const datasets = {
    info: {
      id: datasetId,
      label: datasetLabel
    },
    data: processorMethod(action.response)
  };

  const config = action.config ? KeplerGlSchema.parseSavedConfig(action.config) : null;

  const keplerGlInstance = combinedUpdaters.addDataToMapUpdater(
    state.keplerGl.map, // "map" is the id of your kepler.gl instance
    {
      payload: {
        datasets,
        config,
        options: {
          centerMap: Boolean(!action.config),
          keepExistingConfig: true
        }
      }
    }
  );

  reorderLayers(keplerGlInstance);

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

export function customDeleteFeature(state, action) {
  const nbFeaturesBefore = state.keplerGl.map.visState.editor.features.length;
  var newState = demoReducer(state, action);
  const nbFeaturesAfter = newState.keplerGl.map.visState.editor.features.length;

  if (nbFeaturesBefore >= 1 && nbFeaturesAfter == 0) {
    const layer = newState.keplerGl.map.visState.layers[0]
    const setPolygonFilterLayerAction = setPolygonFilterLayer(layer, newState.keplerGl.map.visState.editor.features[0])
    newState.keplerGl.map.visState = setPolygonFilterLayerUpdater(newState.keplerGl.map.visState, setPolygonFilterLayerAction)
  }
  return newState;
}

export function customSetFeatures(state, action) {
  const nbFeaturesBefore = state.keplerGl.map.visState.editor.features.length;
  var newState = demoReducer(state, action);
  const nbFeaturesAfter = newState.keplerGl.map.visState.editor.features.length;

  if (nbFeaturesBefore == 0 && nbFeaturesAfter >= 1) {
    const layer = newState.keplerGl.map.visState.layers[0]
    const setPolygonFilterLayerAction = setPolygonFilterLayer(layer, newState.keplerGl.map.visState.editor.features[0])
    newState.keplerGl.map.visState = setPolygonFilterLayerUpdater(newState.keplerGl.map.visState, setPolygonFilterLayerAction)
  }
  return newState;
}

const composedUpdaters = {
  [LOAD_REMOTE_RESOURCE_SUCCESS]: loadRemoteResourceSuccess,
  [LOAD_REMOTE_RESOURCE_ERROR]: loadRemoteResourceError,
  // Override some of the default actions/reducers
  [ActionTypes.DELETE_FEATURE]: customDeleteFeature,
  [ActionTypes.SET_FEATURES]: customSetFeatures
};

const composedReducer = (state, action) => {
  if (composedUpdaters[action.type]) {
    return composedUpdaters[action.type](state, action);
  }
  return demoReducer(state, action);
};

// export demoReducer to be combined in website app
export default composedReducer;

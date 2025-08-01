// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import {push} from 'react-router-redux';
import {request} from 'd3-request';
import {addLayer, loadFiles, removeLayer, toggleModal} from '@kepler.gl/actions';
import {load} from '@loaders.gl/core';

import {
  DATA_URL,
  LOADING_SAMPLE_ERROR_MESSAGE,
} from './constants/default-settings';
import {parseUri} from './utils/url';
import {CustomZippedGeoJSONLoader} from "./loaders/custom-loaders";
import {selectSelectedCityName, setHasChangedMap} from "./features/user/userSlice";
import {getPredictions, getScenarios} from "./features/simulations/store/simulationSlice";
import {setChanges, setIsGridToggled} from "./features/undo-redo/store/UndoRedoReducer";
import {
  calculateColorMapping, getColorLegends, getColorMap, getColors,
  setColorMapperFeatures,
  setColorMapperParameter, setColorMapperRange, setColorMapperScaleType
} from "./features/color-mapper/ColorMapperReducer";
import {openConfigureVisualizationModal} from "./features/visualization-manager/store/ConfigureVisualizationSlice";
import {setOriginalLayer} from "./features/multiple-simulations/store/MultipleSimulationsReducer";

// CONSTANTS
export const INIT = 'INIT';
export const CLEAR_HOVER_AND_CLICKED = 'CLEAR_HOVER_AND_CLICKED';
export const LOAD_REMOTE_RESOURCE_SUCCESS = 'LOAD_REMOTE_RESOURCE_SUCCESS';
export const LOAD_REMOTE_RESOURCE_ERROR = 'LOAD_REMOTE_RESOURCE_ERROR';
export const LOAD_MAP_SAMPLE_FILE = 'LOAD_MAP_SAMPLE_FILE';
export const LOAD_PREDICTION_SAMPLE_FILE = 'LOAD_PREDICTION_SAMPLE_FILE';
export const SET_SAMPLE_LOADING_STATUS = 'SET_SAMPLE_LOADING_STATUS';
export const SET_PREDICTION_LOADING_STATUS = 'SET_PREDICTION_LOADING_STATUS';
export const REMOVE_ALL_DATASETS = 'REMOVE_ALL_DATASETS';
export const HIGHLIGHT_SELECTED_FEATURE = 'HIGHLIGHT_SELECTED_FEATURE';

// ACTIONS
export function initApp() {
  return {
    type: INIT
  };
}

export function loadRemoteResourceSuccess(response, config, options, keepExistingConfig) {
  return {
    type: LOAD_REMOTE_RESOURCE_SUCCESS,
    response,
    config,
    options,
    keepExistingConfig
  };
}

export function clearHoverAndClicked() {
  return {
    type: CLEAR_HOVER_AND_CLICKED
  };
}

export function removeAllDatasets(newDatasetType, newCityName) {
  return {
    type: REMOVE_ALL_DATASETS,
    newDatasetType,
    newCityName
  };
}

export function highlightSelectedFeature(selectedLayer) {
  return {
    type: HIGHLIGHT_SELECTED_FEATURE,
    selectedLayer
  };
}

export function loadRemoteResourceError(error, url) {
  return {
    type: LOAD_REMOTE_RESOURCE_ERROR,
    error,
    url
  };
}

export function loadMapSampleFile(samples) {
  return {
    type: LOAD_MAP_SAMPLE_FILE,
    samples
  };
}

export function loadPredictionSampleFile(samples) {
  return {
    type: LOAD_PREDICTION_SAMPLE_FILE,
    samples
  };
}

export function setLoadingMapStatus(isMapLoading) {
  return {
    type: SET_SAMPLE_LOADING_STATUS,
    isMapLoading
  };
}

export function setLoadingPredictionStatus(isPredictionLoading) {
  return {
    type: SET_PREDICTION_LOADING_STATUS,
    isPredictionLoading
  };
}

/**
 * Actions passed to kepler.gl, called
 *
 * Note: exportFile is called on both saving and sharing
 *
 * @param {*} param0
 */
export function onExportFileSuccess({response = {}, provider, options}) {
  return dispatch => {
    // if isPublic is true, use share Url
    if (options.isPublic && provider.getShareUrl) {
      dispatch(push(provider.getShareUrl(false)));
    } else if (!options.isPublic && provider.getMapUrl) {
      // if save private map to storage, use map url
      dispatch(push(provider.getMapUrl(false)));
    }
  };
}

export function onLoadCloudMapSuccess({provider, loadParams}) {
  return dispatch => {
    const mapUrl = provider?.getMapUrl(loadParams);
    if (mapUrl) {
      const url = `demo/map/${provider.name}?path=${mapUrl}`;
      dispatch(push(url));
    }
  };
}
/**
 * this method detects whther the response status is < 200 or > 300 in case the error
 * is not caught by the actualy request framework
 * @param response the response
 * @returns {{status: *, message: (*|{statusCode}|Object)}}
 */
function detectResponseError(response) {
  if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
    return {
      status: response.statusCode,
      message: response.body || response.message || response
    };
  }
}

// This can be moved into Kepler.gl to provide ability to load data from remote URLs
/**
 * The method is able to load both data and kepler.gl files.
 * It uses loadFile action to dispatcha and add new datasets/configs
 * to the kepler.gl instance
 * @param options
 * @param {string} options.dataUrl the URL to fetch data from. Current supoprted file type json,csv, kepler.json
 * @returns {Function}
 */
export function loadRemoteMap(options) {
  return dispatch => {
    dispatch(setLoadingMapStatus(true));
    // breakdown url into url+query params
    loadRemoteRawData(options.dataUrl).then(
      // In this part we turn the response into a FileBlob
      // so we can use it to call loadFiles
      ([file, url]) => {
        const {file: filename} = parseUri(url);
        dispatch(loadFiles([new File([file], filename)])).then(() =>
          dispatch(setLoadingMapStatus(false))
        );
      },
      error => {
        const {target = {}} = error;
        const {status, responseText} = target;
        dispatch(loadRemoteResourceError({status, message: responseText}, options.dataUrl));
      }
    );
  };
}

/**
 * Load a file from a remote URL
 * @param url
 * @returns {Promise<any>}
 */
function loadRemoteRawData(url) {
  if (!url) {
    // TODO: we should return reject with an appropriate error
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    request(url, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      const responseError = detectResponseError(result);
      if (responseError) {
        reject(responseError);
        return;
      }
      resolve([result.response, url]);
    });
  });
}

// The following methods are only used to load SAMPLES
/**
 *
 * @param {Object} scenario
 * @param userId
 * @param {string} [scenario.dataUrl] the URL to fetch data from, e.g. https://raw.githubusercontent.com/keplergl/kepler.gl-data/master/earthquakes/data.csv
 * @param {string} [scenario.configUrl] the URL string to fetch kepler config from, e.g. https://raw.githubusercontent.com/keplergl/kepler.gl-data/master/earthquakes/config.json
 * @param {string} [scenario.id] the id used as dataset unique identifier, e.g. earthquakes
 * @param {string} [scenario.label] the label used to describe the new dataset, e.g. California Earthquakes
 * @param {string} [scenario.queryType] the type of query to execute to load data/config, e.g. sample
 * @param {string} [scenario.imageUrl] the URL to fetch the dataset image to use in sample gallery
 * @param {string} [scenario.description] the description used in sample galley to define the current example
 * @param {string} [scenario.size] the number of entries displayed in the current sample
 * @returns {Function}
 */
export function loadScenario(scenario, userId) {
  return dispatch => {
    dispatch(setLoadingMapStatus(true));
    dispatch(loadRemoteScenario(scenario, userId));
  };
}

export function loadPrediction(options, userId) {
  return dispatch => {
    dispatch(setLoadingMapStatus(true));
    dispatch(loadRemotePrediction(options, userId));
  };
}

export function loadXai(options, userId) {
  return dispatch => {
    dispatch(setLoadingMapStatus(true));
    dispatch(loadRemoteXai(options, userId));
  };
}

function updateGeoJsonWithScenarioData (geojson, scenarioData, id_parameter) {
  if (scenarioData === undefined) {
    return
  }

  for (const [scenarioDataKey, scenarioDataValue] of Object.entries(scenarioData)) {
    // Find the feature in the geojson with the matching id
    const feature = geojson.features.find(f => f.properties[id_parameter] === scenarioDataKey);
    if (feature) {
      // Update the feature's properties with the scenarioData values
      const transformedData = {};
      for (const [key, value] of Object.entries(scenarioDataValue)) {
        transformedData[key] = value;
      }
      feature.properties = {
        ...feature.properties,
        ...transformedData,
        changed: true
      };
    }
  }
}

/**
 * Load remote map with config and data
 * @param scenario {configUrl, dataUrl}
 * @returns {Function}
 */
function loadRemoteScenario(scenario, userId) {
  return dispatch => {
    const {id, city, label} = scenario;

    const scenarioDataUrl = `${DATA_URL}/scenarios/${id}/user_changes/data`
    const baseRoadsDataUrl = `${DATA_URL}/scenarios/${city}/base_roads/data`
    const baseRoadsConfigUrl = `${DATA_URL}/scenarios/${city}/base_roads/config`
    const baseGridDataUrl = `${DATA_URL}/scenarios/${city}/base_grid/data`
    const baseGridConfigUrl = `${DATA_URL}/scenarios/${city}/base_grid/config`

    Promise.all([
      loadRemoteData(scenarioDataUrl, userId),
      loadRemoteData(baseRoadsDataUrl, userId),
      loadRemoteConfig(baseRoadsConfigUrl, userId),
      loadRemoteData(baseGridDataUrl, userId),
      loadRemoteConfig(baseGridConfigUrl, userId)
    ]).then(
      ([scenarioData, baseRoadsData, baseRoadsConfig, baseGridData, baseGridConfig]) => {
        updateGeoJsonWithScenarioData(baseRoadsData, scenarioData.changes.mobility_model_input.road_network, "osm_id")
        updateGeoJsonWithScenarioData(baseGridData, scenarioData.changes.mobility_model_input.grid, "h3-id")

        const gridId = "grid";
        const roadsId = "road_network";
        const gridLabel = `Grid - ${label}`;
        const roadsLabel = `Roads - ${label}`;
        baseGridConfig.config.visState.layers["0"].config.label = gridLabel;
        baseGridConfig.config.visState.layers["0"].config.dataId = gridId;
        baseGridConfig.config.visState.layers["0"].id = gridId;
        baseRoadsConfig.config.visState.layers["0"].config.label = roadsLabel;
        baseRoadsConfig.config.visState.layers["0"].config.dataId = roadsId;
        baseRoadsConfig.config.visState.layers["0"].id = roadsId;

        dispatch(removeAllDatasets("scenario", city));
        // reset the grid toggle in the map popover menu
        dispatch(setIsGridToggled(false));
        dispatch(loadRemoteResourceSuccess(baseGridData, baseGridConfig, {
          ...scenario,
          "id": gridId,
          "label": gridLabel
        }, true));
        dispatch(loadRemoteResourceSuccess(baseRoadsData, baseRoadsConfig, {
          ...scenario,
          "id": roadsId,
          "label": roadsLabel
        }, true));
        dispatch(setHasChangedMap(false));
        dispatch(setChanges({scenarioChanges: scenarioData, scenarioId: id, scenarioName: label}));
        dispatch(toggleModal(null));
      },
      error => {
        if (error) {
          const {target = {}} = error;
          const {status, responseText} = target;
          dispatch(
            loadRemoteResourceError(
              {
                status,
                message: `${responseText} - ${LOADING_SAMPLE_ERROR_MESSAGE} ${id} (${scenarioDataUrl})`
              },
              scenarioDataUrl
            )
          );
        }
      }
    );
  };
}

function formatTimestamps(predictionData: null, options) {
  const timestampCache = {};
  predictionData.features.forEach(feature => {
    const timeWindow = feature.properties.time_window;
    if (typeof timeWindow === 'string') {
      if (!timestampCache[timeWindow]) {
        const match = timeWindow.match(/(weekend|weekday)_(\d+)/);
        if (match) {
          const hours = match[2];
          const date = new Date(options.date);
          date.setHours(parseInt(hours), 0, 0, 0);
          timestampCache[timeWindow] = date.getTime() / 1000; // Convert to UNIX timestamp
        }
      }
      feature.properties.time_window = timestampCache[timeWindow];
    }
  });
}

function loadRemotePrediction(options, userId) {
  return (dispatch, getState) => {
    const {id, dayType, city, name} = options;
    const state = getState();

    const predictionDataUrl = `${DATA_URL}/predictions/${id}/data?day_type=${dayType}`
    const predictionConfigUrl = `${DATA_URL}/predictions/${id}/config?city=${city}`
    const predictionId = `prediction_${id}_${dayType}`;
    const predictionLabel = `no2 - ${name} - Prediction`;
    const selectedCityName = selectSelectedCityName(state);

    if (predictionId in state.demo.keplerGl.map.visState.datasets) {
      if (!predictionId.includes(selectedCityName)) {
        dispatch(
          loadRemoteResourceError(
            {
              message: `Prediction is already loaded - ${LOADING_SAMPLE_ERROR_MESSAGE} ${id}`
            },
            predictionConfigUrl
          )
        );
      }
      dispatch(setLoadingMapStatus(false));
      return;
    }

    Promise.all([
      loadRemoteData(predictionDataUrl, userId),
      loadRemoteConfig(predictionConfigUrl, userId)
    ]).then(
      ([predictionData, predictionConfig]) => {
        predictionConfig.config.visState.layers["0"].config.label = predictionLabel;
        predictionConfig.config.visState.layers["0"].config.dataId = predictionId;
        predictionConfig.config.visState.layers["0"].id = predictionId;

        formatTimestamps(predictionData, options);

        // Remove existing datasets if needed
        dispatch(removeAllDatasets("simulation", city));
        // Load the downloaded dataset and config into kepler gl
        dispatch(loadRemoteResourceSuccess(predictionData, predictionConfig, {
          ...options,
          "id": predictionId,
          "label": `${name} - Prediction`
        }, true));
        // Split the loaded dataset into as many layers as selected by the user
        dispatch(setOriginalLayer({
          datasetId: predictionId,
          originalLayer: getState().demo.keplerGl.map.visState.layers.filter(layer => layer.id === predictionId)[0]
        }));
        getState().multipleSimulations.originalLayers[predictionId].originalLabel = `${name} - Prediction`;
        dispatch(openConfigureVisualizationModal());
        dispatch(toggleModal(null));
      },
      error => {
        if (error) {
          const {target = {}} = error;
          const {status, responseText} = target;
          dispatch(
            loadRemoteResourceError(
              {
                status,
                message: `${responseText} - ${LOADING_SAMPLE_ERROR_MESSAGE} ${id} (${predictionDataUrl})`
              },
              predictionConfigUrl
            )
          );
        }
      }
    );
  };
}

function loadRemoteXai(xai, userId) {
  return (dispatch) => {
    const {id, dayType, name, city} = xai;

    const xaiImpactDataUrl = `${DATA_URL}/predictions/${id}/xai_impact`
    const xaiDiffDataUrl = `${DATA_URL}/predictions/${id}/xai_diffs`
    const xaiConfigUrl = `${DATA_URL}/predictions/${id}/config`

    Promise.all([
      loadRemoteConfig(xaiImpactDataUrl, userId),
      loadRemoteConfig(xaiDiffDataUrl, userId),
      loadRemoteConfig(xaiConfigUrl, userId),
      loadRemoteConfig(xaiConfigUrl, userId)
    ]).then(
      ([xaiImpactData, xaiDiffData, xaiImpactConfig, xaiDiffConfig]) => {
        const xaiDiffId = `xai_diff_${id}_${dayType}`;
        const xaiImpactId = `xai_impact_${id}_${dayType}`;
        const xaiImpactLabel = `XAI Impact - ${name}`;
        const xaiDiffLabel = `XAI Diff - ${name}`;
        xaiImpactConfig.config.visState.layers["0"].config.label = xaiImpactLabel;
        xaiImpactConfig.config.visState.layers["0"].config.dataId = xaiImpactId;
        xaiImpactConfig.config.visState.layers["0"].id = xaiImpactId;
        xaiDiffConfig.config.visState.layers["0"].config.label = xaiDiffLabel;
        xaiDiffConfig.config.visState.layers["0"].config.dataId = xaiDiffId;
        xaiDiffConfig.config.visState.layers["0"].id = xaiDiffId;

        formatTimestamps(xaiImpactData, xai);
        formatTimestamps(xaiDiffData, xai);

        dispatch(removeAllDatasets("xai", city));
        dispatch(loadRemoteResourceSuccess(xaiImpactData, xaiImpactConfig, {
          ...xai,
          "id": xaiImpactId,
          "label": xaiImpactLabel
        }, true));
        dispatch(loadRemoteResourceSuccess(xaiDiffData, xaiDiffConfig, {
          ...xai,
          "id": xaiDiffId,
          "label": xaiDiffLabel
        }, true));
        dispatch(setHasChangedMap(false));
        dispatch(toggleModal(null));
      },
      error => {
        if (error) {
          const {target = {}} = error;
          const {status, responseText} = target;
          dispatch(
            loadRemoteResourceError(
              {
                status,
                message: `${responseText} - ${LOADING_SAMPLE_ERROR_MESSAGE} ${xai.id} (${xaiImpactDataUrl})`
              },
              xaiConfigUrl
            )
          );
        }
      }
    );
  };
}

export function splitSelectedLayers(fields, dataset, selectedDatasets) {
  return (dispatch, getState) => {
    const state = getState();
    const originalLayerConfig = state.multipleSimulations.originalLayers[dataset];
    const visState = state.demo.keplerGl.map.visState;

    // Filter out existing layers that are not present in the selected fields
    const layersToBeRemoved = visState.layers.filter(layer => {
      const layerData = layer.id.split(';');
      const layerId = layerData[0];

      return layerId === dataset || !selectedDatasets.includes(layerId);
    });

    const newLayers = fields.map((field) => {
      const descriptors = Object.getOwnPropertyDescriptors(originalLayerConfig);
      const newLayer = Object.create(Object.getPrototypeOf(originalLayerConfig));
      Object.defineProperties(newLayer, descriptors);
      newLayer.id = `${originalLayerConfig.id};${field}`;
      newLayer.config = {
        ...originalLayerConfig.config,
        label: `${field} - ${originalLayerConfig.originalLabel}`,
        strokeColorField: {
          name: field,
          type: 'real'
        }
      };
      Object.defineProperty(newLayer, 'visualChannels', {
        value: {
          ...originalLayerConfig.visualChannels,
        strokeColorField: {
          name: field,
          type: 'real'
        }
        },
        writable: true,
        enumerable: true,
        configurable: true
      });
      // this should not be needed but somehow if it is not present, the layer is not rendered
      // the exact cause for that can be found in the fields.findIndex loop of validateSavedLayerColumns
      newLayer.config.columns.geojson = "_geojson"
      return newLayer;
    });

    for (const layer of layersToBeRemoved) {
        dispatch(removeLayer(layer.id));
    }
    for (const layer of newLayers) {
        dispatch(addLayer(layer, dataset));
    }
  }
}

export function colorSelectedLayers(layers, dataset) {
  return (dispatch, getState) => {
    const state = getState().demo.keplerGl.map.visState;
    const fields = state.datasets[dataset].fields.filter(field => layers.includes(field.displayName));

    fields.forEach((field) => {
        const layer = state.layers.filter(layer => layer.id === `${dataset};${field.displayName}`)[0];
        layer.config.strokeColorField.type = field.type;
        dispatch(adjustColorRange(field, layer));
    })
    dispatch(setLoadingPredictionStatus(false));
  }
}

function adjustColorRange(field, layer) {
  return (dispatch) => {
    dispatch(setColorMapperFeatures({
      layerId: layer.id,
      features: layer.dataToFeature,
      field: field.displayName
    }));

    const colorRange = layer.config?.visConfig?.strokeColorRange?.colors;

    if (colorRange) {
      dispatch(setColorMapperRange({
        layerId: layer.id,
        colorRange: colorRange
      }));
    }
    dispatch(setColorMapperParameter({
        layerId: layer.id,
        parameter: field.displayName
      }));
    dispatch(setColorMapperScaleType({
      layerId: layer.id,
      scaleType: 'quantize'
    }));
    dispatch(adjustStrokeColorRange(layer));
  };
}

export function adjustStrokeColorRange(layer) {
  return (dispatch, getState) => {
    // Recalculate the color mapping
    dispatch(calculateColorMapping(layer.id));

    // Retrieve the updated color mapping from the state
    const state = getState();
    const colorMapState = state.colorMapper[layer.id];
    const colorMap = getColorMap(colorMapState);
    const colorLegends = getColorLegends(colorMapState);
    const colors = getColors(colorMapState);

    // Update the visConfig strokeColorRange
    layer.config.visConfig.strokeColorRange = {
      colors: colors,
      colorMap: colorMap,
      colorLegends: colorLegends,
    };
  };
}

/**
 *
 * @param url
 * @returns {Promise<any>}
 */
export function loadRemoteConfig(url, userId) {
  if (!url) {
    // TODO: we should return reject with an appropriate error
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    requestJson(url, userId, (error, config) => {
      if (error) {
        reject(error);
        return;
      }
      const responseError = detectResponseError(config);
      if (responseError) {
        reject(responseError);
        return;
      }
      resolve(config);
    });
  });
}

/**
 *
 * @param url to fetch data from (csv, json, geojson)
 * @returns {Promise<any>}
 */
export function loadRemoteData(url, userId) {
  if (!url) {
    // TODO: we should return reject with an appropriate error
    return Promise.resolve(null);
  }

  // Load data
  return new Promise(resolve => {
    const loaders = CustomZippedGeoJSONLoader;
    const loadOptions = {
      arrow: {
        shape: 'arrow-table'
      },
      csv: {
        shape: 'object-row-table'
      },
      metadata: true,
      // we need to force the mimeType
      mimeType: 'application/zip',
      // this is a RequestInit object with the authorization header
      // it is used when calling fetch(url, requestInit)
      fetch: {
        headers: {
          'Authorization': `Token ${userId}`,
          'Content-Type': 'application/zip'
        }
      }
    };
    const data = load(url, loaders, loadOptions);
    resolve(data);
  });
}

const requestJson = (url, userId, callback) => {
  return request(url)
      .mimeType("application/json")
      .header('Authorization', `Token ${userId}`)
      .response(function(xhr) { return JSON.parse(xhr.responseText); })
      .get(callback);
};

async function fetchConfigurations(dispatch, userId, getSamples, loadSamples, projectName) {
  const samplePromises = [dispatch(getSamples(true)).unwrap()];

  if (userId) {
    samplePromises.push(dispatch(getSamples(false)).unwrap());
  }

  let allSamples = (await Promise.all(samplePromises)).flat();

  if (projectName) {
    allSamples = allSamples.filter(sample => sample.project === projectName);
  }
  dispatch(loadSamples(allSamples));
}

export function loadSampleConfigurations(userId, projectName) {
  return async dispatch => {
    await fetchConfigurations(dispatch, userId, getScenarios, loadMapSampleFile, projectName);
  };
}

export function loadPredictionConfigurations(userId) {
  return async dispatch => {
    await fetchConfigurations(dispatch, userId, getPredictions, loadPredictionSampleFile);
  };
}
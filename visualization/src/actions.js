// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import {push} from 'react-router-redux';
import {request} from 'd3-request';
import {loadFiles, toggleModal} from '@kepler.gl/actions';
import {load} from '@loaders.gl/core';

import {
  DATA_URL,
  LOADING_SAMPLE_ERROR_MESSAGE,
} from './constants/default-settings';
import {parseUri} from './utils/url';
import {CustomZippedGeoJSONLoader} from "./loaders/custom-loaders";
import {setHasChangedMap} from "./components/user/userSlice";
import {getPredictions, getScenarios} from "./features/simulations/store/simulationSlice";
import {setChanges} from "./features/undo-redo/store/UndoRedoReducer";

// CONSTANTS
export const INIT = 'INIT';
export const LOAD_REMOTE_RESOURCE_SUCCESS = 'LOAD_REMOTE_RESOURCE_SUCCESS';
export const LOAD_REMOTE_RESOURCE_ERROR = 'LOAD_REMOTE_RESOURCE_ERROR';
export const LOAD_MAP_SAMPLE_FILE = 'LOAD_MAP_SAMPLE_FILE';
export const LOAD_PREDICTION_SAMPLE_FILE = 'LOAD_PREDICTION_SAMPLE_FILE';
export const SET_SAMPLE_LOADING_STATUS = 'SET_SAMPLE_LOADING_STATUS';
export const SET_SCENARIO_CHANGES = 'SET_SCENARIO_CHANGES';
export const REMOVE_ALL_DATASETS = 'REMOVE_ALL_DATASETS';

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

export function removeAllDatasets() {
  return {
    type: REMOVE_ALL_DATASETS
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
 * @param {Object} options
 * @param userId
 * @param {string} [options.dataUrl] the URL to fetch data from, e.g. https://raw.githubusercontent.com/keplergl/kepler.gl-data/master/earthquakes/data.csv
 * @param {string} [options.configUrl] the URL string to fetch kepler config from, e.g. https://raw.githubusercontent.com/keplergl/kepler.gl-data/master/earthquakes/config.json
 * @param {string} [options.id] the id used as dataset unique identifier, e.g. earthquakes
 * @param {string} [options.label] the label used to describe the new dataset, e.g. California Earthquakes
 * @param {string} [options.queryType] the type of query to execute to load data/config, e.g. sample
 * @param {string} [options.imageUrl] the URL to fetch the dataset image to use in sample gallery
 * @param {string} [options.description] the description used in sample galley to define the current example
 * @param {string} [options.size] the number of entries displayed in the current sample
 * @returns {Function}
 */
export function loadScenario(options, userId) {
  return dispatch => {
    dispatch(loadRemoteScenario(options, userId));
    dispatch(setLoadingMapStatus(true));
  };
}

export function loadPrediction(options, userId) {
  return dispatch => {
    dispatch(loadRemotePrediction(options, userId));
    dispatch(setLoadingMapStatus(true));
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
 * @param options {configUrl, dataUrl}
 * @returns {Function}
 */
function loadRemoteScenario(options, userId) {
  return dispatch => {
    const {id, label} = options;

    const scenarioDataUrl = `${DATA_URL}/scenarios/${id}/user_changes/data`
    const baseRoadsDataUrl = `${DATA_URL}/scenarios/${id}/base_roads/data`
    const baseRoadsConfigUrl = `${DATA_URL}/scenarios/${id}/base_roads/config`
    const baseGridDataUrl = `${DATA_URL}/scenarios/${id}/base_grid/data`
    const baseGridConfigUrl = `${DATA_URL}/scenarios/${id}/base_grid/config`

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
        const gridLabel = `${label} - Grid`;
        const roadsLabel = `${label} - Roads`;
        baseGridConfig.config.visState.layers["0"].config.label = gridLabel;
        baseGridConfig.config.visState.layers["0"].config.dataId = gridId;
        baseGridConfig.config.visState.layers["0"].id = gridId;
        baseRoadsConfig.config.visState.layers["0"].config.label = roadsLabel;
        baseRoadsConfig.config.visState.layers["0"].config.dataId = roadsId;
        baseRoadsConfig.config.visState.layers["0"].id = roadsId;

        dispatch(removeAllDatasets());
        dispatch(loadRemoteResourceSuccess(baseGridData, baseGridConfig, {
          ...options,
          "id": gridId,
          "label": gridLabel
        }, true));
        dispatch(loadRemoteResourceSuccess(baseRoadsData, baseRoadsConfig, {
          ...options,
          "id": roadsId,
          "label": roadsLabel
        }, true));
        dispatch(setHasChangedMap(false))
        dispatch(setChanges({scenarioChanges: scenarioData, scenarioId: id, scenarioName: label}))
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


function loadRemotePrediction(options, userId) {
  return dispatch => {
    const {id, dayType} = options;

    const predictionDataUrl = `${DATA_URL}/predictions/${id}/data?day_type=${dayType}`
    const predictionConfigUrl = `${DATA_URL}/predictions/${id}/config`

    Promise.all([
      loadRemoteData(predictionDataUrl, userId),
      loadRemoteConfig(predictionConfigUrl, userId)
    ]).then(
      ([predictionData, predictionConfig]) => {
        const predictionId = "prediction";
        const predictionLabel = `${options.name} (${options.dayType}) - Prediction`;
        predictionConfig.config.visState.layers["0"].config.label = predictionLabel;
        predictionConfig.config.visState.layers["0"].config.dataId = predictionId;
        predictionConfig.config.visState.layers["0"].id = predictionId;

        dispatch(removeAllDatasets());
        dispatch(loadRemoteResourceSuccess(predictionData, predictionConfig, {
          ...options,
          "id": predictionId,
          "label": predictionLabel
        }, true));
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
                message: `${responseText} - ${LOADING_SAMPLE_ERROR_MESSAGE} ${options.id} (${predictionDataUrl})`
              },
              predictionConfigUrl
            )
          );
        }
      }
    );
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

async function fetchConfigurations(dispatch, userId, getSamples, loadSamples) {
  const samplePromises = [dispatch(getSamples(true)).unwrap()];

  if (userId) {
    samplePromises.push(dispatch(getSamples(false)).unwrap());
  }

  const allSamples = (await Promise.all(samplePromises)).flat();
  dispatch(loadSamples(allSamples));
}

export function loadSampleConfigurations(userId) {
  return async dispatch => {
    await fetchConfigurations(dispatch, userId, getScenarios, loadMapSampleFile);
  };
}

export function loadPredictionConfigurations(userId) {
  return async dispatch => {
    await fetchConfigurations(dispatch, userId, getPredictions, loadPredictionSampleFile);
  };
}
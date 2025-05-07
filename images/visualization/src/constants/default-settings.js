// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

export const DATA_URL = process.env.DATA_URL;

/**
 * I know this is already defined in Kepler core but it should be defined here
 * because it belongs to the demo app
 * @type {string}
 */
export const KEPLER_GL_WEBSITE = 'http://kepler.gl/';

export const LOADING_SAMPLE_ERROR_MESSAGE = 'Not able to load sample';

export const DEFAULT_FEATURE_FLAGS = {
  cloudStorage: true
};

export const CLOUD_PROVIDERS_CONFIGURATION = {
  MAPBOX_TOKEN: process.env.MapboxAccessToken, // eslint-disable-line
  DROPBOX_CLIENT_ID: process.env.DropboxClientId, // eslint-disable-line
  EXPORT_MAPBOX_TOKEN: process.env.MapboxExportToken, // eslint-disable-line
  CARTO_CLIENT_ID: process.env.CartoClientId, // eslint-disable-line
  FOURSQUARE_CLIENT_ID: process.env.FoursquareClientId, // eslint-disable-line
  FOURSQUARE_DOMAIN: process.env.FoursquareDomain, // eslint-disable-line
  FOURSQUARE_API_URL: process.env.FoursquareAPIURL, // eslint-disable-line
  FOURSQUARE_USER_MAPS_URL: process.env.FoursquareUserMapsURL // eslint-disable-line
};

export const KEYCLOAK_CONFIGURATION = {
  KEYCLOAK_AUTHORITY: process.env.REACT_APP_KEYCLOAK_AUTHORITY,
  KEYCLOAK_CLIENT_ID: process.env.REACT_APP_KEYCLOAK_CLIENT_ID,
}


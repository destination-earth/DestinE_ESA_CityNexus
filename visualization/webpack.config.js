// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

// NOTE: To use this example standalone (e.g. outside of deck.gl repo)
// delete the local development overrides at the bottom of this file

// avoid destructuring for older Node version support
const resolve = require("path").resolve;
const join = require("path").join;
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");
const HWP = require("html-webpack-plugin");

const ENV_VARIABLES_WITH_INSTRUCTIONS = {
  MapboxAccessToken: "You can get the token at https://www.mapbox.com/help/how-access-tokens-work/",
  DropboxClientId: "You can get the token at https://www.dropbox.com/developers",
  CartoClientId: "You can get the token at https://www.mapbox.com/help/how-access-tokens-work/",
  MapboxExportToken: "You can get the token at https://location.foursquare.com/developer",
  FoursquareClientId: "You can get the token at https://location.foursquare.com/developer",
  FoursquareDomain: "You can get the token at https://location.foursquare.com/developer",
  FoursquareAPIURL: "You can get the token at https://location.foursquare.com/developer",
  FoursquareUserMapsURL: "You can get the token at https://location.foursquare.com/developer",
};

const WEBPACK_ENV_VARIABLES = Object.keys(ENV_VARIABLES_WITH_INSTRUCTIONS).reduce(
  (acc, key) => ({
    ...acc,
    [key]: null,
  }),
  {}
);

const CONFIG = {
  entry: {
    app: resolve("./src/main.js"),
  },
  output: {
    path: resolve(__dirname, "build"),
    filename: "bundle.js",
    publicPath: "/",
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
      assert: false,
      path: false,
    }
  },

  devtool: "source-map",

  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        loader: "babel-loader",
        include: [join(__dirname, "src")],
        exclude: [/node_modules/],
      },
      // fix for arrow-related errors
      {
        test: /\.(mjs)$/,
        loader: "babel-loader",
        include: /node_modules/,
        type: "javascript/auto",
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      }
    ],
  },

  // to support browser history api and remove the '#' sign
  devServer: {
    historyApiFallback: true,
  },

  // Optional: Enables reading mapbox and dropbox client token from environment variable
  plugins: [
    new Dotenv(),
    new webpack.EnvironmentPlugin(WEBPACK_ENV_VARIABLES),
    new HWP({ template: join(__dirname, "/index.html") }),
  ],
};

// This line enables bundling against src in this repo rather than installed kepler.gl module
module.exports = (env) => {
  return env ? require("../webpack.config.local")(CONFIG, __dirname)(env) : CONFIG;
};

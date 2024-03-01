// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import {combineReducers, createStore, applyMiddleware, compose, Reducer, CombinedState} from 'redux';
import {routerReducer, routerMiddleware} from 'react-router-redux';
import {browserHistory, } from 'react-router';
import {KeplerGlState, enhanceReduxMiddleware} from '@kepler.gl/reducers';
import thunk from 'redux-thunk';
// eslint-disable-next-line no-unused-vars
import window from 'global/window';

import demoReducer, { AppState } from './reducers/index';

export type StoreData = {
  app: AppState;
  keplerGl: KeplerGlStates;
};

export type KeplerGlStates = {
  map: KeplerGlState;
};

const reducers = combineReducers({
  demo: demoReducer,
  routing: routerReducer
});

export const middlewares = enhanceReduxMiddleware([thunk, routerMiddleware(browserHistory)]);

export const enhancers = [applyMiddleware(...middlewares)];

const initialState = {};

// eslint-disable-next-line prefer-const
let composeEnhancers = compose;

/**
 * comment out code below to enable Redux Devtools
 */
// console.log(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__);
if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
  composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    actionsBlacklist: [
      '@@kepler.gl/MOUSE_MOVE',
      '@@kepler.gl/UPDATE_MAP',
      '@@kepler.gl/LAYER_HOVER'
    ]
  });
}

export default createStore(reducers, initialState, composeEnhancers(...enhancers));

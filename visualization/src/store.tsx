import {routerReducer, routerMiddleware} from 'react-router-redux';
import {browserHistory, } from 'react-router';
import {enhanceReduxMiddleware, KeplerGlState} from '@kepler.gl/reducers';
import demoReducer, { AppState } from './reducers/index';
import {configureStore} from "@reduxjs/toolkit";
import userReducer from "components/user/userSlice"

export type StoreData = {
  app: AppState;
  demo: DemoAppState;
};

export type DemoAppState = {
  keplerGl: KeplerGlState
}

const actionSanitizer = (action) => {
  return action.type.startsWith('@@kepler.gl') && action.payload ?
      {...action, payload: '<< OMITTED FOR PERFORMANCE REASONS >>'} : action
};

const stateSanitizer = (state) => {
  const demo = ((state.demo && state.demo.keplerGl) ? {...state.demo, keplerGl: '<< KEPLER.GL MAP DATA - OMITTED FOR PERFORMANCE REASONS >>'} : {});
  return state.demo ? { ...state, demo: demo } : state
}

export default configureStore({
  reducer: {
    demo: demoReducer,
    routing: routerReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) => {
    const middlewares = enhanceReduxMiddleware([routerMiddleware(browserHistory)])
    return getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
      actionCreatorCheck: false,
    }).concat(middlewares);
  },
  devTools: {
    actionsDenylist: [
      '@@kepler.gl/MOUSE_MOVE',
      '@@kepler.gl/UPDATE_MAP',
      '@@kepler.gl/LAYER_HOVER'
    ],
    actionSanitizer: actionSanitizer,
    stateSanitizer: stateSanitizer,
  }
});

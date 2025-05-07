import {routerReducer, routerMiddleware} from 'react-router-redux';
import {browserHistory, } from 'react-router';
import {enhanceReduxMiddleware, KeplerGlState} from '@kepler.gl/reducers';
import demoReducer, { AppState } from './reducers/index';
import {configureStore} from "@reduxjs/toolkit";
import userReducer from "./features/user/userSlice";
import simulationReducer from "./features/simulations/store/simulationSlice";
import colorMapperReducer from "./features/color-mapper/ColorMapperReducer";
import configureVisualizationReducer from "./features/visualization-manager/store/ConfigureVisualizationSlice"
import multipleSimulationsReducer from "./features/multiple-simulations/store/MultipleSimulationsReducer";

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

const store = configureStore({
  reducer: {
    demo: demoReducer,
    routing: routerReducer,
    user: userReducer,
    simulation: simulationReducer,
    visualization: configureVisualizationReducer,
    colorMapper: colorMapperReducer,
    multipleSimulations: multipleSimulationsReducer
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

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>

export default store;

import { createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {ApiFactory} from "../../../services/api/ApiFactory";


export const isPredictionNameUsed = createAsyncThunk('simulation/isPredictionNameUsed', async (name: string, thunkAPI) => {
    const api = ApiFactory.build(thunkAPI.getState());
    return api.isPredictionNameUsed(name);
});

export const isScenarioNameUsed = createAsyncThunk('simulation/isScenarioNameUsed', async (name: string, thunkAPI) => {
    const api = ApiFactory.build(thunkAPI.getState());
    return api.isScenarioNameUsed(name);
});

export const createPrediction = createAsyncThunk('simulation/createPrediction', async (data: any, thunkAPI) => {
    const api = ApiFactory.build(thunkAPI.getState());
    return api.createPrediction(data.name, data.simulationInputs);
});

export const createScenario = createAsyncThunk('simulation/createScenario', async (data: any, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const api = ApiFactory.build(state);
    const changesToSave = state.undoRedo.changes;
    return api.createScenario(data.name, data.project, {description: data.description, data: changesToSave});
});

export const getPredictions = createAsyncThunk('simulation/getPredictions', async (isGuestUser: boolean, thunkAPI) => {
    const api = ApiFactory.build(thunkAPI.getState());
    return api.getPredictions(isGuestUser);
});

export const getScenarios = createAsyncThunk('simulation/getScenarios', async (isGuestUser: boolean, thunkAPI) => {
    const api = ApiFactory.build(thunkAPI.getState());
    return api.getScenarios(isGuestUser);
});

export const updateScenario = createAsyncThunk('simulation/updateScenario', async (name: string, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const api = ApiFactory.build(state);

    if (!name) {
        name = state.undoRedo.changes.scenarioName;
    }

    const changesToSave = state.undoRedo.changes;
    const scenarioId = state.undoRedo.changes.scenarioId;
    return api.updateScenario(scenarioId, name, changesToSave);
});

export const simulationSlice = createSlice({
    name: "simulation",
    initialState: {
        simulationConfigModalIsOpen: false,
        scenarioCreateModalIsOpen: false,
        status: 'idle',
        inputs: {},
        error: null,
    },
    reducers: {
        openSimulationConfigModal: (state) => {
            state.simulationConfigModalIsOpen = true;
            return state;
        },
        openScenarioCreateModal: (state) => {
            state.scenarioCreateModalIsOpen = true;
            return state;
        },
        closeSimulationConfigModal: (state) => {
            state.simulationConfigModalIsOpen = false;
            return state;
        },
        closeScenarioCreateModal: (state) => {
            state.scenarioCreateModalIsOpen = false;
            return state;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createScenario.pending, (state, action) => {
                state.status = 'busy';
            })
            .addCase(createScenario.fulfilled, (state, action) => {
                state.status = 'idle';
            })
            .addCase(createScenario.rejected, (state, action) => {
                state.status = 'idle';
                state.error = action.error;
            })
            .addCase(createPrediction.pending, (state, action) => {
                state.status = 'busy';
            })
            .addCase(createPrediction.fulfilled, (state, action) => {
                state.status = 'idle';
            })
            .addCase(createPrediction.rejected, (state, action) => {
                state.status = 'idle';
                state.error = action.error;
            })
    }
})

export const {
    openSimulationConfigModal,
    closeSimulationConfigModal,
    openScenarioCreateModal,
    closeScenarioCreateModal
} = simulationSlice.actions;

export default simulationSlice.reducer;

export const selectSimulationConfigModalState = state => state.simulation.simulationConfigModalIsOpen;
export const selectScenarioCreateModalState = state => state.simulation.scenarioCreateModalIsOpen;
export const selectModalStatus = state => state.simulation.status;

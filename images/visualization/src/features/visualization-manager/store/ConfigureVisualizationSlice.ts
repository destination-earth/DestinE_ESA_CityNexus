import { createSlice} from "@reduxjs/toolkit";

export const configureVisualizationSlice = createSlice({
    name: "visualization",
    initialState: {
        configureVisualizationModalIsOpen: false,
        inputs: {},
        error: null,
    },
    reducers: {
        openConfigureVisualizationModal: (state) => {
            state.configureVisualizationModalIsOpen = true;
            return state;
        },
        closeConfigureVisualizationModal: (state) => {
            state.configureVisualizationModalIsOpen = false;
            return state;
        },
    }
})

export const {
    openConfigureVisualizationModal,
    closeConfigureVisualizationModal
} = configureVisualizationSlice.actions;

export default configureVisualizationSlice.reducer;

export const selectConfigureVisualizationModalState = state => state.visualization.configureVisualizationModalIsOpen;
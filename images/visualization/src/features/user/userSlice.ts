import {createSlice} from "@reduxjs/toolkit";

type ProjectType = {
    project: string;
    paid: boolean;
};

const projectCityNexus: ProjectType = {
    project: 'citynexus',
    paid: false
};

const projectImmerseon: ProjectType = {
    project: 'immerseon',
    paid: false
};

export const projectNameToString = {
    'immerseon': 'Immerseon',
    'citynexus': 'CityNexus',
}

export const userSlice = createSlice({
    name: "user",
    initialState: {
        data: null,
        isAuthenticated: false,
        isLoading: true,
        hasChangedMap: false,
        isUserLoggingOff: false,
        selectedProject: projectCityNexus,
        availableCities: ["copenhagen"],
        selectedCityType: 0,
        isProjectImmerseon: false
    },
    reducers: {
        startLoading: (state, action) => {
            return {...state, data: null, isAuthenticated: false, isLoading: true};
        },
        login: (state, action) => {
            // Determine the selected project type based on the current URL
            const url = window.location.href; // Get the current URL

            const isImmerseon = url.includes('immerseon');
            return {
                ...state,
                data: action.payload,
                isAuthenticated: true,
                isLoading: false,
                selectedProject: isImmerseon ? projectImmerseon : projectCityNexus,
                isProjectImmerseon: isImmerseon
            };
        },
        logout: (state, action) => {
            return {
                ...state,
                data: null,
                selectedProject: projectCityNexus,
                selectedCityType: 0,
                availableCities: ["copenhagen"],
                isAuthenticated: false,
                isLoading: false
            };
        },
        setHasChangedMap: (state, action) => {
            return {...state, hasChangedMap: action.payload};
        },
        setSelectedCityType: (state, action) => {
            return {
                ...state,
                selectedCityType: action.payload,
            };
        },
        setAvailableCities: (state, action) => {
            return {
                ...state,
                availableCities: action.payload,
            };
        },
        loggingOff: (state, action) => {
            return {...state, isUserLoggingOff: true};
        },
    }
})

export const {
    login,
    logout,
    startLoading,
    setHasChangedMap,
    setSelectedCityType,
    setAvailableCities,
    loggingOff
} = userSlice.actions;

export default userSlice.reducer;

export const selectUserToken = state => state.user.data?.access_token;
export const selectUsername = state => state.user.data?.profile?.preferred_username ?? '';
export const selectAuthenticated = state => state.user.isAuthenticated;
export const selectIsLoading = state => state.user.isLoading;
export const selectHasChangedMap = state => state.user.hasChangedMap;
export const selectCurrentScenarioId = state => state?.demo?.keplerGl?.map?.visState?.changes?.scenarioId;
export const selectCurrentScenarioCity = state => state?.demo?.keplerGl?.map?.visState?.datasets?.road_network?.metadata?.city;
export const selectUserLoggingOff = state => state.user.isUserLoggingOff;
export const selectIsProjectImmerseon = state => state.user.isProjectImmerseon;
export const selectSelectedProject = state => state.user.selectedProject;
export const selectSelectedProjectTypeString = state => state.user.selectedProject.project;
export const selectSelectedProjectTypeFormattedString = state => projectNameToString[state.user.selectedProject.project];
export const selectAvailableCities = state => state.user.availableCities;
export const selectSelectedCityName = state => state.user.availableCities[state.user.selectedCityType];
export const selectSelectedCityType = state => state.user.selectedCityType;
export const selectScenarioId = state => state.demo.undoRedo.changes.scenarioId;

export const isDefaultScenario = state => {
    const scenarioId = selectScenarioId(state);
    const { availableCities, selectedProject } = state.user;

    const isAvailableCity = availableCities.some(city => scenarioId?.startsWith(city));
    const isProjectType = selectedProject.project === scenarioId;

    return isAvailableCity || isProjectType;
};
import {createSlice} from "@reduxjs/toolkit";

type ProjectType = {
    project: string;
    paid: boolean;
};

const defaultProjectType: ProjectType = {
    project: 'citynexus',
    paid: false
};

const possibleRoles = ["citynexus-free", "citynexus-paid", "immerseon-free", "immerseon-paid"]

export const roleToProjectName = {
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
        projectTypes: [defaultProjectType],
        selectedProjectType: 0
    },
    reducers: {
        startLoading: (state, action) => {
            return { ...state, data: null, isAuthenticated: false, isLoading: true };
        },
        login: (state, action) => {
            let projectTypes = [];
            const roles = action.payload.profile.roles?.filter(role => possibleRoles.includes(role));
            if (roles.length > 0) {
                for (const role of roles) {
                    const [project, plan] = role.split("-");
                    projectTypes.push({
                        "project": project,
                        "paid": plan === 'paid'
                    });
                }
            } else {
                projectTypes.push(defaultProjectType);
            }
            return { ...state, data: action.payload, projectTypes: projectTypes, selectedProjectType: 0, isAuthenticated: true, isLoading: false };
        },
        logout: (state, action) => {
            return { ...state, data: null, projectTypes: [defaultProjectType], selectedProjectType: 0, isAuthenticated: false, isLoading: false };
        },
        setHasChangedMap: (state, action) => {
            return { ...state, hasChangedMap: action.payload };
        }
    }
})

export const {
    login,
    logout,
    startLoading,
    setHasChangedMap
} = userSlice.actions;

export default userSlice.reducer;

export const selectUserToken = state => state.user.data?.access_token;
export const selectUsername = state => state.user.data?.profile?.preferred_username ?? '';
export const selectProjectTypes = state => state.user.projectTypes;
export const selectSelectedProjectType = state => state.user.selectedProjectType;
export const selectAuthenticated = state => state.user.isAuthenticated;
export const selectIsLoading = state => state.user.isLoading;
export const selectHasChangedMap = state => state.user.hasChangedMap;
export const selectCurrentScenarioId = state => state?.demo?.keplerGl?.map?.visState?.changes?.scenarioId;

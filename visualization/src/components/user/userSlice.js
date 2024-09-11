import {createSlice} from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: "user",
    initialState: {
        data: null,
        isAuthenticated: false,
    },
    reducers: {
        login: (state, action) => {
            return { data: action.payload, isAuthenticated: true };
        },
        logout: () => {
            return { data: null, isAuthenticated: false }
        }
    }
})

export const {login, logout} = userSlice.actions;

export default userSlice.reducer;

export const selectUserToken = state => state.user.data.access_token;
export const selectUsername = state => state.user.data.profile.preferred_username ?? '';
export const selectAuthenticated = state => state.user.isAuthenticated;

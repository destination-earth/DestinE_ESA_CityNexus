import {PanelAction} from "../panel-header/PanelAction";
import React from "react";
import {Icons} from "@kepler.gl/components";
import {hasAuthParams, useAuth} from "react-oidc-context";
import {useDispatch, useSelector} from "react-redux";
import {selectAuthenticated, startLoading, logout} from "./userSlice"

export function LoginPanelAction() {
    const auth = useAuth()
    const isAuthenticated = useSelector(selectAuthenticated)
    const dispatch = useDispatch();

    const item = {
        id: 'login',
        iconComponent: isAuthenticated ? Icons.Logout : Icons.Login,
        tooltip: isAuthenticated ? 'Logout' : 'Login',
        onClick: () => {
            if (isAuthenticated) {
                void auth.removeUser();
                dispatch(logout())
            } else if (!hasAuthParams() && !auth.activeNavigator && !auth.isLoading) {
                dispatch(startLoading());
                void auth.signinRedirect();
            } else {
                console.log('Authentication process already running.');
            }
        }
    }

    return (
        <PanelAction item={item} />
    );
}

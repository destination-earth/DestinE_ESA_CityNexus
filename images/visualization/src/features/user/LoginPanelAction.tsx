import {PanelAction} from "../../components/panel-header/PanelAction";
import React, {useEffect} from "react";
import {Icons} from "@kepler.gl/components";
import {hasAuthParams, useAuth} from "react-oidc-context";
import {useDispatch, useSelector} from "react-redux";
import {selectAuthenticated, startLoading, logout, loggingOff} from "./userSlice"

export function LoginPanelAction() {
    const auth = useAuth()
    const isAuthenticated = useSelector(selectAuthenticated)
    const dispatch = useDispatch();

    // hook our react logic to the DESP header authentication logic
    useEffect(() => {
        const loginDiv = document.getElementById('login-div');
        const logoutDiv = document.getElementById('logout-link');

        const handleLogin = () => {
            // Logic to handle login
            if (!isAuthenticated) {
                dispatch(startLoading());
                void auth.signinRedirect();
            }
        };

        const handleLogout = () => {
            // Logic to handle logout
            if (isAuthenticated) {
                dispatch(loggingOff(auth.user));
                dispatch(logout(auth.user));
                auth.removeUser().then(() => {
                  void auth.signoutRedirect({
                    id_token_hint: auth.user.id_token,
                    post_logout_redirect_uri: window.location.href
                  });
                });
            }
        };

        if (loginDiv) loginDiv.addEventListener('click', handleLogin);
        if (logoutDiv) logoutDiv.addEventListener('click', handleLogout);
        if (isAuthenticated && loginDiv) loginDiv.innerHTML = auth.user.profile.preferred_username;

        // Cleanup function to remove the event listeners
        return () => {
            if (loginDiv) loginDiv.removeEventListener('click', handleLogin);
            if (logoutDiv) logoutDiv.removeEventListener('click', handleLogout);
        };
    }, [isAuthenticated, auth.user, dispatch]); // Add dependencies here

    const item = {
        id: 'login',
        iconComponent: isAuthenticated ? Icons.Logout : Icons.Login,
        tooltip: isAuthenticated ? 'Logout' : 'Login',
        onClick: () => {
            if (isAuthenticated) {
              dispatch(loggingOff(auth.user))
              dispatch(logout(auth.user))
              auth
                .removeUser()
                .then(() => {
                  void auth.signoutRedirect({
                    id_token_hint: auth.user.id_token,
                    post_logout_redirect_uri: window.location.href
                  });
                });
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

// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

import React from "react";
import ReactDOM from "react-dom/client";
import document from "global/document";
import {Provider} from "react-redux";
import {browserHistory, Route, Router} from "react-router";
import {syncHistoryWithStore} from "react-router-redux";
import store from "./store";
import App from "./app";
import {buildAppRoutes} from "./utils/routes";
import {AuthProvider} from "react-oidc-context";
import {UserManager} from "oidc-client-ts";
import {KEYCLOAK_CONFIGURATION} from "./constants/default-settings";
import {GenericErrorPage} from "./components/error/GenericErrorPage";

const history = syncHistoryWithStore(browserHistory, store);

const userManager = new UserManager({
    authority: KEYCLOAK_CONFIGURATION.KEYCLOAK_AUTHORITY,
    client_id: KEYCLOAK_CONFIGURATION.KEYCLOAK_CLIENT_ID,
    redirect_uri: `${window.location.origin}${window.location.pathname}`,
});

export const onSigninCallback = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
};

const appRoute = buildAppRoutes(App);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <AuthProvider userManager={userManager} onSigninCallback={onSigninCallback}>
        <Provider store={store}>
            <Router history={history}>
                <Route path="/" component={App}>
                    {appRoute}
                </Route>
                <Route path="/error" component={GenericErrorPage} />
            </Router>
        </Provider>
    </AuthProvider>
);

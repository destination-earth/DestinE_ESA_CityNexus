import React, {useEffect} from 'react';
import {useAuth} from 'react-oidc-context';
import {useDispatch, useSelector} from "react-redux";
import {login, selectIsLoading, selectUserLoggingOff, startLoading} from "./userSlice";
import {push} from 'react-router-redux';
import {ApplicationLoading} from "../../components/ApplicationLoading";

const UserProvider = (props) => {
    const {children} = props;
    const auth = useAuth();
    const dispatch = useDispatch();
    const isLoggingOff = useSelector(selectUserLoggingOff);
    const isLoading = useSelector(selectIsLoading);

    /**
     * Do auto sign in.
     *
     * See {@link https://github.com/authts/react-oidc-context?tab=readme-ov-file#automatic-sign-in}
     */
    useEffect(() => {
        if (!auth.isLoading) {
            if (auth.isAuthenticated) {
                dispatch(login(auth.user));
            } else if (auth.error) {
                if (auth.error.message.includes('No matching state found in storage')) {
                    // Clear any stale state and restart the auth flow
                    void auth.clearStaleState();
                    dispatch(startLoading());
                    void auth.signinRedirect();
                    return;
                }
                console.error('Error attempting to authenticate: ', auth.error);
                dispatch(push('/error'))
            } else if(!auth.isAuthenticated && !isLoggingOff) {
                dispatch(startLoading());
                void auth.signinRedirect();
            }
        }
    }, [auth]);

    if (isLoading === false) {
        return (
            <>{children}</>
        );
    }
    return (<ApplicationLoading />);
};

export default UserProvider;

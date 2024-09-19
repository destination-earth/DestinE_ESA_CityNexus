import React, {useEffect} from 'react';
import {useAuth} from 'react-oidc-context';
import {useDispatch, useSelector} from "react-redux";
import {login, logout, selectIsLoading} from "./userSlice";
import {push} from 'react-router-redux';
import {ApplicationLoading} from "../ApplicationLoading";

const UserProvider = (props) => {
    const {children} = props;
    const auth = useAuth();
    const dispatch = useDispatch();
    const isLoading = useSelector(selectIsLoading)

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
                console.error('Error attempting to authenticate.', auth.error);
                dispatch(push('/error'))
            } else {
                dispatch(logout())
                console.log('Not authenticated.');
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

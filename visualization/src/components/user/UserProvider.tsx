import React, {useEffect} from 'react';
import {useAuth} from 'react-oidc-context';
import {useDispatch} from "react-redux";
import {login} from "./userSlice";

const UserProvider = (props) => {
    const {children} = props;
    const auth = useAuth();
    const dispatch = useDispatch();

    /**
     * Do auto sign in.
     *
     * See {@link https://github.com/authts/react-oidc-context?tab=readme-ov-file#automatic-sign-in}
     */
    useEffect(() => {
        if (auth.isAuthenticated) {
            dispatch(login(auth.user));
        } else if (auth.error) {
            console.error('Error attempting to authenticate.', auth.error);
        } else {
            console.log('Not authenticated.');
        }
    }, [auth]);

    return (
        <>{children}</>
    );
};

export default UserProvider;

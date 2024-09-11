import React, {useEffect, useState} from 'react';
import {hasAuthParams, useAuth} from 'react-oidc-context';

const ProtectedApp = (props) => {
    const {children} = props;

    const auth = useAuth();
    const [hasTriedSignin, setHasTriedSignin] = useState(false);

    const login = (user) => {
        console.log(user);
    }

    /**
     * Do auto sign in.
     *
     * See {@link https://github.com/authts/react-oidc-context?tab=readme-ov-file#automatic-sign-in}
     */
    useEffect(() => {
        if (auth.isAuthenticated) {
            login(auth.user);
        } else {
            if (!hasAuthParams() && !auth.activeNavigator && !auth.isLoading && !hasTriedSignin) {
                void auth.signinRedirect();
                setHasTriedSignin(true);
            } else if (auth.error) {
                console.error('Error attempting to authenticate.', auth.error);
            } else {
                console.log('Authenticating...')
            }
        }

    }, [auth, hasTriedSignin]);

    return (
        <>{children}</>
    );
};

export default ProtectedApp;

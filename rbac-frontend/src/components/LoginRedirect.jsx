// LoginRedirect.jsx
import React from 'react';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';

const SUPERADMIN_EMAIL = "superadmin@example.com";

const LoginRedirect = () => {
    const { user } = useUser();

    const getRolePath = () => {
        if (!user) return "/";
        if (user.emailAddresses[0].emailAddress === SUPERADMIN_EMAIL) return "/dashboard/superadmin";
        if (user.publicMetadata.role === "admin") return "/dashboard/admin";
        return "/dashboard/member";
    };

    return (
        <>
            <SignedIn>
                {user ? <Navigate to={getRolePath()} /> : null}
            </SignedIn>
            <SignedOut>
                <LoginPage />
            </SignedOut>
        </>
    );
};

export default LoginRedirect;

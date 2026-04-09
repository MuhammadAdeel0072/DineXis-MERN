import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock User Data
const MOCK_USER = {
    id: 'user_mock_123',
    firstName: 'Zarar',
    lastName: 'Ahmed',
    fullName: 'Zarar Ahmed',
    primaryEmailAddress: { emailAddress: 'zarar.rider@ak7rest.com' },
    imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
    publicMetadata: {
        role: 'rider'
    },
    primaryPhoneNumber: '+92 300 7654321'
};

const AuthContext = createContext();

export const useUser = () => {
    const context = useContext(AuthContext);
    return {
        user: context?.user || MOCK_USER,
        isLoaded: true,
        isSignedIn: true
    };
};

export const SignedIn = ({ children }) => {
    const { isSignedIn } = useUser();
    return isSignedIn ? <>{children}</> : null;
};

export const SignedOut = ({ children }) => {
    const { isSignedIn } = useUser();
    return !isSignedIn ? <>{children}</> : null;
};

export const RedirectToSignIn = () => {
    useEffect(() => {
        console.log('Mock Redirect to Sign In');
    }, []);
    return <div className="text-white p-10 text-center uppercase tracking-widest text-[10px] font-bold">Base Authorization Required (Mock Sync)</div>;
};

export const SignOutButton = ({ children }) => {
    return (
        <div onClick={() => console.log('Mock Sign Out Clicked')}>
            {children}
        </div>
    );
};

export const ClerkProvider = ({ children }) => {
    return (
        <AuthContext.Provider value={{ user: MOCK_USER }}>
            {children}
        </AuthContext.Provider>
    );
};

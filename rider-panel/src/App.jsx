import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from './mockAuth';
import RiderLayout from './components/RiderLayout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import { RiderProvider } from './context/RiderContext';

const AuthGuard = ({ children }) => {
    const { user, isLoaded } = useUser();
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        if (isLoaded && user) {
            const role = user.publicMetadata?.role;
            if (role === 'rider' || role === 'admin') {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        }
    }, [isLoaded, user]);

    if (!isLoaded || isAuthorized === null) return (
        <div className="h-screen w-full flex items-center justify-center bg-charcoal">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (isAuthorized === false) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-charcoal text-white p-6 text-center">
                <h2 className="text-3xl font-serif font-black text-crimson mb-4 uppercase tracking-tighter italic">Access Restricted</h2>
                <p className="text-soft-white/60 max-w-sm mb-8 font-bold text-[10px] uppercase tracking-widest leading-loose">
                    Authentication Failure: This terminal is restricted to authorized logistic personnel.
                </p>
                <button 
                  className="px-8 py-3 bg-gold text-charcoal rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-gold/20"
                  onClick={() => window.location.href = '/'}
                >
                  Return to Base
                </button>
            </div>
        );
    }

    return children;
};

function App() {
    return (
        <Routes>
            <Route path="/" element={
                <SignedIn>
                    <AuthGuard>
                        <RiderProvider>
                            <RiderLayout />
                        </RiderProvider>
                    </AuthGuard>
                </SignedIn>
            }>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={
                <SignedOut>
                    <RedirectToSignIn />
                </SignedOut>
            } />
        </Routes>
    );
}

export default App;

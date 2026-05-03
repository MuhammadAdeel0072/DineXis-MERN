import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('dinexis_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [isLoaded, setIsLoaded] = useState(!localStorage.getItem('dinexis_token'));

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/profile');
            setUser(data);
            localStorage.setItem('dinexis_user', JSON.stringify(data));
        } catch (error) {
            console.error('Auth verification failed:', error);
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('dinexis_token');
                localStorage.removeItem('dinexis_user');
                setUser(null);
            }
            // For other errors (network issues), we keep the cached user
        } finally {
            setIsLoaded(true);
        }
    };

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            if (data.role !== 'chef' && data.role !== 'admin') {
                toast.error('Access denied. This panel is for chefs only.');
                return;
            }
            localStorage.setItem('dinexis_token', data.token);
            localStorage.setItem('dinexis_user', JSON.stringify(data));
            setUser(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed. Please try again.');
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('dinexis_token');
        localStorage.removeItem('dinexis_user');
        setUser(null);
        toast.success('Logged out successfully.');
    };

    useEffect(() => {
        const token = localStorage.getItem('dinexis_token');
        if (token) {
            fetchProfile();
        } else {
            setIsLoaded(true);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoaded, isSignedIn: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

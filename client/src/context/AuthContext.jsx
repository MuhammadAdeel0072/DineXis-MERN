import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../services/userService';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('dinexis_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(!localStorage.getItem('dinexis_user'));
  const [isSignedIn, setIsSignedIn] = useState(!!localStorage.getItem('dinexis_token'));

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('dinexis_token');
    const cachedUser = localStorage.getItem('dinexis_user');

    if (token) {
      // If we have a user cached, we can show the UI immediately and refresh in background
      // If no user cached, we must show loading while we fetch
      if (!cachedUser) {
        setLoading(true);
      }
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile();
      setUser(data);
      setIsSignedIn(true);
      localStorage.setItem('dinexis_user', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      if (error.response && error.response.status === 401) {
        handleAuthFailure();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuthFailure = () => {
    localStorage.removeItem('dinexis_token');
    localStorage.removeItem('dinexis_user');
    setUser(null);
    setIsSignedIn(false);
  };

  // Email OTP: Send OTP to email address
  const sendOTP = async (email) => {
    try {
      const { data } = await apiClient.post('/auth/send-otp', { email });
      toast.success('OTP sent to your email!');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
      throw error;
    }
  };

  // Email OTP: Verify OTP and authenticate
  const verifyOTP = async (email, otp) => {
    try {
      setLoading(true);
      const { data } = await apiClient.post('/auth/verify-otp', { email, otp });
      
      // Persist Session
      localStorage.setItem('dinexis_token', data.token);
      localStorage.setItem('dinexis_user', JSON.stringify(data));
      
      setUser(data);
      setIsSignedIn(true);
      toast.success(`Welcome${data.firstName && data.firstName !== 'User' ? `, ${data.firstName}` : ''}! 🎉`);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Email login (kept for backward compatibility with admin/chef/rider)
  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data } = await apiClient.post('/auth/login', { email, password });
      
      // Persist Session
      localStorage.setItem('dinexis_token', data.token);
      localStorage.setItem('dinexis_user', JSON.stringify(data));
      
      setUser(data);
      setIsSignedIn(true);
      toast.success(`Welcome back, ${data.firstName}!`);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      if (message && typeof message === 'string') {
        toast.error(message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Email register (kept for backward compatibility)
  const register = async (userData) => {
    try {
      setLoading(true);
      const { data } = await apiClient.post('/auth/register', userData);
      
      // Persist Session
      localStorage.setItem('dinexis_token', data.token);
      localStorage.setItem('dinexis_user', JSON.stringify(data));
      
      setUser(data);
      setIsSignedIn(true);
      toast.success('Account created successfully!');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      if (message && typeof message === 'string') {
        toast.error(message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('dinexis_token');
    localStorage.removeItem('dinexis_user');
    setUser(null);
    setIsSignedIn(false);
    toast.success('Logged out successfully');
  };

  const forgotPassword = async (email) => {
    try {
      const { data } = await apiClient.post('/auth/forgot-password', { email });
      toast.success('OTP sent! Check server logs.');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
      throw error;
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const { data } = await apiClient.post('/auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset successfully!');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Reset failed';
      toast.error(message);
      throw error;
    }
  };

  const updateProfile = async (data) => {
    try {
      const updated = await updateUserProfile(data);
      setUser(updated);
      localStorage.setItem('dinexis_user', JSON.stringify(updated));
      toast.success('Profile updated successfully');
      return updated;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update profile';
      if (message && typeof message === 'string') {
        toast.error(message);
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile: user,
      loading, 
      isSignedIn, 
      sendOTP,
      verifyOTP,
      login, 
      logout,
      register,
      updateProfile, 
      forgotPassword,
      resetPassword,
      refreshProfile: fetchProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
// Alias for backward compatibility
export const useProfile = () => useContext(AuthContext);

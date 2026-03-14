import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { setupInterceptors } from '../services/apiClient';
import toast from 'react-hot-toast';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Setup API interceptors with Clerk token
  useEffect(() => {
    setupInterceptors(getToken);
  }, [getToken]);

  const fetchProfile = async (retryCount = 0) => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      // If 404 and we haven't retried too many times, wait and try again
      // This helps if the webhook is still creating the user document
      if (error.response?.status === 404 && retryCount < 3) {
        console.log(`Retrying profile fetch... attempt ${retryCount + 1}`);
        setTimeout(() => fetchProfile(retryCount + 1), 3000);
      }
    } finally {
      if (retryCount === 0 || profile) { // Only stop loading if we're done retrying or have data
          setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (clerkLoaded && isSignedIn) {
      fetchProfile();
    } else if (clerkLoaded && !isSignedIn) {
      setProfile(null);
      setLoading(false);
    }
  }, [clerkLoaded, isSignedIn]);

  const updateProfile = async (data) => {
    try {
      const updated = await updateUserProfile(data);
      setProfile(updated);
      toast.success('Profile updated successfully');
      return updated;
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const toggleFavorite = async (productId) => {
    if (!profile) return;
    
    // Optimistic update logic could go here
    try {
        // Implementation in userService.js
    } catch (error) {
        toast.error('Action failed');
    }
  };

  return (
    <UserContext.Provider value={{ 
      profile, 
      loading: loading || !clerkLoaded, 
      isSignedIn, 
      updateProfile, 
      refreshProfile: fetchProfile 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useProfile = () => useContext(UserContext);

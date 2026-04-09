import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getUserProfile, updateUserProfile, syncUser } from '../services/userService';
import toast from 'react-hot-toast';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
    if (clerkLoaded && isSignedIn && clerkUser) {
      // Auto-sync the Clerk user into MongoDB (upsert) before fetching profile.
      // This is the fallback for when the Clerk webhook hasn't run (e.g. local dev).
      syncUser({
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        avatar: clerkUser.imageUrl || '',
      })
        .then(() => fetchProfile())
        .catch(() => fetchProfile()); // Still try to fetch even if sync fails
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

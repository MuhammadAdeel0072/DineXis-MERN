import apiClient from './apiClient';

export const getUserProfile = async () => {
  const response = await apiClient.get('/auth/profile');
  return response.data;
};

export const syncUser = async (userData) => {
  const response = await apiClient.post('/auth/sync', userData);
  return response.data;
};

export const updateUserProfile = async (userData) => {
  const response = await apiClient.put('/auth/profile', userData);
  return response.data;
};

export const addFavorite = async (productId) => {
  const response = await apiClient.post(`/users/favorites/${productId}`);
  return response.data;
};

export const removeFavorite = async (productId) => {
  const response = await apiClient.delete(`/users/favorites/${productId}`);
  return response.data;
};

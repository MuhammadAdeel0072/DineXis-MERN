import apiClient from './apiClient';

export const getLoyaltyProfile = async () => {
  const response = await apiClient.get('/loyalty/profile');
  return response.data;
};

export const getLoyaltyTransactions = async () => {
  const response = await apiClient.get('/loyalty/transactions');
  return response.data;
};

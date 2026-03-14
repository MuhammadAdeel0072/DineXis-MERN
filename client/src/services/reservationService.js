import apiClient from './apiClient';

export const createReservation = async (reservationData) => {
  const response = await apiClient.post('/reservations', reservationData);
  return response.data;
};

export const getMyReservations = async () => {
  const response = await apiClient.get('/reservations/my');
  return response.data;
};

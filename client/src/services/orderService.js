import apiClient from './apiClient';

export const createOrder = async (orderData) => {
  const response = await apiClient.post('/orders', orderData);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await apiClient.get('/orders/myorders');
  return response.data;
};

export const getAllOrders = async () => {
  const response = await apiClient.get('/orders');
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await apiClient.put(`/orders/${id}/status`, { status });
  return response.data;
};

export const createPaymentIntent = async (amount) => {
    const response = await apiClient.post('/orders/payment-intent', { amount });
    return response.data;
};

export const getOrderReceiptUrl = (id) => {
    return `${import.meta.env.VITE_API_URL}/orders/${id}/receipt`;
};

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

export const getAvailableOrders = async () => {
    const { data } = await api.get('/rider/available');
    return data;
};

export const getMyOrders = async () => {
    const { data } = await api.get('/rider/my-orders');
    return data;
};

export const acceptOrder = async (orderId) => {
    const { data } = await api.patch('/rider/accept', { orderId });
    return data;
};

export const updateDeliveryStatus = async (orderId, status) => {
    const { data } = await api.patch('/rider/status', { orderId, status });
    return data;
};

export const updateLocationData = async (orderId, lat, lng) => {
    const { data } = await api.patch('/rider/location', { orderId, lat, lng });
    return data;
};

export const getRiderStats = async () => {
    const { data } = await api.get('/rider/stats');
    return data;
};

export default api;

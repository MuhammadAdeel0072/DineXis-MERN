import axios from 'axios';
import { io } from 'socket.io-client';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

export default api;

import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

export const joinRiders = () => {
  socket.emit('joinRider');
};

export const joinUser = (userId) => {
  socket.emit('join', userId);
};

export default socket;

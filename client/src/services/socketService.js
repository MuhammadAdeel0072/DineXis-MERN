import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false,
});

export const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.connect();
    socket.emit('join', userId);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const subscribeToOrderUpdates = (callback) => {
  socket.on('orderUpdate', callback);
};

export const unsubscribeFromOrderUpdates = () => {
  socket.off('orderUpdate');
};

export const subscribeToAdminActions = (callback) => {
  socket.on('adminAction', callback);
};

export const unsubscribeFromAdminActions = () => {
  socket.off('adminAction');
};

export default socket;

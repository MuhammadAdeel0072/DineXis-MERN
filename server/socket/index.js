const socketIO = require('socket.io');
const logger = require('../utils/logger');

const socketHandler = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // Join a room based on user ID for private notifications
    socket.on('join', (userId) => {
      socket.join(userId);
      logger.info(`Socket ${socket.id} joined room: ${userId}`);
    });

    // Join kitchen room for staff
    socket.on('joinKitchen', () => {
      socket.join('kitchen');
      logger.info(`Socket ${socket.id} joined kitchen room`);
    });

    // Order status update event
    socket.on('updateOrderStatus', (orderData) => {
      // orderData: { orderId, userId, status }
      io.to(orderData.userId).emit('orderUpdate', orderData);
      io.to('kitchen').emit('kitchenOrderUpdate', orderData);
      logger.info(`Order ${orderData.orderId} status updated to ${orderData.status}`);
    });

    // New order notification for kitchen
    socket.on('newOrder', (order) => {
      io.to('kitchen').emit('incomingOrder', order);
      logger.info(`New order received: ${order.orderNumber}`);
    });

    socket.on('disconnect', () => {
      logger.info('Client disconnected');
    });
  });

  return io;
};

module.exports = socketHandler;

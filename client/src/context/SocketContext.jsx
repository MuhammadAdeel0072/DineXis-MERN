import React, { createContext, useContext, useEffect, useState } from 'react';
import { useProfile } from './UserContext';
import { connectSocket, disconnectSocket, subscribeToOrderUpdates, unsubscribeFromOrderUpdates } from '../services/socketService';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { profile, isSignedIn } = useProfile();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isSignedIn && profile) {
      connectSocket(profile._id);

      subscribeToOrderUpdates((data) => {
        // data: { orderId, status, orderNumber }
        const message = `Order ${data.orderNumber} is now ${data.status}!`;
        
        toast.success(message, {
          duration: 6000,
          icon: '🥘',
          style: {
            background: '#1a1a1a',
            color: '#D4AF37',
            border: '1px solid #D4AF37',
          },
        });

        setNotifications((prev) => [{ ...data, message, timestamp: new Date() }, ...prev]);
      });

      return () => {
        unsubscribeFromOrderUpdates();
        disconnectSocket();
      };
    }
  }, [isSignedIn, profile]);

  return (
    <SocketContext.Provider value={{ notifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getAvailableOrders, getMyOrders, getRiderStats, updateLocationData as apiUpdateLocation } from '../services/api';
import socket, { joinRiders } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RiderContext = createContext();

export const useRider = () => {
    const context = useContext(RiderContext);
    if (!context) {
        throw new Error('useRider must be used within a RiderProvider');
    }
    return context;
};

export const RiderProvider = ({ children }) => {
    const { user } = useAuth();
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [activeOrder, setActiveOrder] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const locationInterval = useRef(null);

    const fetchData = useCallback(async () => {
        try {
            const [available, mine, currentStats] = await Promise.all([
                getAvailableOrders(),
                getMyOrders(),
                getRiderStats()
            ]);
            setAvailableOrders(available);
            setMyOrders(mine);
            setStats(currentStats);
            
            // Auto-detect active order
            const active = mine.find(o => ['ready', 'picked-up', 'out-for-delivery'].includes(o.status));
            setActiveOrder(active || null);
        } catch (error) {
            console.error("Failed to fetch rider data:", error);
        } finally {
            setLoading(false);
        }
    }, [getMyOrders, getAvailableOrders, getRiderStats]);

    useEffect(() => {
        if (user) {
            fetchData();
            joinRiders();

            // Handle New Orders
            const handleNewOrder = (order) => {
                setAvailableOrders(prev => [order, ...prev]);
                toast.success('New delivery available! 📦', {
                    duration: 5000,
                    style: { background: '#121212', color: '#D4AF37', border: '1px solid #D4AF37' }
                });
                // Sound alert could be added here
                const audio = new Audio('/notification.mp3');
                audio.play().catch(() => {});
            };

            // Handle Assignment
            const handleAssignment = (data) => {
                fetchData();
                if (data.status === 'out-for-delivery') {
                    toast.success('Course plotted: Delivery in progress.');
                }
            };

            socket.on('order:ready-for-delivery', handleNewOrder);
            socket.on('order:assigned-to-rider', handleAssignment);
            socket.on('orderUpdate', fetchData);

            return () => {
                socket.off('order:ready-for-delivery', handleNewOrder);
                socket.off('order:assigned-to-rider', handleAssignment);
                socket.off('orderUpdate', fetchData);
            };
        }
    }, [user, fetchData]);

    // Location Tracking Logic
    useEffect(() => {
        if (activeOrder && activeOrder.status === 'out-for-delivery') {
            const startTracking = () => {
                if ("geolocation" in navigator) {
                    locationInterval.current = setInterval(() => {
                        navigator.geolocation.getCurrentPosition(async (position) => {
                            const { latitude, longitude } = position.coords;
                            try {
                                await apiUpdateLocation(activeOrder._id, latitude, longitude);
                            } catch (err) {
                                console.error("Location leak blocked:", err);
                            }
                        });
                    }, 15000); // 15 seconds
                }
            };
            startTracking();
        } else {
            if (locationInterval.current) {
                clearInterval(locationInterval.current);
                locationInterval.current = null;
            }
        }

        return () => {
            if (locationInterval.current) clearInterval(locationInterval.current);
        };
    }, [activeOrder]);

    const value = {
        availableOrders,
        myOrders,
        activeOrder,
        stats,
        loading,
        refreshData: fetchData
    };

    return (
        <RiderContext.Provider value={value}>
            {children}
        </RiderContext.Provider>
    );
};

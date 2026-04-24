import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
    getAvailableOrders, 
    getMyOrders, 
    getRiderStats, 
    getNearbyOrders,
    claimOrder as apiClaimOrder,
    acceptOrder as apiAcceptOrder,
    pickupOrder as apiPickupOrder,
    arrivedAtDestination as apiArrivedOrder,
    confirmDelivery as apiDeliveredOrder,
    addToRoute as apiAddToRoute
} from '../services/api';
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
    const [nearbyOrders, setNearbyOrders] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(null);
    
    const refreshTimer = useRef(null);

    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            const [mine, currentStats] = await Promise.all([
                getMyOrders(),
                getRiderStats()
            ]);
            setMyOrders(mine);
            setStats(currentStats);

            // Fetch location-based data if location is available
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setLocation({ lat, lng });
                    const nearby = await getNearbyOrders(lat, lng);
                    setNearbyOrders(nearby);
                }, () => {
                    // Fallback to regular available orders if GPS denied
                    getAvailableOrders().then(setAvailableOrders);
                });
            } else {
                getAvailableOrders().then(setAvailableOrders);
            }
        } catch (error) {
            console.error("Failed to fetch rider data:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchData();
            joinRiders();

            // Background refresh every 30s
            refreshTimer.current = setInterval(fetchData, 30000);

            const handleRefresh = () => fetchData();

            socket.on('order:ready', (newOrder) => {
                fetchData();
                toast.success('New mission available nearby! 📦', {
                    duration: 6000,
                    style: { background: '#121212', color: '#D4AF37', border: '1px solid #D4AF37' }
                });
                const audio = new Audio('/notification.mp3');
                audio.play().catch(() => {});
            });
            
            socket.on('orderUpdate', handleRefresh);

            return () => {
                socket.off('order:ready');
                socket.off('orderUpdate');
                if (refreshTimer.current) clearInterval(refreshTimer.current);
            };
        }
    }, [user, fetchData]);

    // Workflow Actions
    const claim = async (id) => {
        const res = await apiClaimOrder(id);
        await fetchData();
        return res;
    };

    const accept = async (id) => {
        const res = await apiAcceptOrder(id);
        await fetchData();
        return res;
    };

    const pickup = async (id) => {
        const res = await apiPickupOrder(id);
        await fetchData();
        return res;
    };

    const arrive = async (id) => {
        const res = await apiArrivedOrder(id);
        await fetchData();
        return res;
    };

    const deliver = async (id) => {
        const res = await apiDeliveredOrder(id);
        await fetchData();
        return res;
    };

    const batchToRoute = async (id) => {
        const res = await apiAddToRoute(id);
        await fetchData();
        return res;
    };

    const value = {
        availableOrders: nearbyOrders.length > 0 ? nearbyOrders : availableOrders,
        nearbyOrders,
        myOrders,
        stats,
        loading,
        location,
        refreshData: fetchData,
        claim,
        accept,
        pickup,
        arrive,
        deliver,
        batchToRoute
    };

    return (
        <RiderContext.Provider value={value}>
            {children}
        </RiderContext.Provider>
    );
};

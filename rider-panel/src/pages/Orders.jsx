import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, ShoppingBag, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRider } from '../context/RiderContext';
import OrderCard from '../components/OrderCard';
import { updateDeliveryStatus, updateLocationData } from '../services/api';
import toast from 'react-hot-toast';

const Orders = () => {
    const { myOrders, availableOrders, loading, refreshData } = useRider();
    const [actionLoading, setActionLoading] = useState(false);
    const [tab, setTab] = useState('active'); // 'active' | 'available' | 'history'


    const handleAction = async (orderId, type) => {
        setActionLoading(true);
        const loadingToast = toast.loading(`Updating delivery status...`);
        try {
            await updateDeliveryStatus(orderId, type);
            toast.dismiss(loadingToast);
            const statusLabel = type === 'accepted' ? 'Accepted 🚴' : type === 'out-for-delivery' ? 'Out for Delivery 📦' : 'Delivered ✅';
            toast.success(`Delivery ${statusLabel}`);
            refreshData();
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || 'Failed to update order ❌');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const activeOrders = myOrders.filter(o => o.status !== 'delivered');
    const completedOrders = myOrders.filter(o => o.status === 'delivered');

    return (
        <div className="space-y-12 pb-20 max-w-5xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                   <h1 className="text-4xl font-serif font-black tracking-tighter mb-1 uppercase">
                       Delivery <span className="text-gold ml-1">Terminal</span>
                   </h1>
                   <p className="label-caps tracking-[0.25em]">Mission Control</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 self-start">
                    {['active', 'available', 'history'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                tab === t ? 'bg-gold text-charcoal shadow-lg shadow-gold/20' : 'text-white/40 hover:text-white'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </header>

            <div className="space-y-16">
                <AnimatePresence mode="wait">
                    {tab === 'active' && (
                        <motion.section
                            key="active"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <h2 className="label-caps text-gold/40 flex items-center gap-3 mb-8 border-l-2 border-gold/20 pl-4">
                               <Truck className="w-4 h-4" /> Current Active Mission
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {activeOrders.length === 0 ? (
                                    <div className="col-span-full py-20 card-premium border-dashed border-white/10 flex flex-col items-center justify-center text-center p-10">
                                        <ShoppingBag className="w-16 h-16 text-white/5 mx-auto mb-6" />
                                        <p className="label-caps opacity-40">No active orders found.</p>
                                    </div>
                                ) : (
                                    activeOrders.map((order) => (
                                        <OrderCard 
                                            key={order._id}
                                            order={order}
                                            onAction={handleAction}
                                            actionLoading={actionLoading}
                                        />
                                    ))
                                )}
                            </div>
                        </motion.section>
                    )}

                    {tab === 'available' && (
                        <motion.section
                            key="available"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <h2 className="label-caps text-gold/40 flex items-center gap-3 mb-8 border-l-2 border-gold/20 pl-4">
                               <ShoppingBag className="w-4 h-4" /> Available For Pickup
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {availableOrders.length === 0 ? (
                                    <div className="col-span-full py-20 card-premium border-dashed border-white/10 flex flex-col items-center justify-center text-center p-10">
                                        <Clock className="w-16 h-16 text-white/5 mx-auto mb-6" />
                                        <p className="label-caps opacity-40">Scanning for orders...</p>
                                    </div>
                                ) : (
                                    availableOrders.map((order) => (
                                        <OrderCard 
                                            key={order._id}
                                            order={order}
                                            onAction={handleAction}
                                            actionLoading={actionLoading}
                                            type="available"
                                        />
                                    ))
                                )}
                            </div>
                        </motion.section>
                    )}

                    {tab === 'history' && (
                        <motion.section
                            key="history"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <h2 className="label-caps text-soft-white/20 flex items-center gap-3 mb-8 border-l-2 border-white/5 pl-4">
                               <CheckCircle2 className="w-4 h-4" /> Mission History
                            </h2>
                            <div className="space-y-6">
                                {completedOrders.length === 0 ? (
                                    <p className="label-caps text-center py-10 opacity-20">No past deliveries found.</p>
                                ) : (
                                    completedOrders.map((order) => (
                                        <div key={order._id} className="card-premium p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center border border-white/5">
                                                    <CheckCircle2 className="w-6 h-6 text-green-500/40" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white tracking-widest leading-none mb-2">ORDER #{order._id.slice(-6).toUpperCase()}</h4>
                                                    <div className="flex items-center gap-4">
                                                        <p className="label-caps !tracking-widest opacity-40">{order.shippingAddress?.address || 'Delivered'}</p>
                                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                                        <p className="text-[10px] text-white/20 font-mono tracking-tighter uppercase line-clamp-1">{order._id}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-[10px] text-soft-white/20 font-bold uppercase tracking-widest mb-1">Delivered At</p>
                                                <p className="text-sm font-bold text-gold/40 tracking-wider font-mono uppercase">{new Date(order.deliveredAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Orders;

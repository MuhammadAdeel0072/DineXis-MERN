import React, { useState } from 'react';
import {
    LayoutDashboard,
    ShoppingBag,
    CheckCircle,
    AlertCircle,
    Zap,
    PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRider } from '../hooks/useRider';
import OrderCard from '../components/OrderCard';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { t } = useTranslation();
    const { 
        availableOrders, 
        myOrders, 
        stats, 
        loading, 
        refreshData,
        claim,
        accept,
        pickup,
        arrive,
        deliver,
        batchToRoute
    } = useRider();
    
    const [actionLoading, setActionLoading] = useState(false);

    // Filter active missions for the dashboard (Batch View)
    const activeOrders = myOrders.filter(o => ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'ARRIVED'].includes(o.status));

    // Smart Suggestions: Orders that are on the route of the current active missions
    const routeSuggestions = availableOrders.filter(o => o.onRoute);

    const handleAction = async (orderId, type) => {
        setActionLoading(true);
        const loadingToast = toast.loading(`Initiating protocol: ${type.toUpperCase()}...`);
        try {
            switch(type) {
                case 'claim': await claim(orderId); break;
                case 'batch': await batchToRoute(orderId); break;
                case 'accept': await accept(orderId); break;
                case 'pickup': await pickup(orderId); break;
                case 'arrive': await arrive(orderId); break;
                case 'deliver': await deliver(orderId); break;
                default: throw new Error("Invalid protocol type");
            }
            toast.dismiss(loadingToast);
            toast.success(`Mission ${type.toUpperCase()} complete! ✅`);
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || `Protocol failed: ${type.toUpperCase()} ❌`);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto px-4">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                <div>
                    <h1 className="text-4xl font-serif font-black tracking-tighter mb-1 uppercase">
                        Rider <span className="text-gold ml-1">Terminal</span>
                    </h1>
                    <p className="text-[10px] font-black tracking-[0.25em] text-soft-white/40 uppercase">Operational Mission Overview</p>
                </div>

                <div className="flex items-center gap-8 glass p-6 rounded-2xl border border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-soft-white/30 mb-1">Missions Success</span>
                        <span className="text-2xl font-serif font-black text-white tracking-tighter">{stats?.completedToday || 0} / {stats?.totalDeliveries || 0}</span>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gold/40 mb-1">Total Yield</span>
                        <span className="text-2xl font-serif font-black text-gold tracking-tighter">Rs. {(stats?.totalDeliveries || 0) * 100}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Active Delivery Section */}
                <section className="lg:col-span-7 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60 flex items-center gap-3">
                            <LayoutDashboard className="w-4 h-4" /> Current Active Mission
                        </h2>
                    </div>

                    <div className="min-h-[300px] space-y-4">
                        <AnimatePresence mode="popLayout">
                            {activeOrders.length > 0 ? (
                                activeOrders.map((order, index) => (
                                    <div key={order._id} className="relative">
                                        {activeOrders.length > 1 && (
                                            <div className="absolute -top-3 -left-3 z-10 w-8 h-8 rounded-full bg-gold text-charcoal flex items-center justify-center font-black text-sm shadow-lg border-2 border-charcoal">
                                                {order.sequenceNumber || index + 1}
                                            </div>
                                        )}
                                        <OrderCard
                                            order={order}
                                            onAction={handleAction}
                                            actionLoading={actionLoading}
                                        />
                                    </div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full glass rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-24"
                                >
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                                        <AlertCircle className="w-8 h-8 text-soft-white/5" />
                                    </div>
                                    <h3 className="text-xl font-serif text-white/20 uppercase tracking-widest leading-none">No Active Protocol</h3>
                                    <p className="text-[9px] text-soft-white/10 font-bold uppercase tracking-widest mt-4">Scan for new missions in the queue</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Smart Route Suggestions Overlay */}
                    <AnimatePresence>
                        {activeOrders.length > 0 && routeSuggestions.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass p-8 rounded-[2.5rem] border border-indigo-500/20 bg-indigo-500/5"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                            <Zap className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Route Optimized Pickup</h4>
                                            <p className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-widest">Nearby mission detected on your path</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                        +Rs. 100 Bonus
                                    </span>
                                </div>
                                
                                <div className="space-y-4">
                                    {routeSuggestions.slice(0, 1).map(suggestion => (
                                        <div key={suggestion._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                                                    <img src={suggestion.orderItems[0].image} className="w-full h-full object-cover" alt="food" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Order #{suggestion.orderNumber || suggestion._id.slice(-6)}</p>
                                                    <p className="text-[9px] font-bold text-soft-white/30 uppercase tracking-widest">{suggestion.shippingAddress.address}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleAction(suggestion._id, 'batch')}
                                                disabled={actionLoading}
                                                className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                                            >
                                                <PlusCircle size={14} /> Add to Route
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* Available Queue Section */}
                <section className="lg:col-span-5 space-y-6">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-soft-white/60 flex items-center gap-3">
                        <ShoppingBag className="w-4 h-4 text-gold" /> Available Missions
                    </h2>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
                        <AnimatePresence mode="popLayout">
                            {availableOrders.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-12 glass rounded-[2rem] border border-white/5 text-center"
                                >
                                    <CheckCircle className="w-12 h-12 text-gold/5 mx-auto mb-6" />
                                    <p className="text-[10px] text-soft-white/20 font-black uppercase tracking-widest leading-none">Scanning for new deployments...</p>
                                </motion.div>
                            ) : (
                                availableOrders.map((order) => (
                                    <div key={order._id} className="relative">
                                        {order.onRoute && (
                                            <div className="absolute -top-2 -right-2 z-10">
                                                <div className="bg-indigo-600 text-white text-[7px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-lg flex items-center gap-1">
                                                    <Zap size={8} /> On Route
                                                </div>
                                            </div>
                                        )}
                                        <OrderCard
                                            order={order}
                                            onAction={(id) => handleAction(id, order.onRoute ? 'batch' : 'claim')}
                                            actionLoading={actionLoading}
                                            customActionLabel={order.onRoute ? "Add to Route" : null}
                                        />
                                    </div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;

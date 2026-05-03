import React, { useState } from 'react';
import {
    LayoutDashboard,
    ShoppingBag,
    CheckCircle,
    AlertCircle,
    Zap,
    PlusCircle,
    Target,
    Trophy
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
        batchToRoute,
        routeInfo
    } = useRider();
    
    const [actionLoading, setActionLoading] = useState(false);

    // Filter active missions for the dashboard
    const activeOrders = myOrders.filter(o => ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'ARRIVED'].includes(o.status));

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
        <div className="space-y-10 pb-24 max-w-7xl mx-auto px-4 pt-6">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div>
                    <h1 className="text-5xl font-serif font-black tracking-tighter mb-2 uppercase leading-none">
                        Rider <span className="text-gold">Terminal</span>
                    </h1>
                    <p className="text-[10px] font-black tracking-[0.4em] text-white/20 uppercase">Tactical Deployment Center</p>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-6 glass p-6 rounded-3xl border border-white/5 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20">
                                <Target className="w-6 h-6 text-gold" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Missions</span>
                                <span className="text-2xl font-serif font-black text-white tracking-tighter">
                                    {stats?.completedToday || 0} / {stats?.totalDeliveries || 0}
                                </span>
                            </div>
                        </div>
                        <div className="w-px h-12 bg-white/5" />
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-near/10 flex items-center justify-center border border-near/20">
                                <Trophy className="w-6 h-6 text-near" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Yield</span>
                                <span className="text-2xl font-serif font-black text-near tracking-tighter">
                                    Rs. {(stats?.totalDeliveries || 0) * 100}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Active Delivery Section */}
                <section className="lg:col-span-7 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gold flex items-center gap-3">
                            <LayoutDashboard className="w-4 h-4" /> Active Deployments
                        </h2>
                        {activeOrders.length > 0 && (
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                                {routeInfo.totalDistance} KM Route
                            </span>
                        )}
                    </div>

                    <div className="min-h-[400px] space-y-8">
                        <AnimatePresence mode="popLayout">
                            {activeOrders.length > 0 ? (
                                activeOrders.map((order, index) => (
                                    <div key={order._id} className="relative">
                                        <div className="absolute -left-4 top-0 bottom-0 flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] shadow-xl z-10 border-2 ${
                                                index === 0 ? 'bg-gold text-charcoal border-white/20' : 'bg-white/5 text-white/30 border-white/5'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            {index < activeOrders.length - 1 && (
                                                <div className="flex-1 w-0.5 bg-gradient-to-b from-white/10 to-transparent my-2" />
                                            )}
                                        </div>
                                        <div className="pl-8">
                                            <OrderCard
                                                order={order}
                                                onAction={handleAction}
                                                actionLoading={actionLoading}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-[400px] glass rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-24"
                                >
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/5">
                                        <AlertCircle className="w-10 h-10 text-white/5" />
                                    </div>
                                    <h3 className="text-2xl font-serif text-white/20 uppercase tracking-[0.2em]">Idle Mode</h3>
                                    <p className="text-[10px] text-white/10 font-bold uppercase tracking-widest mt-4">Waiting for mission assignment...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Available Queue Section */}
                <section className="lg:col-span-5 space-y-8">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-3">
                        <ShoppingBag className="w-4 h-4 text-gold" /> Queue
                    </h2>

                    <div className="space-y-6 max-h-[800px] overflow-y-auto no-scrollbar pr-2">
                        <AnimatePresence mode="popLayout">
                            {availableOrders.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-16 glass rounded-[2.5rem] border border-white/5 text-center shadow-inner"
                                >
                                    <CheckCircle className="w-14 h-14 text-gold/5 mx-auto mb-8" />
                                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-none">Scanning frequencies...</p>
                                </motion.div>
                            ) : (
                                availableOrders.map((order) => (
                                    <div key={order._id} className="relative group">
                                        {order.onRoute && (
                                            <div className="absolute -top-3 -right-2 z-20">
                                                <div className="bg-near text-charcoal text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-1.5 border border-white/20">
                                                    <Zap size={10} className="fill-charcoal" /> On Route
                                                </div>
                                            </div>
                                        )}
                                        <OrderCard
                                            order={order}
                                            onAction={(id) => handleAction(id, order.onRoute ? 'batch' : 'claim')}
                                            actionLoading={actionLoading}
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


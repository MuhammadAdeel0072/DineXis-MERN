import React, { useState, useMemo } from 'react';
import { 
    Truck, 
    CheckCircle2, 
    ShoppingBag, 
    Clock, 
    MapPin, 
    Navigation, 
    Route as RouteIcon,
    AlertCircle,
    PlusCircle,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRider } from '../context/RiderContext';
import OrderCard from '../components/OrderCard';
import toast from 'react-hot-toast';

const Orders = () => {
    const { 
        myOrders, 
        availableOrders, 
        loading, 
        claim, 
        accept, 
        pickup, 
        arrive, 
        deliver,
        batchToRoute,
        location
    } = useRider();
    
    const [actionLoading, setActionLoading] = useState(false);
    const [tab, setTab] = useState('new'); // 'new' | 'active' | 'history'

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
            
            if (type === 'claim' || type === 'batch') setTab('active');
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || `Protocol failed: ${type.toUpperCase()} ❌`);
        } finally {
            setActionLoading(false);
        }
    };

    // Filter and Sort active orders by sequence
    const activeOrders = useMemo(() => {
        return myOrders
            .filter(o => o.status !== 'DELIVERED')
            .sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));
    }, [myOrders]);

    const completedOrders = myOrders.filter(o => o.status === 'DELIVERED');

    // Route Optimization Visualization Logic
    const openMultiStopRoute = () => {
        if (activeOrders.length === 0) return;
        
        const start = location ? `${location.lat},${location.lng}` : 'current+location';
        const stops = activeOrders.map(o => {
            if (o.shippingAddress.lat && o.shippingAddress.lng) {
                return `${o.shippingAddress.lat},${o.shippingAddress.lng}`;
            }
            return encodeURIComponent(o.shippingAddress.address);
        });

        const url = `https://www.google.com/maps/dir/${start}/${stops.join('/')}`;
        window.open(url, '_blank');
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-12 pb-20 max-w-6xl mx-auto px-4">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
                <div>
                   <h1 className="text-4xl font-serif font-black tracking-tighter mb-1 uppercase">
                       Mission <span className="text-gold ml-1">Terminal</span>
                   </h1>
                   <p className="text-[10px] font-black tracking-[0.3em] text-soft-white/40 uppercase">HCI Optimized Operational Interface</p>
                </div>

                <div className="flex bg-white/5 p-1.5 rounded-[2rem] border border-white/10 self-start lg:self-center backdrop-blur-xl">
                    {[
                        { id: 'new', label: 'New Deliveries', icon: ShoppingBag },
                        { id: 'active', label: 'Active Route', icon: RouteIcon },
                        { id: 'history', label: 'Archive', icon: CheckCircle2 }
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                tab === t.id ? 'bg-gold text-charcoal shadow-2xl shadow-gold/40 scale-105' : 'text-white/40 hover:text-white'
                            }`}
                        >
                            <t.icon className={`w-3.5 h-3.5 ${tab === t.id ? 'text-charcoal' : 'text-gold/40'}`} />
                            {t.label}
                        </button>
                    ))}
                </div>
            </header>

            <div className="space-y-16">
                <AnimatePresence mode="wait">
                    {tab === 'new' && (
                        <motion.section
                            key="new"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-gold flex items-center gap-3">
                                   <Zap className="w-4 h-4" /> Priority Deployment Queue
                                </h2>
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Sector: Islamabad</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {availableOrders.length === 0 ? (
                                    <div className="col-span-full py-24 glass rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-10">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                                            <ShoppingBag className="w-10 h-10 text-white/10" />
                                        </div>
                                        <h3 className="text-xl font-serif text-white/30 uppercase tracking-[0.2em]">Sector is Clear</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/10 mt-4">Scanning for new signals...</p>
                                    </div>
                                ) : (
                                    availableOrders.map((order) => (
                                        <div key={order._id} className="relative group">
                                            {/* Priority/On-Route Badges */}
                                            <div className="absolute -top-3 left-6 z-10 flex gap-2">
                                                {order.onRoute && (
                                                    <span className="bg-indigo-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
                                                        <PlusCircle size={10} /> On Your Route
                                                    </span>
                                                )}
                                                {order.priority === 'URGENT' && (
                                                    <span className="bg-crimson text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                                        Urgent Delivery
                                                    </span>
                                                )}
                                                <span className="bg-gold text-charcoal text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                                    {order.distance || '0'} KM Away
                                                </span>
                                            </div>

                                            <OrderCard 
                                                order={order}
                                                onAction={(id) => handleAction(id, order.onRoute ? 'batch' : 'claim')}
                                                actionLoading={actionLoading}
                                                customActionLabel={order.onRoute ? "Add to Route" : "Claim Mission"}
                                                isNearby={true}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.section>
                    )}

                    {tab === 'active' && (
                        <motion.section
                            key="active"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass p-8 rounded-[2.5rem] border border-gold/10 bg-gold/5 mb-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20">
                                        <RouteIcon className="w-8 h-8 text-gold" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-serif font-black text-white uppercase tracking-tighter">Route Optimization</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gold/60 mt-1">{activeOrders.length} Stop(s) in current sequence</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={openMultiStopRoute}
                                    className="px-8 py-4 bg-gold text-charcoal rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Navigation className="w-5 h-5" /> Launch Route Master
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-10">
                                {activeOrders.length === 0 ? (
                                    <div className="py-24 glass rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-10">
                                        <MapPin className="w-16 h-16 text-white/5 mx-auto mb-6" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No active missions in your route.</p>
                                    </div>
                                ) : (
                                    activeOrders.map((order, index) => (
                                        <div key={order._id} className="relative flex gap-8 group">
                                            {/* Sequence Indicator */}
                                            <div className="hidden md:flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl font-serif font-black text-gold shadow-xl">
                                                    {index + 1}
                                                </div>
                                                {index < activeOrders.length - 1 && (
                                                    <div className="w-0.5 flex-1 bg-gradient-to-b from-gold/40 to-transparent my-2" />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <OrderCard 
                                                    order={order}
                                                    onAction={handleAction}
                                                    actionLoading={actionLoading}
                                                    isSequence={true}
                                                    sequenceNumber={index + 1}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.section>
                    )}

                    {tab === 'history' && (
                        <motion.section
                            key="history"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                        >
                            <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-soft-white/20 flex items-center gap-3 mb-10 border-l-2 border-white/5 pl-6">
                               <CheckCircle2 className="w-4 h-4" /> Operational Mission History
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {completedOrders.length === 0 ? (
                                    <p className="col-span-full text-[10px] font-black uppercase tracking-widest text-center py-20 opacity-20">No archived deployments detected.</p>
                                ) : (
                                    completedOrders.map((order) => (
                                        <div key={order._id} className="glass p-8 rounded-[2rem] border border-white/5 flex items-center justify-between gap-6 group hover:border-gold/20 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                                                    <CheckCircle2 className="w-7 h-7 text-green-500/40" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-white tracking-widest mb-1 uppercase">MISSION #{order.orderNumber || order._id.slice(-6)}</h4>
                                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest truncate max-w-[150px]">{order.shippingAddress?.address}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-serif font-black text-gold">Rs. {order.totalPrice}</p>
                                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">{new Date(order.deliveredAt).toLocaleDateString()}</p>
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

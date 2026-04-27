import React, { useState, useMemo } from 'react';
import { 
    CheckCircle2, 
    ShoppingBag, 
    Navigation, 
    Route as RouteIcon,
    Zap,
    Map as MapIcon,
    LayoutList,
    MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRider } from '../hooks/useRider';
import OrderCard from '../components/OrderCard';
import DeliveryMap from '../components/DeliveryMap';
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
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

    const handleAction = async (orderId, type) => {
        setActionLoading(true);
        try {
            switch(type) {
                case 'claim': await claim(orderId); break;
                case 'batch': await batchToRoute(orderId); break;
                case 'accept': await accept(orderId); break;
                case 'pickup': await pickup(orderId); break;
                case 'arrive': await arrive(orderId); break;
                case 'deliver': await deliver(orderId); break;
                default: throw new Error("Invalid action");
            }
            toast.success(`Action successful! ✅`);
            if (['claim', 'batch', 'accept', 'pickup'].includes(type)) setTab('active');
        } catch (error) {
            toast.error(error.response?.data?.message || `Action failed ❌`);
        } finally {
            setActionLoading(false);
        }
    };

    const activeOrders = useMemo(() => {
        return myOrders
            .filter(o => o.status !== 'DELIVERED')
            .sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));
    }, [myOrders]);

    const completedOrders = myOrders.filter(o => o.status === 'DELIVERED');

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-24 max-w-4xl mx-auto px-4 pt-6">
            <header className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                        Delivery <span className="text-gold">Assistant</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Real-time Order Management</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                    {[
                        { id: 'new', label: 'New', icon: ShoppingBag },
                        { id: 'active', label: 'Deliveries', icon: Navigation },
                        { id: 'history', label: 'History', icon: CheckCircle2 }
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                tab === t.id ? 'bg-gold text-charcoal' : 'text-white/30 hover:text-white'
                            }`}
                        >
                            <t.icon className="w-3.5 h-3.5" />
                            {t.label}
                        </button>
                    ))}
                </div>
            </header>

            <AnimatePresence mode="wait">
                {tab === 'new' && (
                    <motion.div
                        key="new"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Available Near You
                            </h2>
                            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-white/40 uppercase">
                                {availableOrders.length} Orders
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {availableOrders.length === 0 ? (
                                <div className="py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center px-6">
                                    <ShoppingBag className="w-12 h-12 text-white/10 mb-4" />
                                    <h3 className="text-lg font-bold text-white/20 uppercase tracking-widest">No New Orders</h3>
                                    <p className="text-[10px] font-medium text-white/10 uppercase mt-2">Checking for new signals...</p>
                                </div>
                            ) : (
                                availableOrders.map((order) => (
                                    <OrderCard 
                                        key={order._id}
                                        order={order}
                                        onAction={handleAction}
                                        actionLoading={actionLoading}
                                        isNearby={order.onRoute}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                )}

                {tab === 'active' && (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold flex items-center gap-2">
                                <RouteIcon className="w-4 h-4" /> Your Active Batch
                            </h2>
                            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                                <button 
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-gold' : 'text-white/20'}`}
                                >
                                    <LayoutList className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setViewMode('map')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'map' ? 'bg-white/10 text-gold' : 'text-white/20'}`}
                                >
                                    <MapIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {activeOrders.length === 0 ? (
                            <div className="py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center px-6">
                                <Navigation className="w-12 h-12 text-white/10 mb-4" />
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No active deliveries</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {viewMode === 'map' && (
                                    <div className="h-[400px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                                        <DeliveryMap riderLoc={location} activeOrders={activeOrders} />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-6">
                                    {activeOrders.map((order, idx) => (
                                        <div key={order._id} className="relative">
                                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-12 bg-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                                            <OrderCard 
                                                order={order}
                                                onAction={handleAction}
                                                actionLoading={actionLoading}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {tab === 'history' && (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Completed Recently
                            </h2>
                            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-white/40 uppercase">
                                {completedOrders.length} Completed
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {completedOrders.length === 0 ? (
                                <div className="py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center px-6">
                                    <CheckCircle2 className="w-12 h-12 text-white/10 mb-4" />
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No history found</p>
                                </div>
                            ) : (
                                completedOrders.map((order) => (
                                    <div key={order._id} className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col gap-4 group hover:bg-white/[0.07] transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-near/10 flex items-center justify-center border border-near/20">
                                                    <CheckCircle2 className="w-6 h-6 text-near" />
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-bold text-white uppercase tracking-tight">
                                                        {order.user?.firstName} {order.user?.lastName}
                                                    </h4>
                                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-0.5">
                                                        ID: {order.orderNumber || order._id.slice(-6)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gold">Rs. {order.totalPrice}</p>
                                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">
                                                    {new Date(order.deliveredAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="h-px bg-white/5 w-full" />
                                        
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-4 h-4 text-white/20" />
                                                <p className="text-sm font-medium text-white/60">
                                                    {order.shippingAddress?.area || 'Delivery Area'}
                                                </p>
                                            </div>
                                            {order.shippingAddress?.phoneNumber && (
                                                <a 
                                                    href={`https://wa.me/${order.shippingAddress.phoneNumber.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-black text-near uppercase tracking-widest bg-near/10 px-3 py-1.5 rounded-lg border border-near/20"
                                                >
                                                    {order.shippingAddress.phoneNumber}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Orders;


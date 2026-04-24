import React, { useState, useRef } from 'react';
import { 
    Clock, 
    MapPin, 
    ShoppingBag, 
    CheckCircle, 
    Navigation,
    Truck,
    Phone,
    User,
    ChevronRight,
    Map,
    PlusCircle,
    Route as RouteIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderCard = ({ 
    order, 
    onAction, 
    actionLoading, 
    customActionLabel, 
    isSequence, 
    sequenceNumber,
    isNearby 
}) => {
    const [holdProgress, setHoldProgress] = useState(0);
    const holdTimer = useRef(null);

    if (!order || !order._id) return null;

    const getStatusConfig = (status) => {
        switch (status) {
            case 'READY_FOR_DELIVERY': return { color: 'text-gold', bg: 'bg-gold/10', label: 'READY' };
            case 'ASSIGNED': return { color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'ASSIGNED' };
            case 'ACCEPTED': return { color: 'text-indigo-400', bg: 'bg-indigo-400/10', label: 'ACCEPTED' };
            case 'PICKED_UP': return { color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'PICKED UP' };
            case 'ARRIVED': return { color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'ARRIVED' };
            case 'DELIVERED': return { color: 'text-green-400', bg: 'bg-green-400/10', label: 'DELIVERED' };
            default: return { color: 'text-soft-white', bg: 'bg-white/5', label: status };
        }
    };

    const config = getStatusConfig(order.status);

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.shippingAddress?.address + ', ' + (order.shippingAddress?.city || ''))}`;

    const startHold = () => {
        if (actionLoading) return;
        holdTimer.current = setInterval(() => {
            setHoldProgress(prev => {
                if (prev >= 100) {
                    clearInterval(holdTimer.current);
                    onAction(order._id, 'deliver');
                    return 100;
                }
                return prev + 5;
            });
        }, 50);
    };

    const stopHold = () => {
        clearInterval(holdTimer.current);
        if (holdProgress < 100) setHoldProgress(0);
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card-premium p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden transition-all duration-500 ${isSequence ? 'border-l-4 border-l-gold' : ''}`}
        >
            {/* Status Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 ${isSequence ? 'bg-gold/10 border-gold/20' : ''}`}>
                        {isSequence ? <RouteIcon className="w-6 h-6 text-gold" /> : <ShoppingBag className="w-6 h-6 text-gold/60" />}
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest">
                            {isSequence ? `Stop #${sequenceNumber}` : 'Mission Protocol'} <span className="text-gold">#{order.orderNumber || order._id.slice(-6)}</span>
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className={`px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${config.bg} ${config.color} border border-current/10`}>
                                {config.label}
                            </span>
                            <span className="flex items-center gap-1.5 text-[9px] text-soft-white/30 font-bold uppercase tracking-widest">
                                <Clock className="w-3 h-3" />
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end">
                    <p className="text-[9px] font-black text-soft-white/20 uppercase tracking-widest mb-1">Total Yield</p>
                    <p className="text-xl font-serif font-black text-white leading-none mb-3">Rs.{order.totalPrice}</p>
                    
                    {order.distance && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg border border-white/10">
                            <Navigation size={10} className="text-gold" />
                            <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">{order.distance} KM</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex items-start gap-4 group">
                        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-gold/20 transition-all">
                            <User className="w-4 h-4 text-gold/40" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-soft-white/30 uppercase tracking-widest mb-1">Recipient</p>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">{order.user?.firstName} {order.user?.lastName}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 group">
                        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-crimson/20 transition-all">
                            <MapPin className="w-4 h-4 text-crimson/40" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-soft-white/30 uppercase tracking-widest mb-1">Drop-off Coordinate</p>
                            <p className="text-[10px] font-bold text-white leading-relaxed uppercase tracking-wide line-clamp-2">
                                {order.shippingAddress?.address}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-5 glass rounded-2xl border border-white/5 bg-white/[0.01]">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-black text-soft-white/20 uppercase tracking-widest">Protocol Type</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${order.paymentMethod === 'cod' ? 'text-gold' : 'text-green-500'}`}>
                                {order.paymentMethod === 'cod' ? 'Collection Required' : 'Prepaid Signal'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-soft-white/20 uppercase tracking-widest">Inventory Load</span>
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">{order.orderItems?.length} Units</span>
                        </div>
                    </div>

                    <a 
                        href={googleMapsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-gold hover:text-charcoal transition-all group shadow-xl"
                    >
                        <Navigation className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Open Navigation Hub</span>
                    </a>
                </div>
            </div>

            {/* Action Buttons with HCI Emphasis */}
            <div className="mt-2">
                <AnimatePresence mode="wait">
                    {/* NEW/AVAILABLE STATUS ACTIONS */}
                    {order.status === 'READY_FOR_DELIVERY' && (
                        <motion.button 
                            key="claim"
                            onClick={() => onAction(order._id, 'claim')}
                            disabled={actionLoading}
                            className="btn-gold w-full py-5 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-gold/20"
                        >
                            {customActionLabel || (actionLoading ? 'CONNECTING...' : 'Initialize Mission')} <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    )}

                    {/* ACTIVE ROUTE ACTIONS */}
                    {order.status === 'ASSIGNED' && (
                        <motion.button 
                            key="accept"
                            onClick={() => onAction(order._id, 'accept')}
                            disabled={actionLoading}
                            className="w-full py-5 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20"
                        >
                            <CheckCircle className="w-5 h-5" /> {actionLoading ? 'ENCRYPTING...' : 'Confirm Assignment'}
                        </motion.button>
                    )}

                    {order.status === 'ACCEPTED' && (
                        <motion.button 
                            key="pickup"
                            onClick={() => onAction(order._id, 'pickup')}
                            disabled={actionLoading}
                            className="w-full py-5 bg-orange-600 text-white rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20"
                        >
                            <ShoppingBag className="w-5 h-5" /> {actionLoading ? 'VERIFYING...' : 'Secure Package'}
                        </motion.button>
                    )}

                    {order.status === 'PICKED_UP' && (
                        <motion.button 
                            key="arrive"
                            onClick={() => onAction(order._id, 'arrive')}
                            disabled={actionLoading}
                            className="w-full py-5 bg-purple-600 text-white rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-600/20"
                        >
                            <Truck className="w-5 h-5" /> {actionLoading ? 'TRANSMITTING...' : 'Report Arrival'}
                        </motion.button>
                    )}

                    {order.status === 'ARRIVED' && (
                        <div className="relative group">
                            <motion.div 
                                className="relative w-full h-16 bg-white/5 rounded-2xl overflow-hidden border border-white/10 cursor-pointer shadow-inner"
                                onMouseDown={startHold}
                                onMouseUp={stopHold}
                                onMouseLeave={stopHold}
                                onTouchStart={startHold}
                                onTouchEnd={stopHold}
                            >
                                <motion.div 
                                    className="absolute left-0 top-0 h-full bg-green-500/30"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${holdProgress}%` }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center gap-4">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${holdProgress > 0 ? 'border-green-500 bg-green-500' : 'border-white/10'}`}>
                                        <CheckCircle className={`w-4 h-4 transition-colors ${holdProgress > 0 ? 'text-charcoal' : 'text-white/10'}`} />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white select-none">
                                        {holdProgress >= 100 ? 'PROTOCOL COMPLETE' : holdProgress > 0 ? 'SECURE HOLD...' : 'Hold for Final Handover'}
                                    </span>
                                </div>
                            </motion.div>
                            <p className="text-[8px] font-bold text-center mt-3 text-white/20 uppercase tracking-widest">Requires biometric-level manual hold confirmation</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default OrderCard;

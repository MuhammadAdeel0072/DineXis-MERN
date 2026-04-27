import React from 'react';
import { 
    User, 
    MapPin, 
    Navigation,
    ChevronRight,
    CheckCircle2,
    Truck,
    PackageCheck,
    Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const OrderCard = ({ 
    order, 
    onAction, 
    actionLoading, 
    isNearby 
}) => {
    if (!order || !order._id) return null;

    const getDistanceLabel = (dist) => {
        const d = parseFloat(dist);
        if (isNaN(d)) return { label: 'Nearby', color: 'bg-near' };
        if (d < 2) return { label: 'Near', color: 'bg-near' };
        if (d < 5) return { label: 'Medium', color: 'bg-medium' };
        return { label: 'Far', color: 'bg-far' };
    };

    const distInfo = getDistanceLabel(order.distance);

    const getMainAction = () => {
        switch (order.status) {
            case 'READY_FOR_DELIVERY':
                return {
                    label: isNearby ? 'Accept Nearby Order' : 'Accept Order',
                    icon: <PackageCheck className="w-5 h-5" />,
                    class: 'btn-primary-large',
                    type: isNearby ? 'batch' : 'claim'
                };
            case 'ASSIGNED':
            case 'ACCEPTED':
                return {
                    label: 'Start Delivery',
                    icon: <Truck className="w-5 h-5" />,
                    class: 'btn-primary-large',
                    type: 'pickup'
                };
            case 'PICKED_UP':
                return {
                    label: 'I Have Arrived',
                    icon: <Navigation className="w-5 h-5" />,
                    class: 'btn-primary-large',
                    type: 'arrive'
                };
            case 'ARRIVED':
                return {
                    label: 'Mark Delivered',
                    icon: <CheckCircle2 className="w-5 h-5" />,
                    class: 'btn-success-large',
                    type: 'deliver'
                };
            default:
                return null;
        }
    };

    const action = getMainAction();

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-minimal p-6 flex flex-col gap-6"
        >
            {/* Simple Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                        <User className="w-6 h-6 text-gold" />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white tracking-tight leading-none truncate mb-1">
                                {order.user?.firstName} {order.user?.lastName}
                            </h3>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">ID: {order.orderNumber || order._id.slice(-6)}</p>
                        </div>
                        {order.distance && (
                            <div className="px-4 py-2 rounded-xl bg-near/10 border border-near/20 flex flex-col items-center justify-center shrink-0">
                                <p className="text-[14px] font-black text-near leading-none mb-1">{order.distance} KM</p>
                                <p className="text-[8px] font-bold text-near/40 uppercase tracking-widest">Away</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className={`${distInfo.color} text-charcoal px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                    {distInfo.label}
                </div>
            </div>

            {/* Address & Contact */}
            <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                        <MapPin className="w-6 h-6 text-near" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Delivery Area</p>
                        <p className="text-base font-medium text-white/80 leading-snug">
                            {order.shippingAddress?.area || order.shippingAddress?.address?.split(',')[0]}
                        </p>
                    </div>
                </div>

                {order.shippingAddress?.phoneNumber && (
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-near/5 flex items-center justify-center border border-near/10 shrink-0">
                            <Navigation className="w-6 h-6 text-near" />
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">WhatsApp Client</p>
                                <p className="text-base font-bold text-near tracking-wider">
                                    {order.shippingAddress.phoneNumber}
                                </p>
                            </div>
                            <a 
                                href={`https://wa.me/${order.shippingAddress.phoneNumber.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-near text-charcoal flex items-center justify-center shadow-lg shadow-near/20 active:scale-90 transition-all"
                            >
                                <Zap className="w-5 h-5 fill-charcoal" />
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Large Action Button */}
            {action && (
                <button 
                    onClick={() => onAction(order._id, action.type)}
                    disabled={actionLoading}
                    className={action.class}
                >
                    {actionLoading ? (
                        <div className="w-5 h-5 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin"></div>
                    ) : (
                        <>
                            {action.icon}
                            <span>{action.label}</span>
                            <ChevronRight className="w-5 h-5 ml-auto opacity-30" />
                        </>
                    )}
                </button>
            )}
        </motion.div>
    );
};

export default OrderCard;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, 
    MapPin, 
    Phone, 
    User, 
    Clock, 
    ShoppingBag, 
    Navigation, 
    CheckCircle,
    Truck,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRider } from '../context/RiderContext';
import { updateDeliveryStatus } from '../services/api';
import toast from 'react-hot-toast';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { myOrders, availableOrders, refreshData } = useRider();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const foundOrder = [...myOrders, ...availableOrders].find(o => o._id === id);
        if (foundOrder) {
            setOrder(foundOrder);
            setLoading(false);
        } else if (!loading) {
            toast.error('Order mission data not found');
            navigate('/orders');
        }
    }, [id, myOrders, availableOrders, navigate, loading]);

    const handleAction = async (type) => {
        setActionLoading(true);
        const loadingToast = toast.loading(`Updating status...`);
        try {
            await updateDeliveryStatus(order._id, type);
            toast.dismiss(loadingToast);
            toast.success('Mission Updated! 🚀');
            refreshData();
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Signal lost: Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const openNavigation = () => {
        const addr = encodeURIComponent(order.shippingAddress.address);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, '_blank');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            <header className="flex items-center gap-6">
                <Link to="/orders" className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-gold hover:text-charcoal transition-all group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div>
                    <h1 className="text-3xl font-serif font-black tracking-tighter uppercase text-white">
                        Mission <span className="text-gold">Details</span>
                    </h1>
                    <p className="label-caps tracking-[0.2em] opacity-40">Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    {/* Order Items */}
                    <section className="card-premium p-8">
                        <h3 className="label-caps mb-6 opacity-60 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-gold" /> Items to Deliver
                        </h3>
                        <div className="space-y-4">
                            {order.orderItems?.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-gold/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                                        <div>
                                            <p className="text-xs font-bold text-white uppercase tracking-wider">{item.name}</p>
                                            <p className="text-[10px] text-soft-white/40 font-bold uppercase">Quantity: {item.qty}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-serif font-black text-gold">Rs. {item.price * item.qty}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-end">
                            <div>
                                <p className="label-caps mb-1 opacity-40">Payment Status</p>
                                <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${order.isPaid ? 'bg-green-500/10 text-green-500' : 'bg-gold/10 text-gold'}`}>
                                    {order.isPaid ? 'Paid' : 'Cash On Delivery'}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="label-caps mb-1 opacity-40">Total Amount</p>
                                <p className="text-3xl font-serif font-black text-white">Rs. {order.totalPrice}</p>
                            </div>
                        </div>
                    </section>

                    {/* Timeline */}
                    <section className="card-premium p-8">
                        <h3 className="label-caps mb-6 opacity-60 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gold" /> Mission Timeline
                        </h3>
                        <div className="space-y-6 relative ml-4">
                            <div className="absolute left-[-17px] top-2 bottom-2 w-0.5 bg-white/5" />
                            {order.statusHistory?.map((entry, idx) => (
                                <div key={idx} className="relative flex flex-col gap-1">
                                    <div className="absolute left-[-21px] top-1.5 w-2 h-2 rounded-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">{entry.status.replace(/-/g, ' ')}</p>
                                    <p className="text-[10px] text-soft-white/20">{new Date(entry.timestamp).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    {/* Customer Info */}
                    <section className="card-premium p-8 space-y-6 bg-gold/5 border-gold/10">
                        <div className="text-center pb-6 border-b border-gold/10">
                            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/20">
                                <User className="w-8 h-8 text-gold" />
                            </div>
                            <h4 className="text-lg font-serif font-black text-white uppercase tracking-tighter leading-none">{order.shippingAddress.fullName}</h4>
                            <p className="label-caps text-[8px] mt-2 opacity-60">Customer Profile</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <MapPin className="w-4 h-4 text-gold shrink-0 mt-1" />
                                <div>
                                    <p className="label-caps text-[8px] opacity-40 mb-1">Destination</p>
                                    <p className="text-xs font-bold text-white leading-relaxed">{order.shippingAddress.address}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="w-4 h-4 text-gold shrink-0" />
                                <div>
                                    <p className="label-caps text-[8px] opacity-40 mb-1">Contact</p>
                                    <p className="text-xs font-bold text-white">{order.shippingAddress.phoneNumber}</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={openNavigation}
                            className="w-full py-4 rounded-xl bg-gold text-charcoal text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-gold/20 hover:scale-[1.02] transition-all"
                        >
                            <Navigation className="w-4 h-4" /> Start Navigation
                        </button>
                    </section>

                    {/* Action Panel */}
                    <div className="space-y-4">
                        {order.status === 'out-for-delivery' && (
                            <button 
                                onClick={() => handleAction('delivered')}
                                disabled={actionLoading}
                                className="w-full py-5 rounded-xl bg-green-500 text-charcoal text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-green-500/20 active:scale-95 transition-all"
                            >
                                <CheckCircle className="w-5 h-5" /> Confirm Delivery
                            </button>
                        )}
                        
                        {order.status === 'picked-up' && (
                            <button 
                                onClick={() => handleAction('out-for-delivery')}
                                disabled={actionLoading}
                                className="w-full py-5 rounded-xl bg-gold text-charcoal text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-gold/20 active:scale-95 transition-all"
                            >
                                <Truck className="w-5 h-5" /> Set Out For Delivery
                            </button>
                        )}

                        <div className="p-6 glass rounded-2xl border border-white/5 text-center">
                            <AlertCircle className="w-6 h-6 text-soft-white/20 mx-auto mb-3" />
                            <p className="text-[9px] text-soft-white/40 font-bold uppercase tracking-widest leading-relaxed">
                                Always verify customer identity before completing delivery protocol.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;

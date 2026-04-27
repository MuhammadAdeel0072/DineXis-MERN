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
    AlertCircle,
    ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRider } from '../hooks/useRider';
import toast from 'react-hot-toast';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { 
        myOrders, 
        availableOrders, 
        refreshData,
        claim,
        accept,
        pickup,
        arrive,
        deliver
    } = useRider();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const foundOrder = [...myOrders, ...availableOrders].find(o => o._id === id);
        if (foundOrder) {
            setOrder(foundOrder);
            setLoading(false);
        } else if (!loading) {
            toast.error('Mission data not found');
            navigate('/orders');
        }
    }, [id, myOrders, availableOrders, navigate, loading]);

    const handleAction = async (type) => {
        setActionLoading(true);
        const loadingToast = toast.loading(`Initiating: ${type.toUpperCase()}...`);
        try {
            switch(type) {
                case 'claim': await claim(order._id); break;
                case 'accept': await accept(order._id); break;
                case 'pickup': await pickup(order._id); break;
                case 'arrive': await arrive(order._id); break;
                case 'deliver': await deliver(order._id); break;
                default: throw new Error("Invalid protocol type");
            }
            toast.dismiss(loadingToast);
            toast.success(`Mission ${type.toUpperCase()} complete!`);
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Protocol failed: Connection error');
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
                        Mission <span className="text-gold">Intelligence</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    {/* Order Items */}
                    <section className="card-premium p-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-60 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-gold" /> Inventory Details
                        </h3>
                        <div className="space-y-4">
                            {order.orderItems?.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-gold/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                                        <div>
                                            <p className="text-xs font-bold text-white uppercase tracking-wider">{item.name}</p>
                                            <p className="text-[10px] text-gold/40 font-black uppercase tracking-widest mt-0.5">Quantity: {item.qty}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-serif font-black text-gold">Rs. {item.price * item.qty}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-end">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-40">Payment Protocol</p>
                                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${order.isPaid ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gold/10 text-gold border-gold/20'}`}>
                                    {order.isPaid ? 'Prepaid / Paid' : 'Collect Cash (COD)'}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-40">Total Value</p>
                                <p className="text-3xl font-serif font-black text-white">Rs. {order.totalPrice}</p>
                            </div>
                        </div>
                    </section>

                    {/* Timeline */}
                    <section className="card-premium p-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-60 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gold" /> Operation Log
                        </h3>
                        <div className="space-y-6 relative ml-4">
                            <div className="absolute left-[-17px] top-2 bottom-2 w-0.5 bg-white/5" />
                            {order.statusHistory?.map((entry, idx) => (
                                <div key={idx} className="relative flex flex-col gap-1">
                                    <div className={`absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full ${idx === order.statusHistory.length - 1 ? 'bg-gold animate-pulse' : 'bg-white/10'}`} />
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">{entry.status.replace(/_/g, ' ')}</p>
                                    <p className="text-[9px] font-bold text-soft-white/20 uppercase">{new Date(entry.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    {/* Customer Info */}
                    <section className="card-premium p-8 space-y-6 bg-white/[0.02] border-white/5">
                        <div className="text-center pb-6 border-b border-white/5">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                <User className="w-8 h-8 text-gold/40" />
                            </div>
                            <h4 className="text-lg font-serif font-black text-white uppercase tracking-tighter leading-none">{order.user?.firstName} {order.user?.lastName}</h4>
                            <p className="text-[9px] font-black uppercase tracking-widest mt-3 text-gold/40">Target Destination</p>
                        </div>
                        
                        <div className="space-y-5">
                            <div className="flex items-start gap-4">
                                <MapPin className="w-4 h-4 text-crimson shrink-0 mt-1" />
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Address</p>
                                    <p className="text-xs font-bold text-white leading-relaxed line-clamp-3">{order.shippingAddress.address}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="w-4 h-4 text-gold shrink-0" />
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Contact Signal</p>
                                    <p className="text-xs font-bold text-white">{order.shippingAddress.phoneNumber}</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={openNavigation}
                            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gold hover:text-charcoal transition-all group"
                        >
                            <Navigation className="w-4 h-4 group-hover:scale-110 transition-transform" /> Start Navigation
                        </button>
                    </section>

                    {/* Action Panel */}
                    <div className="space-y-4">
                        {order.status === 'READY_FOR_DELIVERY' && (
                            <button onClick={() => handleAction('claim')} disabled={actionLoading} className="btn-gold w-full py-5 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                                <ShoppingBag className="w-5 h-5" /> Secure Mission
                            </button>
                        )}
                        {order.status === 'ASSIGNED' && (
                            <button onClick={() => handleAction('accept')} disabled={actionLoading} className="w-full py-5 rounded-2xl bg-indigo-500 text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 transition-all">
                                <CheckCircle className="w-5 h-5" /> Accept Order
                            </button>
                        )}
                        {order.status === 'ACCEPTED' && (
                            <button onClick={() => handleAction('pickup')} disabled={actionLoading} className="w-full py-5 rounded-2xl bg-orange-500 text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 transition-all">
                                <ShoppingBag className="w-5 h-5" /> Pick Up Order
                            </button>
                        )}
                        {order.status === 'PICKED_UP' && (
                            <button onClick={() => handleAction('arrive')} disabled={actionLoading} className="w-full py-5 rounded-2xl bg-purple-600 text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-purple-600/20 transition-all">
                                <Truck className="w-5 h-5" /> Arrived at Location
                            </button>
                        )}
                        {order.status === 'ARRIVED' && (
                            <div className="p-6 glass rounded-[2rem] border border-green-500/20 bg-green-500/5 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-green-500 mb-3">Location Reached</p>
                                <p className="text-[9px] text-soft-white/40 font-bold uppercase tracking-widest leading-relaxed mb-4">
                                    Return to dashboard to complete final handover protocol.
                                </p>
                                <Link to="/" className="text-xs font-black text-white underline underline-offset-4 decoration-gold/40 hover:decoration-gold">Go to Dashboard</Link>
                            </div>
                        )}

                        <div className="p-6 glass rounded-2xl border border-white/5 text-center">
                            <AlertCircle className="w-6 h-6 text-soft-white/20 mx-auto mb-3" />
                            <p className="text-[8px] text-soft-white/40 font-black uppercase tracking-widest leading-relaxed">
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

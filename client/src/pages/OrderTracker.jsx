import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import { Clock, CheckCircle, Truck, Package, MapPin, ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

const OrderTracker = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notifications } = useSocket();

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(id);
      setOrder(data);
    } catch (error) {
      toast.error('Failed to load order tracking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Sync with real-time notifications for this specific order
  useEffect(() => {
    const latestUpdate = notifications.find(n => n.orderId === id);
    if (latestUpdate && order) {
      setOrder(prev => ({ ...prev, status: latestUpdate.status }));
    }
  }, [notifications, id, order]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <RefreshCw className="w-12 h-12 text-gold animate-spin" />
      <p className="text-gold font-serif text-xl italic animate-pulse">Consulting the head chef...</p>
    </div>
  );

  if (!order) return <div className="text-center py-24 text-white">Order not found.</div>;

  const steps = [
    { status: 'placed', label: 'Order Received', icon: Package, time: '2 mins ago' },
    { status: 'preparing', label: 'In the Kitchen', icon: Clock, time: 'Estimated 15 mins' },
    { status: 'ready', label: 'Ready for Pickup', icon: CheckCircle, time: 'Almost there' },
    { status: 'out-for-delivery', label: 'En Route', icon: Truck, time: 'Coming to you' },
    { status: 'delivered', label: 'Delivered', icon: MapPin, time: 'Enjoy your meal!' },
  ];

  const currentStep = steps.findIndex(s => s.status === order.status);

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="flex justify-between items-center mb-12">
        <Link to="/orders" className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors text-xs font-black uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>
        <h1 className="text-3xl font-serif font-bold text-white">Order #{order.orderNumber}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        {steps.map((s, i) => (
          <div key={i} className={`flex flex-col items-center text-center relative ${i <= currentStep ? 'opacity-100' : 'opacity-20'}`}>
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 transition-all duration-500 border-2 ${
              i === currentStep ? 'bg-gold border-gold text-charcoal scale-110 shadow-[0_0_30px_rgba(212,175,55,0.4)]' : 
              i < currentStep ? 'bg-gold/10 border-gold/40 text-gold' : 'bg-white/5 border-white/10 text-gray-500'
            }`}>
              <s.icon className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[10px] uppercase tracking-tighter mb-1">{s.label}</h4>
            <p className="text-[10px] text-gray-500 font-medium">{order.status === s.status ? s.time : ''}</p>
            
            {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-white/5 -z-10">
                    <div className={`h-full bg-gold transition-all duration-1000 ${i < currentStep ? 'w-full' : 'w-0'}`}></div>
                </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[3rem] p-12 overflow-hidden relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gold/40 mb-4">Delivery Address</h3>
                    <p className="text-white font-serif text-lg">{order.shippingAddress.address}</p>
                    <p className="text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                </div>
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gold/40 mb-4">Payment Method</h3>
                    <p className="text-white font-serif">{order.paymentMethod}</p>
                    <p className={`mt-2 text-[10px] inline-block px-3 py-1 rounded-full border font-black uppercase tracking-tighter ${order.isPaid ? 'border-green-400/20 text-green-400 bg-green-400/5' : 'border-gold/20 text-gold bg-gold/5'}`}>
                        {order.isPaid ? 'Success' : 'Pending'}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-gold/40 mb-4">Order Items</h3>
                <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {order.orderItems.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">{item.qty}x {item.name}</span>
                            <span className="text-white font-bold">${item.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Charged</p>
                        <p className="text-3xl font-serif font-bold text-gold">${order.totalPrice.toFixed(2)}</p>
                    </div>
                    <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl border border-white/10 transition-all text-sm font-bold">
                        <Download className="w-4 h-4" /> Receipt
                    </button>
                </div>
            </div>
        </div>
        
        {/* Driver Mock (Optional enhancement) */}
        {order.status === 'out-for-delivery' && order.driver && (
            <div className="mt-12 bg-gold/5 border border-gold/20 p-6 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center font-black text-charcoal">
                        {order.driver.name[0]}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gold/60">Your Courier</p>
                        <p className="text-white font-bold">{order.driver.name}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gold/60">Plate Number</p>
                    <p className="text-white font-mono">{order.driver.vehiclePlate || 'RE-3049'}</p>
                </div>
            </div>
        )}
      </div>
      
      <div className="mt-12 text-center">
            <p className="text-gray-500 text-xs mb-4 italic">Estimated preparation time: 25-35 minutes</p>
            <Link to="/menu" className="text-gold font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors">
                Add more items to a new order
            </Link>
      </div>
    </div>
  );
};

export default OrderTracker;

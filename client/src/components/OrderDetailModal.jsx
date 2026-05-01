import React from 'react';
import { X, Clock, MapPin, CreditCard, ShoppingBag, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const OrderDetailModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'out-for-delivery': return 'text-gold bg-gold/10 border-gold/20';
      case 'ready':            return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'preparing':        return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'placed':           return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'confirmed':        return 'text-blue-300 bg-blue-300/10 border-blue-300/20';
      case 'picked-up':        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'cancelled':        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:                 return 'text-gray-400 bg-white/5 border-white/10';
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        {/* Backdrop for exit click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Content - Compact HCI Design */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="bg-[#121212] border border-white/10 rounded-3xl overflow-hidden max-w-xl w-full shadow-2xl flex flex-col relative max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Order Details 
                <span className="text-sm font-normal text-gray-500 font-mono">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 bg-white/5 hover:bg-gold text-white hover:text-black rounded-xl transition-all active:scale-90"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Simple Body Section */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* Status & Date */}
            <div className="flex justify-between items-center p-4 bg-white/[0.03] rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <Clock className="text-gray-500" size={18} />
                <div>
                   <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Placed On</p>
                   <p className="text-sm text-white font-bold">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </p>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-lg border text-[11px] font-bold uppercase ${getStatusColor(order.status)}`}>
                {order.status}
              </div>
            </div>

            {/* Food Items Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gold flex items-center gap-2">
                <ShoppingBag size={16} /> Food Items
              </h3>
              <div className="space-y-3">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-white/[0.01] p-3 rounded-xl border border-transparent hover:border-white/5 transition-colors">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-sm leading-tight">{item.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-gray-500 text-xs">Qty: {item.qty} × Rs. {item.price}</p>
                        {item.selectedSize && (
                          <span className="px-2 py-0.5 bg-gold/10 text-gold text-[8px] font-black uppercase tracking-widest rounded border border-gold/20">
                            {item.selectedSize.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-white font-bold text-sm">
                      Rs. {item.price * item.qty}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <MapPin size={16} /> Delivery To
              </h3>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-white font-bold text-sm mb-1">{order.shippingAddress?.fullName}</p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {order.shippingAddress?.streetAddress}, {order.shippingAddress?.area}, {order.shippingAddress?.city}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="px-6 py-6 border-t border-white/10 bg-white/[0.02]">
             <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-bold flex items-center gap-2">
                    <CreditCard size={12} /> Payment Method
                  </p>
                  <p className="text-sm text-white font-bold">
                    {order.isPaid ? 'Online Payment' : 'Cash on Delivery'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gold uppercase font-bold mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-white tracking-tighter">
                    Rs. {order.totalPrice?.toFixed(0)}
                  </p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default OrderDetailModal;

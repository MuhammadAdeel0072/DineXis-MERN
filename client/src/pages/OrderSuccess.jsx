import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import { useNavigate, useLocation } from 'react-router-dom';

const OrderSuccess = () => {
    const location = useLocation();
    const orderId = new URLSearchParams(location.search).get('id');

    return (
        <div className="container mx-auto px-6 py-24 text-center">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex justify-center mb-10"
            >
                <div className="bg-gold/10 p-10 rounded-full shadow-[0_0_80px_rgba(212,175,55,0.2)] border border-gold/20 relative">
                    <CheckCircle className="w-20 h-20 text-gold" />
                    <div className="absolute inset-0 bg-gold/5 rounded-full animate-ping opacity-20"></div>
                </div>
            </motion.div>
            
            <h1 className="text-6xl font-serif font-bold mb-6 text-white">Order Received</h1>
            <p className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
                Your exquisite selection has been sent to our master chefs. Prepare for a midnight feast like no other.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to={`/track/${orderId}`} className="bg-gold text-charcoal px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl shadow-gold/20 flex items-center gap-2">
                    Track My Order <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/menu" className="text-white/40 hover:text-gold transition-colors font-bold uppercase tracking-widest text-xs">
                    Order More
                </Link>
            </div>
            
            <p className="mt-12 text-[10px] text-gray-600 uppercase tracking-[0.5em] font-black">Confirmation ID: {orderId?.slice(-8).toUpperCase()}</p>
        </div>
    );
};

export default OrderSuccess;

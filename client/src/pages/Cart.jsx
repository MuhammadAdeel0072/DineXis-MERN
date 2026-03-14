import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CheckCircle } from 'lucide-react';

const Cart = () => {
  const { state, dispatch } = useCart();
  const { cartItems } = state;
  const navigate = useNavigate();

  const removeFromCartHandler = (item) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: item });
  };

  const updateQtyHandler = (item, qty) => {
    if (qty > 0 && (item.countInStock === undefined || qty <= item.countInStock)) {
      dispatch({
        type: 'ADD_TO_CART',
        payload: { ...item, qty: Number(qty) },
      });
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const tax = subtotal * 0.1; // 10% tax
  const deliveryFee = subtotal > 50 ? 0 : 5;
  const total = subtotal + tax + deliveryFee;
  const estimatedPoints = Math.floor(total * 10);

  const checkoutHandler = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout');
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-serif font-bold text-white mb-2">Gourmet Selection</h1>
          <p className="text-gold/60 font-medium tracking-widest uppercase text-xs">Review your exquisite choices</p>
        </div>
        <Link to="/menu" className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Continue Exploring Menu
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 p-20 rounded-[3rem] text-center backdrop-blur-xl">
          <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-12 h-12 text-gold/40" />
          </div>
          <p className="text-2xl text-white font-serif mb-8">Your preparation table is clear.</p>
          <Link to="/menu" className="inline-flex items-center gap-3 bg-gold text-charcoal px-10 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl shadow-gold/20">
            Discover Delicacies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            {cartItems.map((item, index) => (
              <div key={`${item.product}-${index}`} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 group hover:border-gold/20 transition-all duration-500 backdrop-blur-md">
                <div className="w-32 h-32 flex-shrink-0 relative group-hover:scale-105 transition-transform duration-500">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-3xl shadow-2xl" />
                  <div className="absolute inset-0 rounded-3xl border border-white/10"></div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <h3 className="text-2xl font-serif font-bold text-white group-hover:text-gold transition-colors">{item.name}</h3>
                    <div className="text-2xl font-bold text-gold">${(item.qty * item.price).toFixed(2)}</div>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-1">{item.description}</p>
                  
                  {item.customizations?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                      {item.customizations.map((c, i) => (
                        <span key={i} className="text-[10px] uppercase tracking-tighter bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-gold/70">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-center md:justify-start gap-6">
                    <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                      <button 
                        onClick={() => updateQtyHandler(item, item.qty - 1)}
                        className="p-2 hover:bg-gold hover:text-charcoal rounded-xl transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-black text-lg">{item.qty}</span>
                      <button 
                        onClick={() => updateQtyHandler(item, item.qty + 1)}
                        className="p-2 hover:bg-gold hover:text-charcoal rounded-xl transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeFromCartHandler(item)}
                      className="text-gray-500 hover:text-crimson p-2 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] h-fit sticky top-28 shadow-2xl">
              <h2 className="text-2xl font-serif font-bold mb-8 text-white border-b border-white/5 pb-6">Checkout Summary</h2>
              
              <div className="space-y-5 mb-10">
                <div className="flex justify-between text-gray-400 text-sm font-medium">
                  <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm font-medium">
                  <span>Estimated Tax (10%)</span>
                  <span className="text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm font-medium">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-400 uppercase text-[10px] font-black tracking-widest bg-green-400/10 px-2 py-1 rounded-md">Complimentary</span>
                  ) : (
                    <span className="text-white">${deliveryFee.toFixed(2)}</span>
                  )}
                </div>
                
                <div className="pt-6 border-t border-white/5 flex flex-col gap-2">
                   <div className="flex justify-between text-3xl font-serif font-bold text-white">
                    <span>Total</span>
                    <span className="text-gold">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gold/50 bg-gold/5 w-fit px-3 py-1.5 rounded-full mt-2">
                    <CheckCircle className="w-3 h-3" /> Earning {estimatedPoints} Loyalty Points
                  </div>
                </div>
              </div>

              <button 
                onClick={checkoutHandler}
                className="w-full bg-gold text-charcoal text-lg font-black py-5 rounded-2xl flex justify-center items-center gap-3 transition-all transform hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(212,175,55,0.3)] active:scale-95 group shadow-xl"
              >
                Proceed to Checkout
                <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="text-center text-[10px] text-gray-600 mt-6 uppercase tracking-widest font-medium">Securely processed by Stripe encryption</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Clock, Package, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { dispatch } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/products/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data);
                } else {
                    toast.error('Item not available');
                }
            } catch (error) {
                console.error('Failed to fetch product:', error);
                toast.error('Failed to load item');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const addToCartHandler = () => {
        if (!selectedVariant && product.variants?.length > 0) {
            toast.error('Please select a size first');
            return;
        }

        const cartItem = {
            ...product,
            product: product._id,
            qty: qty,
            selectedVariant: selectedVariant,
            price: selectedVariant ? selectedVariant.price : product.price
        };

        dispatch({
            type: 'ADD_TO_CART',
            payload: cartItem,
        });

        toast.success(`${product.name} (${selectedVariant?.name}) added to cart`, {
            icon: '🛒',
            duration: 3000,
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-6 py-20 text-center">
                <h2 className="text-3xl font-serif font-bold text-white mb-4">Item not available</h2>
                <Link to="/menu" className="text-gold underline underline-offset-8">Back to Menu</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            <Link to="/menu" className="inline-flex items-center gap-2 text-gold/60 hover:text-gold transition-colors font-bold uppercase tracking-widest text-[10px] mb-8">
                <ArrowLeft className="w-4 h-4" /> Back to Menu
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                {/* Product Image */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative group"
                >
                    <div className="aspect-square rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl shadow-black/50">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    </div>
                    {product.isBestSeller && (
                        <div className="absolute top-8 left-8 bg-crimson text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/10">
                            Bestseller
                        </div>
                    )}
                </motion.div>

                {/* Product Info */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col"
                >
                    <div className="mb-8">
                        <span className="text-gold font-black text-xs uppercase tracking-[0.3em] mb-4 block">{product.category}</span>
                        <h1 className="text-5xl md:text-6xl font-serif font-black text-white mb-6 leading-tight">{product.name}</h1>
                        <p className="text-gray-400 text-lg leading-relaxed font-medium mb-8">"{product.description}"</p>
                        
                        <div className="flex items-center gap-8 mb-10">
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                <Clock className="w-4 h-4 text-gold/40" /> {selectedVariant?.prepTime || product.preparationTime} MINS
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                <Package className="w-4 h-4 text-gold/40" /> SAFE PACKING
                            </div>
                        </div>
                    </div>

                    {/* Size Selection Section */}
                    {product.variants?.length > 0 && (
                        <div className="mb-12">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gold/60 mb-6 flex justify-between">
                                Select Your Variant
                                <span className="text-crimson/60">* Required</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {product.variants.map((variant, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedVariant(variant)}
                                        className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 relative group ${
                                            selectedVariant?.name === variant.name
                                                ? 'bg-gold/10 border-gold shadow-[0_20px_40px_rgba(212,175,55,0.15)]'
                                                : 'bg-white/5 border-white/5 hover:border-gold/30'
                                        }`}
                                    >
                                        <span className={`text-2xl font-black uppercase tracking-widest mb-2 ${selectedVariant?.name === variant.name ? 'text-gold' : 'text-gray-400'}`}>
                                            {variant.name}
                                        </span>
                                        <span className="text-xl font-bold text-white tracking-tighter">Rs. {variant.price}</span>
                                        {selectedVariant?.name === variant.name && (
                                            <div className="absolute -top-2 -right-2 bg-gold text-charcoal w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add to Cart Section */}
                    <div className="mt-auto space-y-6">
                        <div className="flex items-center justify-between bg-white/5 p-6 rounded-[2.5rem] border border-white/10">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gold/60 mb-1">Total Price</span>
                                <span className="text-4xl font-black text-white tracking-tighter">
                                    Rs. {(selectedVariant ? selectedVariant.price : product.price) * qty}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-6 bg-charcoal/40 p-2 rounded-2xl border border-white/5 shadow-inner">
                                <button 
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-gold hover:text-charcoal transition-all font-bold"
                                >
                                    -
                                </button>
                                <span className="text-xl font-black text-white w-6 text-center">{qty}</span>
                                <button 
                                    onClick={() => setQty(qty + 1)}
                                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-gold hover:text-charcoal transition-all font-bold"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={addToCartHandler}
                            disabled={product.variants?.length > 0 && !selectedVariant}
                            className={`w-full py-6 rounded-[2.5rem] flex items-center justify-center gap-4 text-xl font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl group ${
                                (product.variants?.length > 0 && !selectedVariant)
                                    ? 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
                                    : 'bg-gold text-charcoal hover:scale-[1.02] active:scale-95 shadow-gold/30'
                            }`}
                        >
                            <ShoppingCart className={`w-6 h-6 ${(product.variants?.length > 0 && !selectedVariant) ? '' : 'group-hover:rotate-12 transition-transform'}`} />
                            Add to Cart
                        </button>

                        <div className="flex justify-center items-center gap-6 py-4">
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-gold/40 animate-pulse"></div> Instant Prep
                            </div>
                            <div className="w-px h-4 bg-white/10"></div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-gold/40 animate-pulse"></div> Priority Delivery
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProductDetail;

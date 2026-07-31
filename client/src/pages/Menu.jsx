import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProducts } from '../services/menuService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ShoppingCart, Heart, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { dispatch } = useCart();
  const { user: profile, isSignedIn, updateProfile } = useAuth();
  const { siteUpdate } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  // Refs and state for category scroll
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const mood = useMemo(() => new URLSearchParams(location.search).get('mood'), [location.search]);

  // Fetch products, categories, deals
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = mood ? { mood } : {};
        const data = await getProducts(params);
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (response.ok) {
          const data = await response.json();
          const categoryNames = Array.isArray(data)
            ? data.map(cat => typeof cat === 'string' ? cat : cat.name)
            : [];
          setCategories(categoryNames);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      }
    };

    const fetchDeals = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/deals?isActive=true`);
        if (response.ok) {
          const data = await response.json();
          setDeals(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch deals:', error);
      }
    };

    fetchProducts();
    fetchCategories();
    fetchDeals();
  }, [mood]);

  // Socket updates
  useEffect(() => {
    if (siteUpdate?.type === 'menuUpdate') {
      const fetchProducts = async () => {
        const data = await getProducts();
        if (data && data.length > 0) setProducts(data);
      };
      fetchProducts();
    }

    if (siteUpdate?.type === 'categoryAdded' || siteUpdate?.type === 'categoryUpdated' || siteUpdate?.type === 'categoryDeleted') {
      const fetchCategories = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/categories`);
          if (response.ok) {
            const data = await response.json();
            const categoryNames = Array.isArray(data)
              ? data.map(cat => typeof cat === 'string' ? cat : cat.name)
              : [];
            setCategories(categoryNames);
          }
        } catch (error) {
          console.error('Failed to fetch categories:', error);
        }
      };
      fetchCategories();
    }
  }, [siteUpdate]);

  // Scroll arrow visibility
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories]);

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Cart / favorite handlers
  const addToCartHandler = (product, quantity = 1, e, finalOptions = []) => {
    if (e) e.stopPropagation();
    const optionsPrice = finalOptions.reduce((acc, opt) => acc + opt.price, 0);
    const cartPrice = product.price + optionsPrice;
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        ...product,
        product: product._id,
        price: cartPrice,
        qty: quantity,
        selectedOptions: finalOptions,
      },
    });
    toast.success(`${product.name} added!`, {
      icon: '🛒',
      duration: 3000,
    });
  };

  const toggleFavoriteHandler = async (productId, e) => {
    if (e) e.stopPropagation();
    if (!isSignedIn) {
      toast.error('Sign in to save favorites');
      return;
    }
    try {
      const isFavorite = profile?.favorites?.includes(productId);
      const newFavorites = isFavorite
        ? profile.favorites.filter((id) => id !== productId)
        : [...(profile.favorites || []), productId];
      await updateProfile({ favorites: newFavorites });
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites', { icon: '❤️' });
    } catch (error) {
      // handled by context
    }
  };

  const getDealForProduct = (productId, category) => {
    return deals.find(
      (deal) =>
        (deal.productId && (deal.productId._id === productId || deal.productId === productId)) ||
        (deal.category === category && !deal.productId)
    );
  };

  const categoryList = ['All', ...categories];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      {mood && (
        <div className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <p className="text-gold font-black uppercase tracking-[0.4em] text-[10px] mb-2">Tailored Selection</p>
          <h1 className="text-4xl md:text-6xl font-serif font-black text-white tracking-tighter">
            Recommended <span className="text-gold">for you</span>
          </h1>
          <button
            onClick={() => navigate('/menu')}
            className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-gold transition-colors underline underline-offset-8"
          >
            Clear mood filter
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 mb-8 md:mb-12 items-center justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50 w-5 h-5" />
          <input
            type="text"
            placeholder="Search food or drinks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-gold/20 rounded-2xl py-3.5 md:py-4 pl-12 pr-6 focus:border-gold outline-none text-white transition-all placeholder:text-gray-500 shadow-inner text-sm md:text-base"
          />
        </div>

        {/* Categories – scrollable with fade overlay */}
        <div className="relative w-full lg:w-auto max-w-full lg:max-w-xl">
          {/* Scrollable container */}
          <div
            ref={scrollContainerRef}
            className="flex flex-nowrap gap-2 md:gap-3 overflow-x-auto scroll-smooth no-scrollbar py-1 px-6 lg:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categoryList.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-2.5 md:py-3 rounded-2xl transition-all font-black text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap flex-shrink-0 ${
                  activeCategory === cat
                    ? 'bg-gold text-charcoal shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-105 border-transparent'
                    : 'bg-white/5 text-gray-400 hover:text-gold border border-white/5 hover:border-gold/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right fade overlay – appears only when there is overflow */}
          {showRightArrow && (
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-charcoal via-charcoal/80 to-transparent pointer-events-none z-5" />
          )}

          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-charcoal/80 backdrop-blur-sm border border-gold/30 text-gold hover:bg-gold hover:text-charcoal transition-all shadow-lg z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-charcoal/80 backdrop-blur-sm border border-gold/30 text-gold hover:bg-gold hover:text-charcoal transition-all shadow-lg z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch min-h-[500px]">
          {filteredProducts.map((product) => {
            const isFav = profile?.favorites?.includes(product._id);
            const deal = getDealForProduct(product._id, product.category);
            let discountedPrice = product.price;
            if (deal) {
              if (deal.discountPercentage > 0) {
                discountedPrice = product.price - product.price * (deal.discountPercentage / 100);
              } else if (deal.discountAmount > 0) {
                discountedPrice = product.price - deal.discountAmount;
              }
              discountedPrice = Math.max(0, discountedPrice);
            }

            return (
              <div
                key={product._id}
                onClick={() => navigate(`/menu/${product._id}`)}
                className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-gold/40 group transition-all duration-700 transform hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative cursor-pointer flex flex-col h-full"
              >
                <div className="h-64 overflow-hidden relative shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent opacity-80"></div>

                  <button
                    onClick={(e) => toggleFavoriteHandler(product._id, e)}
                    className={`absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-2xl backdrop-blur-xl transition-all duration-300 ${
                      isFav
                        ? 'bg-white/10 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : 'bg-charcoal/60 text-white hover:text-red-400 border border-white/10'
                    }`}
                  >
                    {isFav ? (
                      <span className="text-lg leading-none drop-shadow-md transform hover:scale-110 transition-transform">
                        ❤️
                      </span>
                    ) : (
                      <Heart className="w-4 h-4" />
                    )}
                  </button>

                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {deal && (
                      <div className="bg-gold text-charcoal px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg border border-gold/50 whitespace-nowrap">
                        {deal.discountPercentage > 0
                          ? `${deal.discountPercentage}% OFF`
                          : `Rs. ${deal.discountAmount} OFF`}
                      </div>
                    )}
                    {product.isBestSeller && (
                      <div className="bg-gold text-charcoal px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg border border-white/10">
                        Popular
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div
                      className={`w-3 h-3 border-2 rounded-sm flex items-center justify-center ${
                        product.isVegetarian ? 'border-green-500' : 'border-red-500'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          product.isVegetarian ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      ></div>
                    </div>
                    <div className="text-white/50 text-[10px] font-medium">
                      {product.preparationTime} mins
                    </div>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-serif font-bold text-white group-hover:text-gold transition-colors leading-tight">
                      {product.name}
                    </h3>
                    <div className="flex flex-col items-end">
                      {deal ? (
                        <>
                          <span className="text-gray-500 font-bold text-xs line-through shrink-0">
                            Rs. {product.price}
                          </span>
                          <span className="text-gold font-black text-lg tracking-tighter shrink-0">
                            Rs {Math.round(discountedPrice)}
                          </span>
                        </>
                      ) : (
                        <span className="text-gold font-black text-lg tracking-tighter shrink-0">
                          Rs {product.price}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed font-medium">
                    "{product.description}"
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {product.dietaryInfo?.map((info) => (
                      <span
                        key={info}
                        className="px-2 py-0.5 bg-gold/10 border border-gold/20 text-gold text-[8px] font-black uppercase tracking-widest rounded-md"
                      >
                        {info}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      if (product.hasVariants && product.variants?.length > 0) {
                        e.stopPropagation();
                        navigate(`/menu/${product._id}`);
                      } else {
                        addToCartHandler({ ...product, price: Math.round(discountedPrice) }, 1, e, []);
                      }
                    }}
                    className="mt-auto w-full flex items-center justify-between bg-white/5 hover:bg-gold/10 border border-white/5 group-hover:border-gold/30 hover:border-gold/50 px-5 py-3.5 rounded-2xl transition-all duration-300 group/btn"
                  >
                    <span className="text-sm font-black uppercase tracking-widest text-white/40 group-hover/btn:text-gold transition-colors">
                      Add to Cart
                    </span>
                    <ShoppingCart className="w-4 h-4 text-gold/40 group-hover/btn:text-gold group-hover/btn:scale-110 transition-all" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-white/5 rounded-[3rem] border border-white/5">
          <Filter className="w-16 h-16 text-gold/20 mx-auto mb-6" />
          <h2 className="text-2xl font-serif text-white mb-2">No food found</h2>
          <p className="text-gray-500">Try searching something else</p>
          <button
            onClick={() => {
              setActiveCategory('All');
              setSearchQuery('');
            }}
            className="mt-6 text-gold underline underline-offset-4 hover:text-white transition-colors"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] overflow-hidden">
    <div className="h-64 bg-white/[0.05]" />
    <div className="p-6 space-y-4">
      <div className="h-5 bg-white/[0.05] rounded-lg w-1/2" />
      <div className="h-4 bg-white/[0.05] rounded-lg w-full" />
      <div className="h-12 bg-white/[0.05] rounded-2xl w-full mt-4" />
    </div>
  </div>
);

export default Menu;
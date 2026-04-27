import { Link } from 'react-router-dom';
import { ArrowRight, Coffee, Utensils, Pizza, Cake, RotateCcw, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserOrderHistory } from '../services/orderService';
import useReorder from '../hooks/useReorder';
import { useState, useEffect } from 'react';

const Home = () => {
  const { isSignedIn } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const { handleReorder, reordering } = useReorder();

  // Lazy-load recent orders for signed-in users
  useEffect(() => {
    if (isSignedIn) {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const data = await getUserOrderHistory();
          setRecentOrders((data.orders || []).slice(0, 3));
        } catch (err) {
          console.error('Failed to load recent orders:', err);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [isSignedIn]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight">
            Exquisite Taste, <br />
            <span className="text-gold">Premium Experience</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Order your favorite food easily and quickly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu" className="btn-primary flex items-center justify-center gap-2 text-lg">
              Menu <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/cart" className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-md font-bold hover:bg-white/20 transition-all border border-white/20">
              Order Now
            </Link>
          </div>
        </div>
      </section>

      {/* Reorder Your Favorites Section */}
      {isSignedIn && (
        <section className="py-16 bg-charcoal px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px bg-gold/20 flex-1"></div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-center flex items-center gap-3">
                <RotateCcw className="w-7 h-7 text-gold" />
                <span>Reorder Your <span className="text-gold">Favorites</span></span>
              </h2>
              <div className="h-px bg-gold/20 flex-1"></div>
            </div>

            {loadingOrders ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 bg-white/[0.03] rounded-3xl animate-pulse border border-white/5" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No previous orders to reorder. <Link to="/menu" className="text-gold font-bold hover:underline">Browse the menu</Link></p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-gold/20 rounded-3xl p-6 transition-all duration-300 group backdrop-blur-sm"
                  >
                    {/* Item thumbnails */}
                    <div className="flex gap-2 mb-4">
                      {order.orderItems.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                          <img src={item.currentImage || item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {order.orderItems.length > 4 && (
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-400 font-black shrink-0">
                          +{order.orderItems.length - 4}
                        </div>
                      )}
                    </div>

                    {/* Order info */}
                    <div className="mb-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/50 mb-1">
                        {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-400 mt-1 truncate">
                        {order.orderItems.map(i => i.name).join(', ')}
                      </p>
                      <p className="text-lg font-bold text-gold mt-2">Rs. {order.totalPrice?.toFixed(0)}</p>
                    </div>

                    {/* Availability indicators */}
                    {order.orderItems.some(i => !i.isAvailable) && (
                      <p className="text-[10px] text-crimson/70 font-bold mb-3 uppercase tracking-widest">
                        ⚠ Some items may be unavailable
                      </p>
                    )}

                    {/* Reorder button */}
                    <button
                      onClick={() => handleReorder(order._id)}
                      disabled={reordering}
                      className="w-full flex items-center justify-center gap-2 bg-gold/10 hover:bg-gold hover:text-charcoal border border-gold/20 hover:border-gold text-gold px-4 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                      {reordering ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                      Reorder
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-20 bg-charcoal px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 underline decoration-gold underline-offset-8">
            Our Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <CategoryCard icon={<Coffee className="w-10 h-10" />} title="Drinks" color="bg-gold" />
            <CategoryCard icon={<Utensils className="w-10 h-10" />} title="Food" color="bg-crimson" />
            <CategoryCard icon={<Pizza className="w-10 h-10" />} title="Dishes" color="bg-gold" />
            <CategoryCard icon={<Cake className="w-10 h-10" />} title="Sweets" color="bg-crimson" />
          </div>
        </div>
      </section>
    </div>
  );
};

const CategoryCard = ({ icon, title, color }) => (
  <div className="flex flex-col items-center p-8 rounded-xl bg-white/5 border border-white/10 hover:border-gold group cursor-pointer transition-all">
    <div className={`${color} p-4 rounded-full mb-4 group-hover:scale-110 transition-transform text-charcoal shadow-lg shadow-gold/20`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold group-hover:text-gold transition-colors">{title}</h3>
  </div>
);

export default Home;

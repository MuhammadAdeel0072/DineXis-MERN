import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Utensils, ShoppingBag, Calendar, CreditCard, Users, LogOut } from 'lucide-react';
import { SignOutButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const menuItems = [
    { title: 'Dashboard', path: '/', icon: LayoutDashboard },
    { title: 'Menu', path: '/menu', icon: Utensils },
    { title: 'Orders', path: '/orders', icon: ShoppingBag },
    { title: 'Reservations', path: '/reservations', icon: Calendar },
    { title: 'Payments', path: '/payments', icon: CreditCard },
    { title: 'Users', path: '/users', icon: Users },
  ];

  return (
    <motion.aside 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-72 glass border-r border-white/5 flex flex-col h-full z-50 shadow-2xl"
    >
      <div className="p-8 border-b border-white/5">
        <h1 className="text-3xl font-serif font-black tracking-tighter text-gold italic">
          AK-7 <span className="text-soft-white not-italic font-sans text-xs ml-1 tracking-widest opacity-50">REST</span>
        </h1>
      </div>
      
      <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gold/10 text-gold border border-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                  : 'text-soft-white/60 hover:bg-white/5 hover:text-soft-white border border-transparent'
              }`
            }
          >
            <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110`} />
            <span className="font-semibold tracking-wide">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <SignOutButton>
          <button className="flex items-center space-x-4 w-full px-5 py-4 text-crimson hover:bg-crimson/5 rounded-xl transition-all duration-300 group border border-transparent hover:border-crimson/20">
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-bold tracking-wider">LOGOUT</span>
          </button>
        </SignOutButton>
      </div>
    </motion.aside>
  );
};

export default Sidebar;

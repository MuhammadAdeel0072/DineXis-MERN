import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationTray from './NotificationTray';
import { socket } from '../services/api';
import { useEffect, useState } from 'react';
import { Menu as MenuIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    socket.emit('joinAdmin');
    socket.emit('joinKitchen');
    console.log('Admin tactical array active: Joined Admin & Kitchen nodes');
  }, []);

  return (
    <div className="flex h-screen bg-charcoal text-soft-white selection:bg-gold selection:text-charcoal overflow-hidden relative font-sans">
      {/* Absolute Admin Header Utilities */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-charcoal/50 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2.5 bg-white/5 border border-white/10 rounded-xl text-gold"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <NotificationTray />
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-gold leading-none pb-1">Operational Mode</p>
              <p className="text-xs font-bold text-soft-white/60">Executive Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-gold/30 bg-gold/10 flex items-center justify-center font-serif italic font-bold text-gold">
              AK
            </div>
          </div>
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.05),transparent)] relative mt-20 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

import React from 'react';
import { motion } from 'framer-motion';

export const Navbar: React.FC = () => {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur border-b border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent2 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-white">💰</span>
          </div>
          <span className="font-bold text-lg">ExpenseTracker</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="btn-ghost">Dashboard</button>
          <button className="btn-ghost">Analytics</button>
          <button className="btn-primary">Profile</button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;

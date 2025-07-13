import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Gamepad2, Trophy, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { currentUser, userData, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
      } catch (error) {
      console.error('Logout error:', error);
      }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center"
            >
              <Gamepad2 className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-white">FactBuster</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            {isAuthenticated && (
              <Link
                to="/categories"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/categories') 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            )}
            
            <Link
              to="/leaderboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/leaderboard') 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </Link>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-white/70 hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
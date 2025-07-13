import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Users, 
  Gamepad2, 
  ArrowLeft, 
  Star,
  Zap,
  Trophy,
  Brain
} from 'lucide-react';

const ComingSoon = () => {
  const navigate = useNavigate();
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check if user is a guest (no token or user data)
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const guestUsername = sessionStorage.getItem('guestUsername');
    
    if (!token && !userData && guestUsername) {
      setIsGuest(true);
    }
  }, []);

  const handleBackToCategories = () => {
    navigate('/categories');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={isGuest ? handleBackToHome : handleBackToCategories}
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{isGuest ? 'Back to Home' : 'Back to Categories'}</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Coming Soon</h1>
              <p className="text-white/70">Exciting features are on the way!</p>
            </div>
            
            <div className="flex items-center space-x-2 text-white/70">
              <Clock className="w-5 h-5" />
              <span>Stay Tuned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <Users className="w-16 h-16 text-white" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl font-bold text-white mb-6"
          >
            Multiplayer Features
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4"
          >
            Coming Soon!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-white/80 max-w-2xl mx-auto mb-8"
          >
            We're working hard to bring you an amazing multiplayer experience. 
            Challenge your friends, compete in real-time, and climb the leaderboards together!
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {/* Real-time Multiplayer */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Multiplayer</h3>
            <p className="text-white/70 text-sm">Play with friends in real-time with live updates and instant feedback.</p>
          </div>

          {/* Room Creation */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <Gamepad2 className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Game Rooms</h3>
            <p className="text-white/70 text-sm">Create private rooms and invite friends with unique room codes.</p>
          </div>

          {/* Leaderboards */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Live Leaderboards</h3>
            <p className="text-white/70 text-sm">See real-time rankings and compete for the top spot.</p>
          </div>

          {/* Chat System */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">In-Game Chat</h3>
            <p className="text-white/70 text-sm">Communicate with your teammates during gameplay.</p>
          </div>

          {/* Custom Categories */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Custom Categories</h3>
            <p className="text-white/70 text-sm">Create and share your own fact categories with friends.</p>
          </div>

          {/* Tournaments */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Tournaments</h3>
            <p className="text-white/70 text-sm">Compete in organized tournaments with prizes and rankings.</p>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">What You Can Do Now</h3>
            <p className="text-white/80 mb-6">
              While we're building multiplayer features, you can still enjoy our amazing solo gameplay experience!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={isGuest ? handleBackToHome : handleBackToCategories}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center"
              >
                <Gamepad2 className="w-5 h-5 mr-2" />
                {isGuest ? 'Back to Home' : 'Play Solo Games'}
              </button>
              
              {!isGuest && (
                <button
                  onClick={handleBackToDashboard}
                  className="bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </button>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Clock className="w-6 h-6 text-yellow-400" />
              <span className="text-white font-semibold">Development Progress</span>
            </div>
            
            <div className="w-full bg-white/20 rounded-full h-3 mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "65%" }}
                transition={{ duration: 2, delay: 0.8 }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
              />
            </div>
            
            <p className="text-white/70 text-sm">
              Multiplayer features are 65% complete. We're working hard to bring you the best experience!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon; 
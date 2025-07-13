import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, Construction } from 'lucide-react';

const Leaderboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto px-6"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="relative">
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
            <Construction className="w-8 h-8 text-orange-400 absolute -top-2 -right-2" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Leaderboard
        </motion.h1>

        {/* Coming Soon Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Coming Soon! 🚀
          </h2>
          <p className="text-white/70 text-lg mb-6">
            We're working hard to bring you an amazing leaderboard experience. 
            Soon you'll be able to compete with players worldwide and track your progress!
          </p>
          
          {/* Features Preview */}
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3 text-white/80">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>Global Rankings</span>
            </div>
            <div className="flex items-center space-x-3 text-white/80">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>Real-time Updates</span>
            </div>
            <div className="flex items-center space-x-3 text-white/80">
              <Construction className="w-5 h-5 text-orange-400" />
              <span>Advanced Statistics</span>
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => window.history.back()}
          className="mt-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
        >
          Go Back
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Leaderboard; 
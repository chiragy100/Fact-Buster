import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Target } from 'lucide-react';

const StreakProgressBar = ({ streakData, categoryName }) => {
  const { longestStreak = 0, currentStreak = 0, totalCorrect = 0, totalAttempts = 0 } = streakData;
  
  // Calculate accuracy percentage
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  
  // Determine progress bar color based on streak length
  const getProgressColor = (streak) => {
    if (streak >= 20) return 'from-red-500 to-orange-500';
    if (streak >= 15) return 'from-orange-500 to-yellow-500';
    if (streak >= 10) return 'from-yellow-500 to-green-500';
    if (streak >= 5) return 'from-green-500 to-blue-500';
    return 'from-blue-500 to-purple-500';
  };
  
  // Calculate progress percentage (max at 20 for visual purposes)
  const progressPercentage = Math.min((longestStreak / 20) * 100, 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-white/80 text-sm font-medium">Longest Streak</span>
        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-white font-semibold text-sm">{longestStreak}</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${getProgressColor(longestStreak)} rounded-full`}
        />
      </div>
      
      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs text-white/60">
        <div className="flex items-center space-x-1">
          <Target className="w-3 h-3" />
          <span>Current: {currentStreak}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>Accuracy: {accuracy}%</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>{totalCorrect}/{totalAttempts}</span>
        </div>
      </div>
      
      {/* Streak Milestone Indicator */}
      {longestStreak > 0 && (
        <div className="mt-2 flex items-center justify-center">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            longestStreak >= 20 ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
            longestStreak >= 15 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
            longestStreak >= 10 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
            longestStreak >= 5 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
            'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          }`}>
            {longestStreak >= 20 ? '🔥 Legendary' :
             longestStreak >= 15 ? '⚡ Master' :
             longestStreak >= 10 ? '🏆 Expert' :
             longestStreak >= 5 ? '⭐ Skilled' :
             '🎯 Beginner'}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StreakProgressBar; 
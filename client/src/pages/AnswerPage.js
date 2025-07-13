import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, Home, RotateCcw, Flame, ArrowLeft, Trophy, Brain, User } from 'lucide-react';

const AnswerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { 
    isCorrect, 
    fact, 
    explanation, 
    score, 
    totalFacts, 
    category,
    currentStreak = 0,
    longestStreak = 0,
    streakHistory = [],
    gameOver = false,
    factNumber = 1,
    username = 'Guest'
  } = location.state || {};

  useEffect(() => {
    if (score !== undefined && totalFacts !== undefined) {
      const storedUsername = sessionStorage.getItem('guestUsername');
      const gameSessionData = {
        username: storedUsername || 'Guest',
        score,
        totalFacts,
        category: category || 'General Knowledge',
        timestamp: new Date().toISOString(),
        isGuest: true,
        longestStreak: longestStreak || 0,
        currentStreak: currentStreak || 0,
        streakHistory: streakHistory || []
      };
      sessionStorage.setItem('gameSession', JSON.stringify(gameSessionData));
    }
  }, [score, totalFacts, category, longestStreak, currentStreak, streakHistory]);

  const handlePlayAgain = () => {
    // Set flag to refresh streaks when returning to categories
    sessionStorage.setItem('returningFromGame', 'true');
    
    // Always go to categories page (handles both authenticated and guest users)
    navigate('/categories');
  };

  const handleGoHome = () => {
    // Set flag to refresh streaks when returning to categories
    sessionStorage.setItem('returningFromGame', 'true');
    
    if (isAuthenticated) {
      // For authenticated users, go to their dashboard (categories page)
      navigate('/categories');
    } else {
      // For guest users, go to home page
      navigate('/');
    }
  };

  const handleContinueGame = () => {
    navigate('/solo-game', {
      state: {
        returningFromAnswer: true,
        currentFact: location.state.nextFactIndex,
        score: score,
        currentStreak: currentStreak,
        longestStreak: longestStreak,
        streakHistory: streakHistory
      }
    });
  };

  const handleBackToGame = () => {
    navigate('/solo-game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToGame}
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Game</span>
              </button>
            </div>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Answer Result</h1>
              <div className="flex items-center justify-center space-x-4 text-white/70 text-sm">
                <div className="flex items-center space-x-1">
                  <Brain className="w-4 h-4" />
                  <span>Fact {factNumber}/{totalFacts}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="w-4 h-4" />
                  <span>Score: {score || 0}</span>
                </div>
                {currentStreak > 0 && (
                  <div className="flex items-center space-x-1 text-orange-400">
                    <Flame className="w-4 h-4" />
                    <span>Streak: {currentStreak}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-white/70">
              {isAuthenticated ? (
                <>
                  <User className="w-5 h-5" />
                  <span>Account</span>
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5" />
                  <span>Guest Mode</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-white/20">
            {/* Result Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              {isCorrect ? (
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <XCircle className="w-12 h-12 text-white" />
                </div>
              )}
            </motion.div>

            {/* Result Text */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-4xl font-bold mb-6 ${
                isCorrect ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isCorrect ? 'Correct!' : 'Incorrect!'}
            </motion.h2>

            {/* Fact Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <div className="bg-white/5 rounded-xl p-6 mb-4">
                <p className="text-lg text-white/90 leading-relaxed font-medium">
                  "{fact}"
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-6">
                <p className="text-white/80">
                  <span className="font-semibold text-white">Explanation:</span> {explanation}
                </p>
              </div>
            </motion.div>

            {/* Score and Streak Display */}
            {score !== undefined && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <div className="bg-white/5 rounded-xl p-6">
                  <p className="text-xl text-white/90 mb-3">
                    Your score: <span className="font-bold text-blue-300">{score}/{totalFacts}</span>
                  </p>
                  {longestStreak > 0 && (
                    <div className="flex items-center justify-center space-x-6">
                      <div className="flex items-center space-x-2 text-orange-400">
                        <Flame className="w-5 h-5" />
                        <span className="font-semibold">Longest Streak: {longestStreak}</span>
                      </div>
                      {currentStreak > 0 && (
                        <div className="flex items-center space-x-2 text-green-400">
                          <Flame className="w-5 h-5" />
                          <span className="font-semibold">Current Streak: {currentStreak}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Game Over Message */}
            {gameOver && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-6"
              >
                <div className="bg-white/5 border border-white/20 rounded-xl p-6">
                  <p className="text-white font-semibold text-lg mb-2">
                    {isCorrect ? '🎉 Congratulations! You completed all facts!' : '💥 Game Over! Better luck next time!'}
                  </p>
                  {longestStreak > 0 && (
                    <p className="text-white/80">
                      Your longest streak was <span className="font-bold text-orange-400">{longestStreak}</span> consecutive correct answers!
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {!gameOver && isCorrect && (
                <button
                  onClick={handleContinueGame}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                >
                  <CheckCircle className="w-5 h-5" />
                  Continue Game
                </button>
              )}
              <button
                onClick={handlePlayAgain}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
              >
                <RotateCcw className="w-5 h-5" />
                Play Again
              </button>
              <button
                onClick={handleGoHome}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                {isAuthenticated ? 'Go to Dashboard' : 'Go Home'}
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnswerPage; 
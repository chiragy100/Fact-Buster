import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Trophy, 
  Target, 
  Clock, 
  Flame, 
  Gamepad2,
  Settings,
  LogOut,
  User,
  Star,
  TrendingUp,
  Calendar,
  CheckCircle,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userData, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinMessage, setJoinMessage] = useState(null);

  useEffect(() => {
    // Check for join message from multiplayer game
    if (location.state?.message) {
      setJoinMessage(location.state);
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }

    if (authLoading) {
      return; // Wait for auth to load
    }

    if (isAuthenticated && currentUser) {
      // User is authenticated
      const displayName = currentUser.displayName || userData?.username || 'User';
      const authenticatedUser = {
        username: displayName,
        isGuest: false,
        stats: userData?.stats || {
          gamesPlayed: 0,
          totalAnswers: 0,
          correctAnswers: 0,
          totalScore: 0,
          bestStreak: 0
        }
      };
      setUser(authenticatedUser);
      setLoading(false);
    } else {
      // For guest users, create a mock user object
      const guestUsername = location.state?.username || sessionStorage.getItem('guestUsername') || 'Guest';
      
      // Store guest username in sessionStorage if it came from location state
      if (location.state?.username && !sessionStorage.getItem('guestUsername')) {
        sessionStorage.setItem('guestUsername', location.state.username);
      }
      
      const guestUser = {
        username: guestUsername,
        isGuest: true,
        stats: {
          gamesPlayed: 0,
          totalAnswers: 0,
          correctAnswers: 0,
          totalScore: 0,
          bestStreak: 0
        }
      };
      setUser(guestUser);
      setLoading(false);
    }
  }, [navigate, location.state, isAuthenticated, currentUser, userData, authLoading]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const handleGuestLogout = () => {
    toast.success('Returning to home page');
    navigate('/');
  };

  const handleStartGame = () => {
    navigate('/categories');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const accuracy = user.stats.totalAnswers > 0 
    ? Math.round((user.stats.correctAnswers / user.stats.totalAnswers) * 100) 
    : 0;

  const averageScore = user.stats.gamesPlayed > 0 
    ? Math.round(user.stats.totalScore / user.stats.gamesPlayed) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">FactBuster</h1>
                <p className="text-white/70 text-sm">
                  {user.isGuest ? `Welcome, ${user.username}!` : `Welcome back, ${user.username}!`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!user.isGuest && (
                <button
                  onClick={handleViewProfile}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
              )}
              <button
                onClick={user.isGuest ? handleGuestLogout : handleLogout}
                className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{user.isGuest ? 'Exit' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Join Success Message */}
        {joinMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 mb-8"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Successfully Joined Game!</h3>
                <p className="text-white/80">{joinMessage.message}</p>
                {joinMessage.roomCode && (
                  <div className="mt-2 flex items-center space-x-2">
                    <Users className="w-4 h-4 text-white/60" />
                    <span className="text-white/60 text-sm">Room Code: {joinMessage.roomCode}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setJoinMessage(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            {user.isGuest ? 'Welcome to FactBuster!' : 'Welcome to Your Dashboard'}
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            {user.isGuest 
              ? 'Ready to test your knowledge? Choose a category and start your fact-checking journey!'
              : 'Ready to test your knowledge? Choose a category and start your fact-checking journey!'
            }
          </p>
        </motion.div>

        {/* Quick Stats */}
        {!user.isGuest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-2xl font-bold text-white">{user.stats.gamesPlayed}</span>
              </div>
              <h3 className="text-white/80 font-medium">Games Played</h3>
              <p className="text-white/60 text-sm">Total sessions</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-2xl font-bold text-white">{accuracy}%</span>
              </div>
              <h3 className="text-white/80 font-medium">Accuracy</h3>
              <p className="text-white/60 text-sm">Correct answers</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-2xl font-bold text-white">{user.stats.totalScore}</span>
              </div>
              <h3 className="text-white/80 font-medium">Total Score</h3>
              <p className="text-white/60 text-sm">Points earned</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-400" />
                </div>
                <span className="text-2xl font-bold text-white">{user.stats.bestStreak}</span>
              </div>
              <h3 className="text-white/80 font-medium">Best Streak</h3>
              <p className="text-white/60 text-sm">Consecutive correct</p>
            </div>
          </motion.div>
        )}

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
        >
          {/* Start Game Card */}
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Start Playing</h3>
                <p className="text-white/70">Choose your category and begin</p>
              </div>
            </div>
            
            <p className="text-white/80 mb-6">
              Test your knowledge across various categories including General Knowledge, 
              Science, History, and more. Challenge yourself and improve your fact-checking skills!
            </p>
            
            <button
              onClick={handleStartGame}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center"
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              Choose Category & Play
            </button>
          </div>

          {/* Multiplayer Card */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Multiplayer</h3>
                <p className="text-white/70">Play with friends</p>
              </div>
            </div>
            
            <p className="text-white/80 mb-6">
              Challenge your friends in real-time multiplayer games! Create rooms, 
              join games, and compete on leaderboards together.
            </p>
            
            <button
              onClick={() => navigate('/coming-soon')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center"
            >
              <Users className="w-5 h-5 mr-2" />
              Coming Soon
            </button>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {user.isGuest ? 'Get Started' : 'Your Progress'}
                </h3>
                <p className="text-white/70">
                  {user.isGuest ? 'Start your fact-checking journey' : 'Track your improvement'}
                </p>
              </div>
            </div>
            
            {user.isGuest ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Account Type</span>
                  <span className="text-white font-semibold">Guest</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Games Played</span>
                  <span className="text-white font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Total Score</span>
                  <span className="text-white font-semibold">0 pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Best Streak</span>
                  <span className="text-white font-semibold">0</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Average Score</span>
                  <span className="text-white font-semibold">{averageScore} pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Total Answers</span>
                  <span className="text-white font-semibold">{user.stats.totalAnswers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Correct Answers</span>
                  <span className="text-white font-semibold">{user.stats.correctAnswers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Member Since</span>
                  <span className="text-white font-semibold">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Quick Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 p-4 rounded-lg transition-colors text-left"
            >
              <Trophy className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-white font-medium">View Leaderboard</p>
                <p className="text-white/60 text-sm">See global rankings</p>
              </div>
            </button>
            
            {!user.isGuest && (
              <button
                onClick={handleViewProfile}
                className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 p-4 rounded-lg transition-colors text-left"
              >
                <Settings className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-white font-medium">Edit Profile</p>
                  <p className="text-white/60 text-sm">Update preferences</p>
                </div>
              </button>
            )}
            
            <button
              onClick={handleStartGame}
              className="flex items-center space-x-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 p-4 rounded-lg transition-colors text-left"
            >
              <Star className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-white font-medium">Play Now</p>
                <p className="text-white/60 text-sm">Start a new game</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 
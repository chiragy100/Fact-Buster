import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Users, 
  Trophy, 
  Target,
  CheckCircle,
  XCircle,
  Play,
  X,
  UserPlus,
  LogIn
} from 'lucide-react';

const Home = () => {
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const navigate = useNavigate();

  // Record game session when returning home
  useEffect(() => {
    const gameSession = sessionStorage.getItem('gameSession');
    if (gameSession) {
      const sessionData = JSON.parse(gameSession);
      // For now, just log the session data since we're using Firebase
      console.log('Game session data:', sessionData);
      // Clear session storage after logging
      sessionStorage.removeItem('gameSession');
    }
  }, []);

  const handleStartPlaying = () => {
    // Scroll to top of the screen
    window.scrollTo(0, 0);
    setShowUsernameModal(true);
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setUsernameError('Please enter a username');
      return;
    }
    
    if (username.trim().length < 2) {
      setUsernameError('Username must be at least 2 characters');
      return;
    }
    
    if (username.trim().length > 20) {
      setUsernameError('Username must be less than 20 characters');
      return;
    }
    
    // Store username in session storage
    sessionStorage.setItem('guestUsername', username.trim());
    
    // Close modal and navigate to categories
    setShowUsernameModal(false);
    setUsername('');
    setUsernameError('');
    navigate('/categories');
  };

  const handleCloseModal = () => {
    setShowUsernameModal(false);
    setUsername('');
    setUsernameError('');
  };

  // Landing page for guest users
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
              className="w-28 h-28 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin-slow"></div>
              <Brain className="w-14 h-14 text-white relative z-10" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-7xl md:text-8xl font-display-bold text-white mb-6 tracking-tight"
            >
              <span className="warm-gradient">
                FACT
              </span>
              <span className="cool-gradient ml-4">
                BUSTER
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-2xl md:text-3xl text-white/90 mb-12 max-w-4xl mx-auto font-body leading-relaxed"
            >
              <span className="font-display text-yellow-300">CHALLENGE YOUR MIND</span> by distinguishing between 
              <span className="font-display text-green-300"> REAL FACTS</span> and 
              <span className="font-display text-red-300"> FAKE FACTS (AI GENERATED)</span>. 
              <br />
              <span className="text-xl text-white/80 mt-2 block font-body">
                Compete solo or battle friends in real-time multiplayer showdowns!
              </span>
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8"
            >
              <motion.div 
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6, type: "spring", stiffness: 100 }}
                className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 group subtle-hover gentle-bounce"
              >
                <CheckCircle className="w-6 h-6 mr-3 text-green-400 group-hover:scale-110 transition-transform" />
                <span className="font-display text-green-300">REAL FACTS</span>
              </motion.div>
              <motion.div 
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.6, type: "spring", stiffness: 100 }}
                className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 group subtle-hover gentle-bounce"
              >
                <XCircle className="w-6 h-6 mr-3 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="font-display text-red-300">FAKE FACTS (AI GENERATED)</span>
              </motion.div>
              <motion.div 
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6, type: "spring", stiffness: 100 }}
                className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 group subtle-hover gentle-bounce"
              >
                <Target className="w-6 h-6 mr-3 text-yellow-400 group-hover:scale-110 transition-transform" />
                <span className="font-display text-yellow-300">TEST YOUR SKILLS</span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="flex justify-center"
            >
              <div className="flex items-center space-x-2 text-white/70 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live multiplayer battles</span>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                <span>Global leaderboards</span>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-600"></div>
                <span>Real-time scoring</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/5 backdrop-blur-sm py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display-bold text-white mb-4 warm-gradient">WHY CHOOSE FACT BUSTER?</h2>
            <p className="text-xl text-white/80 font-body">Experience the ultimate fact-checking challenge</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-heading text-white mb-4">SOLO CHALLENGE</h3>
              <p className="text-white/70 font-body">Test your knowledge alone with carefully curated facts from various categories. Track your progress and improve your accuracy.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-heading text-white mb-4">MULTIPLAYER BATTLES</h3>
              <p className="text-white/70 font-body">Compete with friends in real-time fact battles. See who can spot the fakes fastest and climb the leaderboard.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-heading text-white mb-4">LEADERBOARDS</h3>
              <p className="text-white/70 font-body">Compete globally and see how you rank against other fact-checkers. Earn achievements and track your progress.</p>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Call to Action Section */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display-bold text-white mb-4 cool-gradient">READY TO START?</h2>
            <p className="text-xl text-white/80 mb-8 font-body">Choose how you want to play Fact Buster</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Create Account */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-blue-500/30 transition-all duration-300 border border-white/20"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Create Account</h3>
              <p className="text-white/70 mb-6">Join FactBuster and unlock your personalized dashboard with progress tracking, achievements, and more!</p>
              
              <Link
                to="/signup"
                className="inline-block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
              >
                Sign Up Free
              </Link>
            </motion.div>

            {/* Sign In */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-green-500/30 transition-all duration-300 border border-white/20"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Sign In</h3>
              <p className="text-white/70 mb-6">Welcome back! Sign in to continue your fact-checking journey and access your personalized dashboard.</p>
              
              <Link
                to="/login"
                className="inline-block w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
              >
                Sign In
              </Link>
            </motion.div>

            {/* Play as Guest */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-orange-500/30 transition-all duration-300 border border-white/20"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Play as Guest</h3>
              <p className="text-white/70 mb-6">Jump right into the action without creating an account. Perfect for quick games and trying out the experience!</p>
              
              <button
                onClick={handleStartPlaying}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200"
              >
                Start Playing
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Username Modal */}
      {showUsernameModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-white/20"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Enter Your Username</h3>
              <button
                onClick={handleCloseModal}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUsernameSubmit}>
              <div className="mb-6">
                <label htmlFor="username" className="block text-white/80 mb-2 font-medium">
                  Choose a username for this session
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (usernameError) setUsernameError('');
                  }}
                  placeholder="Enter your username..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                  autoFocus
                />
                {usernameError && (
                  <p className="text-red-400 text-sm mt-2">{usernameError}</p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  Continue
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Home; 
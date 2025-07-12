import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Users, 
  Trophy, 
  Target,
  CheckCircle,
  XCircle,
  Play,
  Shield,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const { user, anonymousLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [anonymousUsername, setAnonymousUsername] = useState('');

  const handleAnonymousLogin = async (e) => {
    e.preventDefault();
    if (!anonymousUsername.trim()) {
      return;
    }
    
    setLoading(true);
    const result = await anonymousLogin(anonymousUsername);
    setLoading(false);
    
    if (result.success) {
      navigate('/');
    }
  };

  // If user is already logged in, show the dashboard
  if (user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome back, <span className="text-yellow-300">{user.username}</span>!
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Ready to test your fact-checking skills?
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8"
        >
          <Link
            to="/solo"
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Solo Challenge</h3>
            <p className="text-white/80 mb-6">Test your knowledge alone with a variety of facts</p>
            <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-8 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105">
              Start Solo Game
            </div>
          </Link>

          <Link
            to="/multiplayer"
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Multiplayer Battle</h3>
            <p className="text-white/80 mb-6">Compete with friends in real-time fact battles</p>
            <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-8 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105">
              Join Multiplayer
            </div>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Landing page for non-authenticated users
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
              className="text-7xl md:text-8xl font-black text-white mb-6 tracking-tight"
            >
              <span className="bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                Fact
              </span>
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent ml-4">
                Buster
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-2xl md:text-3xl text-white/90 mb-12 max-w-4xl mx-auto font-light leading-relaxed"
            >
              <span className="font-semibold text-yellow-300">Challenge your mind</span> by distinguishing between 
              <span className="font-semibold text-green-300"> real facts</span> and 
              <span className="font-semibold text-red-300"> fake facts (AI generated)</span>. 
              <br />
              <span className="text-xl text-white/80 mt-2 block">
                Compete solo or battle friends in real-time multiplayer showdowns!
              </span>
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8"
            >
              <div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                <CheckCircle className="w-6 h-6 mr-3 text-green-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Real Facts</span>
              </div>
              <div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                <XCircle className="w-6 h-6 mr-3 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Fake Facts (AI Generated)</span>
              </div>
              <div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                <Target className="w-6 h-6 mr-3 text-yellow-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Test Your Skills</span>
              </div>
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
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Fact Buster?</h2>
            <p className="text-xl text-white/80">Experience the ultimate fact-checking challenge</p>
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
              <h3 className="text-xl font-bold text-white mb-4">Solo Challenge</h3>
              <p className="text-white/70">Test your knowledge alone with carefully curated facts from various categories. Track your progress and improve your accuracy.</p>
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
              <h3 className="text-xl font-bold text-white mb-4">Multiplayer Battles</h3>
              <p className="text-white/70">Compete with friends in real-time fact battles. See who can spot the fakes fastest and climb the leaderboard.</p>
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
              <h3 className="text-xl font-bold text-white mb-4">Leaderboards</h3>
              <p className="text-white/70">Compete globally and see how you rank against other fact-checkers. Earn achievements and track your progress.</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Start?</h2>
            <p className="text-xl text-white/80 mb-8">Choose how you want to play Fact Buster</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Play as Guest */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/15 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Play as Guest</h3>
              <p className="text-white/70 mb-6">Jump right into the action without creating an account. Perfect for quick games!</p>
              
              <form onSubmit={handleAnonymousLogin} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter a username"
                  value={anonymousUsername}
                  onChange={(e) => setAnonymousUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  maxLength={20}
                />
                <button
                  type="submit"
                  disabled={loading || !anonymousUsername.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <LoadingSpinner /> : 'Start Playing'}
                </button>
              </form>
            </motion.div>

            {/* Sign Up */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/15 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Create Account</h3>
              <p className="text-white/70 mb-6">Save your progress, track statistics, and compete on leaderboards with a full account.</p>
              <Link
                to="/register"
                className="inline-block w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
              >
                Sign Up Free
              </Link>
            </motion.div>

            {/* Login */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/15 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Sign In</h3>
              <p className="text-white/70 mb-6">Welcome back! Continue your fact-checking journey and access your saved progress.</p>
              <Link
                to="/login"
                className="inline-block w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 
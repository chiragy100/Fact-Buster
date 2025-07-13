import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getAllUserStreaks, createTestStreakData, syncLocalDataToFirebase } from '../services/streakService';
import { diagnoseFirebase, checkFirestoreDatabase, testFirestoreOperations, getFirebaseProjectInfo } from '../services/firebaseDiagnostics';
import StreakProgressBar from '../components/StreakProgressBar';
import { 
  Brain, 
  Globe, 
  FlaskConical, 
  History, 
  Music, 
  Trophy, 
  Cpu, 
  Leaf,
  ArrowLeft,
  Play,
  User,
  Users,
  Plus,
  LogIn
} from 'lucide-react';

const Categories = () => {
  const navigate = useNavigate();
  const { currentUser, userData, isAuthenticated, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStreaks, setUserStreaks] = useState({});
  const [streaksLoading, setStreaksLoading] = useState(false);
  const [streaksLoaded, setStreaksLoaded] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);

  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth to load
    }

    console.log('Auth state:', { isAuthenticated, currentUser, userData, authLoading });

    if (isAuthenticated && currentUser) {
      // User is authenticated
      const displayName = currentUser.displayName || userData?.username || 'User';
      console.log('Setting authenticated username:', displayName);
      setUsername(displayName);
      setLoading(false);
    } else {
      // Check for guest username
      const storedUsername = sessionStorage.getItem('guestUsername');
      console.log('Guest username from sessionStorage:', storedUsername);
      if (!storedUsername) {
        // If no username, redirect back to home
        console.log('No username found, redirecting to home');
        navigate('/');
        return;
      }
      
      setUsername(storedUsername);
      setLoading(false);
    }
  }, [navigate, isAuthenticated, currentUser, userData, authLoading]);

  // Separate useEffect for loading streaks
  useEffect(() => {
    if (isAuthenticated && currentUser && !streaksLoaded && !streaksLoading) {
      console.log('Loading streaks for user:', currentUser.uid);
      loadUserStreaks();
    }
  }, [isAuthenticated, currentUser, streaksLoaded, streaksLoading]);

  // Force load streaks when component mounts for authenticated users
  useEffect(() => {
    if (isAuthenticated && currentUser && !streaksLoaded) {
      console.log('Force loading streaks on mount');
      loadUserStreaks();
    }
  }, [isAuthenticated, currentUser]);

  // Refresh streaks when returning from a game
  useEffect(() => {
    const checkForGameReturn = () => {
      // Check if user just returned from a game
      const returningFromGame = sessionStorage.getItem('returningFromGame');
      
      if (isAuthenticated && currentUser && returningFromGame) {
        console.log('User returned from game, refreshing streaks');
        refreshUserStreaks();
        
        // Clear the flag
        sessionStorage.removeItem('returningFromGame');
      }
    };

    checkForGameReturn();
  }, [isAuthenticated, currentUser]);

  const loadUserStreaks = async () => {
    if (!isAuthenticated || !currentUser || streaksLoaded) return;
    
    console.log('Starting to load streaks...');
    setStreaksLoading(true);
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Streak loading timeout - setting default data');
      setUserStreaks({});
      setStreaksLoaded(true);
      setStreaksLoading(false);
    }, 10000); // 10 second timeout
    
    try {
      const streaks = await getAllUserStreaks(currentUser.uid);
      clearTimeout(timeoutId);
      console.log('Loaded user streaks:', streaks);
      setUserStreaks(streaks);
      setStreaksLoaded(true);
      setIsOffline(false);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error loading user streaks:', error);
      
      if (error.message.includes('offline') || error.message.includes('network')) {
        setIsOffline(true);
        toast.error('Currently offline - using local data');
      } else {
        toast.error('Failed to load streak data');
      }
      
      // Set default empty streaks on error
      setUserStreaks({});
      setStreaksLoaded(true);
    } finally {
      setStreaksLoading(false);
    }
  };

  const refreshUserStreaks = async () => {
    if (!isAuthenticated || !currentUser) return;
    
    console.log('Refreshing user streaks...');
    setStreaksLoading(true);
    
    // Force a complete reload by resetting the loaded state
    setStreaksLoaded(false);
    
    try {
      const streaks = await getAllUserStreaks(currentUser.uid);
      console.log('Refreshed user streaks:', streaks);
      setUserStreaks(streaks);
      setStreaksLoaded(true);
      setIsOffline(false);
      
      // Show success message if streaks improved
      const currentCategory = sessionStorage.getItem('selectedCategory');
      if (currentCategory && streaks[currentCategory]) {
        const newStreak = streaks[currentCategory].longestStreak;
        const oldStreak = userStreaks[currentCategory]?.longestStreak || 0;
        
        if (newStreak > oldStreak) {
          toast.success(`🎉 New record! Your longest streak in ${currentCategory} is now ${newStreak}!`);
        }
      }
    } catch (error) {
      console.error('Error refreshing user streaks:', error);
      setStreaksLoaded(true);
      if (error.message.includes('offline') || error.message.includes('network')) {
        setIsOffline(true);
        toast.error('Currently offline - using local data');
      }
    } finally {
      setStreaksLoading(false);
    }
  };

  const handleSyncToFirebase = async () => {
    if (!isAuthenticated || !currentUser) return;
    
    console.log('Syncing local data to Firebase...');
    setSyncing(true);
    
    try {
      const success = await syncLocalDataToFirebase(currentUser.uid);
      if (success) {
        toast.success('✅ Data synced to Firebase successfully!');
        setIsOffline(false);
        // Refresh streaks after sync
        await refreshUserStreaks();
      } else {
        toast.error('❌ Failed to sync data - still offline');
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('❌ Sync failed - please check your connection');
    } finally {
      setSyncing(false);
    }
  };

  const handleRunDiagnostics = async () => {
    console.log('Running Firebase diagnostics...');
    
    try {
      const results = await diagnoseFirebase();
      setDiagnostics(results);
      
      if (results.errors.length > 0) {
        toast.error(`Found ${results.errors.length} issues - check console for details`);
        console.error('Firebase Diagnostics Errors:', results.errors);
      } else {
        toast.success('✅ Firebase diagnostics passed!');
      }
      
      // Also test specific operations
      const dbCheck = await checkFirestoreDatabase();
      const operations = await testFirestoreOperations();
      const projectInfo = getFirebaseProjectInfo();
      
      console.log('Database Check:', dbCheck);
      console.log('Operations Test:', operations);
      console.log('Project Info:', projectInfo);
      
    } catch (error) {
      console.error('Diagnostics failed:', error);
      toast.error('❌ Diagnostics failed');
    }
  };

  const categories = [
    {
      id: 'general',
      name: 'General Knowledge',
      description: 'Test your knowledge across various topics',
      icon: Brain,
      color: 'from-blue-500 to-cyan-500',
      hoverColor: 'from-blue-600 to-cyan-600',
      factCount: 50
    },
    {
      id: 'science',
      name: 'Science & Technology',
      description: 'Discover the wonders of science and tech',
      icon: FlaskConical,
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'from-purple-600 to-pink-600',
      factCount: 25
    },
    {
      id: 'history',
      name: 'History & Culture',
      description: 'Journey through time and civilizations',
      icon: History,
      color: 'from-yellow-500 to-orange-500',
      hoverColor: 'from-yellow-600 to-orange-600',
      factCount: 40
    },
    {
      id: 'geography',
      name: 'Geography & World',
      description: 'Explore the world and its wonders',
      icon: Globe,
      color: 'from-green-500 to-emerald-500',
      hoverColor: 'from-green-600 to-emerald-600',
      factCount: 35
    },
    {
      id: 'entertainment',
      name: 'Entertainment & Arts',
      description: 'Movies, music, and creative expressions',
      icon: Music,
      color: 'from-pink-500 to-rose-500',
      hoverColor: 'from-pink-600 to-rose-600',
      factCount: 30
    },
    {
      id: 'sports',
      name: 'Sports & Athletics',
      description: 'Test your sports knowledge',
      icon: Trophy,
      color: 'from-red-500 to-pink-500',
      hoverColor: 'from-red-600 to-pink-600',
      factCount: 25
    },
    {
      id: 'technology',
      name: 'Modern Technology',
      description: 'Latest tech trends and innovations',
      icon: Cpu,
      color: 'from-indigo-500 to-purple-500',
      hoverColor: 'from-indigo-600 to-purple-600',
      factCount: 30
    },
    {
      id: 'nature',
      name: 'Nature & Environment',
      description: 'Explore the natural world',
      icon: Leaf,
      color: 'from-teal-500 to-green-500',
      hoverColor: 'from-teal-600 to-green-600',
      factCount: 35
    }
  ];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    
    // Scroll down to the Start Game section after a short delay
    setTimeout(() => {
      const startGameSection = document.querySelector('[data-start-game]');
      if (startGameSection) {
        startGameSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  const handleStartGame = () => {
    if (selectedCategory) {
      // Store selected category in session storage
      sessionStorage.setItem('selectedCategory', selectedCategory.id);
      sessionStorage.setItem('selectedCategoryName', selectedCategory.name);
      
      // Navigate to solo game
      navigate('/solo-game');
    }
  };

  const handleCreateGame = () => {
    if (selectedCategory) {
      // Store selected category in session storage
      sessionStorage.setItem('selectedCategory', selectedCategory.id);
      sessionStorage.setItem('selectedCategoryName', selectedCategory.name);
      sessionStorage.setItem('gameMode', 'multiplayer');
      sessionStorage.setItem('gameRole', 'host');
      
      // Navigate to coming soon page
      navigate('/coming-soon');
    }
  };

  const handleJoinGame = () => {
    if (selectedCategory) {
      // Store selected category in session storage
      sessionStorage.setItem('selectedCategory', selectedCategory.id);
      sessionStorage.setItem('selectedCategoryName', selectedCategory.name);
      sessionStorage.setItem('gameMode', 'multiplayer');
      sessionStorage.setItem('gameRole', 'player');
      
      // Navigate to coming soon page
      navigate('/coming-soon');
    }
  };

  const handleBackToHome = () => {
    // Clear session data and go back to home for all users
    sessionStorage.removeItem('guestUsername');
    sessionStorage.removeItem('selectedCategory');
    sessionStorage.removeItem('selectedCategoryName');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToHome}
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
            </div>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">
                {isAuthenticated ? 'Your FactBuster Dashboard' : 'Choose Your Category'}
              </h1>
              <p className="text-white/70">
                {isAuthenticated ? `Welcome back, ${username}! Ready to challenge yourself?` : `Welcome, ${username}!`}
              </p>
              {isAuthenticated && (
                <div className="mt-2 space-x-2">
                  <button
                    onClick={refreshUserStreaks}
                    disabled={streaksLoading}
                    className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-2 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    {streaksLoading ? '⏳ Loading...' : '🔄 Refresh Streaks'}
                  </button>
                  {isOffline && (
                    <button
                      onClick={handleSyncToFirebase}
                      disabled={syncing}
                      className="text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 px-2 py-1 rounded transition-colors disabled:opacity-50"
                    >
                      {syncing ? '⏳ Syncing...' : '📡 Sync to Firebase'}
                    </button>
                  )}
                  <button
                    onClick={() => createTestStreakData(currentUser.uid)}
                    className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 px-2 py-1 rounded transition-colors"
                  >
                    🧪 Create Test Data
                  </button>
                  <button
                    onClick={handleRunDiagnostics}
                    className="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-2 py-1 rounded transition-colors"
                  >
                    🔍 Run Diagnostics
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 text-white/70">
              {isAuthenticated ? (
                <>
                  <User className="w-5 h-5" />
                  <span>Account</span>
                  {isOffline && (
                    <span className="text-orange-400 text-xs">(Offline)</span>
                  )}
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            {isAuthenticated ? 'Your Game Categories' : 'Select a Category'}
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {isAuthenticated 
              ? `Welcome to your personalized FactBuster dashboard, ${username}! Choose a category to start your fact-checking journey.`
              : 'Choose from our carefully curated categories. Each category contains a mix of real facts and AI-generated fake facts for you to identify.'
            }
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => {
            const isComingSoon = category.id !== 'general' && category.id !== 'science';
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => !isComingSoon && handleCategorySelect(category)}
                className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transition-all duration-300 relative ${
                  !isComingSoon ? 'cursor-pointer hover:bg-white/20 hover:scale-105' : 'cursor-not-allowed'
                } ${
                  selectedCategory?.id === category.id ? 'ring-2 ring-blue-400 bg-white/20' : ''
                }`}
              >
                {/* Coming Soon Overlay */}
                {isComingSoon && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-xl">🚧</span>
                      </div>
                      <h4 className="text-white font-bold text-lg mb-1">Coming Soon</h4>
                      <p className="text-white/80 text-sm">This category is under development</p>
                    </div>
                  </div>
                )}
                
                <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                <p className="text-white/70 text-sm mb-3">{category.description}</p>
                <div className="flex items-center justify-between text-white/60 text-sm">
                  <span>{category.factCount} facts</span>
                  <Play className="w-4 h-4" />
                </div>
                
                {/* Streak Progress Bar for Authenticated Users */}
                {isAuthenticated && !isComingSoon && (
                  <div onClick={(e) => e.stopPropagation()}>
                    {streaksLoading ? (
                      <div className="mt-4 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="text-white/60 text-xs ml-2">Loading streaks...</span>
                      </div>
                    ) : (
                      <StreakProgressBar 
                        streakData={userStreaks[category.id] || {}} 
                        categoryName={category.name}
                      />
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Start Game Section */}
        {selectedCategory && (
          <motion.div
            data-start-game
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto">
              <div className={`w-20 h-20 bg-gradient-to-r ${selectedCategory.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <selectedCategory.icon className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-4">Ready to Play?</h3>
              <p className="text-white/80 mb-6">
                You've selected <span className="text-blue-400 font-semibold">{selectedCategory.name}</span>. 
                Get ready to test your knowledge with {selectedCategory.factCount} carefully curated facts!
              </p>
              
              {/* Game Mode Selection */}
              {selectedCategory.id === 'general' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Solo Game */}
                    <button
                      onClick={handleStartGame}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex flex-col items-center"
                    >
                      <Play className="w-6 h-6 mb-2" />
                      <span>Solo Game</span>
                      <span className="text-xs opacity-80">Play alone</span>
                    </button>
                    
                    {/* Create Game */}
                    <button
                      onClick={handleCreateGame}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex flex-col items-center"
                    >
                      <Plus className="w-6 h-6 mb-2" />
                      <span>Create Game</span>
                      <span className="text-xs opacity-80">Host multiplayer</span>
                    </button>
                    
                    {/* Join Game */}
                    <button
                      onClick={handleJoinGame}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex flex-col items-center"
                    >
                      <LogIn className="w-6 h-6 mb-2" />
                      <span>Join Game</span>
                      <span className="text-xs opacity-80">Join multiplayer</span>
                    </button>
                  </div>
                  
                  <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-center space-x-2 text-white/70 mb-2">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">Multiplayer Features</span>
                    </div>
                    <p className="text-white/60 text-sm">
                      Challenge friends in real-time! Create a game room or join an existing one to compete together.
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleStartGame}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-8 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center mx-auto"
                >
                  <Play className="w-6 h-6 mr-2" />
                  Start Game
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Categories; 
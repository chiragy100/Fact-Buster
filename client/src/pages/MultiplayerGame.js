import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Copy, 
  CheckCircle, 
  XCircle,
  Play,
  Crown,
  Clock,
  Trophy,
  Home,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const MultiplayerGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [activeGames, setActiveGames] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  useEffect(() => {
    if (location.state) {
      setUsername(location.state.username);
      setIsAuthenticated(location.state.isAuthenticated);
    } else {
      // Check for guest username in sessionStorage if no location state
      const storedUsername = sessionStorage.getItem('guestUsername');
      if (storedUsername) {
        setUsername(storedUsername);
        setIsAuthenticated(false);
      }
    }
    fetchActiveGames();
  }, [location.state]);

  const fetchActiveGames = async () => {
    try {
      const response = await fetch('/api/multiplayer/active-games');
      const data = await response.json();
      
      if (data.success) {
        setActiveGames(data.games);
      }
    } catch (error) {
      console.error('Error fetching active games:', error);
    }
  };

  const createRoom = async () => {
    // Redirect to coming soon page
    navigate('/coming-soon');
  };

  const joinRoom = async () => {
    // Redirect to coming soon page
    navigate('/coming-soon');
  };

  const copyRoomCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Room code copied to clipboard!');
  };

  const joinActiveGame = (game) => {
    setJoinRoomCode(game.roomCode);
    setShowJoinForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/categories')}
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Back to Categories</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Multiplayer Game</h1>
              <p className="text-white/70">Challenge your friends!</p>
            </div>
            
            <div className="flex items-center space-x-2 text-white/70">
              <Users className="w-5 h-5" />
              <span>{username || 'Guest'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Game Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Create Game Room</h2>
              <p className="text-white/70">Start a new multiplayer game and invite friends</p>
            </div>

            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Room
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={createRoom}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Play className="w-5 h-5 mr-2" />
                    )}
                    {loading ? 'Creating...' : 'Create Room'}
                  </button>
                  
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Join Game Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Join Game Room</h2>
              <p className="text-white/70">Enter a room code to join an existing game</p>
            </div>

            {!showJoinForm ? (
              <button
                onClick={() => setShowJoinForm(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center"
              >
                <Search className="w-5 h-5 mr-2" />
                Join Room
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 mb-2">Room Code</label>
                  <input
                    type="text"
                    value={joinRoomCode}
                    onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit room code"
                    maxLength={6}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 text-center text-xl font-mono tracking-wider"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={joinRoom}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Search className="w-5 h-5 mr-2" />
                    )}
                    {loading ? 'Joining...' : 'Join Room'}
                  </button>
                  
                  <button
                    onClick={() => setShowJoinForm(false)}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Active Games Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Active Games</h3>
                <p className="text-white/70">Join games waiting for players</p>
              </div>
            </div>
            
            <button
              onClick={fetchActiveGames}
              className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {activeGames.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white/50" />
              </div>
              <p className="text-white/50">No active games found</p>
              <p className="text-white/30 text-sm">Create a new room to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGames.map((game) => (
                <div
                  key={game.roomCode}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-bold">{game.roomCode}</span>
                      <button
                        onClick={() => copyRoomCode(game.roomCode)}
                        className="p-1 text-white/50 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      <span className="text-white/70 text-sm">{game.hostUsername}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/70 text-sm">{game.category}</span>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-white/50" />
                      <span className="text-white/70 text-sm">
                        {game.playerCount}/{game.maxPlayers}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => joinActiveGame(game)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                  >
                    Join Game
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* How to Play */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
        >
          <h3 className="text-xl font-bold text-white mb-4">How to Play Multiplayer</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Create or Join</h4>
              <p className="text-white/70 text-sm">Create a new room or join an existing one with a room code</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Wait for Players</h4>
              <p className="text-white/70 text-sm">Wait for other players to join. Host can start when ready</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Compete & Win</h4>
              <p className="text-white/70 text-sm">Answer questions quickly and accurately to score points</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MultiplayerGame; 
import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [currentGame, setCurrentGame] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create solo game
  const createSoloGame = async (settings = {}) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/games/solo', { settings });
      setCurrentGame(response.data);
      toast.success('Solo game created!');
      return { success: true, game: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create solo game';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Create multiplayer game
  const createMultiplayerGame = async (settings = {}, maxPlayers = 4) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/games/multiplayer', { 
        settings, 
        maxPlayers 
      });
      setCurrentGame(response.data);
      toast.success('Multiplayer game created!');
      return { success: true, game: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create multiplayer game';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Join game by room code
  const joinGameByCode = async (roomCode) => {
    setLoading(true);
    try {
      // First, find the game by room code
      const gamesResponse = await axios.get('/api/games/active');
      const game = gamesResponse.data.find(g => g.roomCode === roomCode);
      
      if (!game) {
        throw new Error('Game not found');
      }

      // Join the game
      const response = await axios.post(`/api/games/${game._id}/join`);
      setCurrentGame(response.data);
      toast.success('Joined game successfully!');
      return { success: true, game: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to join game';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Get game by ID
  const getGame = async (gameId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/games/${gameId}`);
      setCurrentGame(response.data);
      return { success: true, game: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get game';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Mark player as ready
  const markReady = async (gameId) => {
    try {
      const response = await axios.post(`/api/games/${gameId}/ready`);
      setCurrentGame(response.data.game);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to mark ready';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Submit answer
  const submitAnswer = async (gameId, factId, guess, responseTime) => {
    try {
      const response = await axios.post(`/api/games/${gameId}/answer`, {
        factId,
        guess,
        responseTime
      });
      return { success: true, result: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit answer';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get game history
  const getGameHistory = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/games/history?page=${page}&limit=${limit}`);
      setGameHistory(response.data.games);
      return { 
        success: true, 
        games: response.data.games,
        pagination: response.data.pagination
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get game history';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Get active games
  const getActiveGames = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/games/active');
      return { success: true, games: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get active games';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Get random fact
  const getRandomFact = async (category = null, difficulty = null, excludeIds = []) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);
      if (excludeIds.length > 0) params.append('excludeIds', excludeIds.join(','));

      const response = await axios.get(`/api/facts/random?${params}`);
      return { success: true, fact: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get random fact';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get facts for game
  const getGameFacts = async (count = 10, categories = null, difficulty = null) => {
    try {
      const params = new URLSearchParams();
      params.append('count', count);
      if (categories) params.append('categories', categories.join(','));
      if (difficulty) params.append('difficulty', difficulty);

      const response = await axios.get(`/api/facts/game?${params}`);
      return { success: true, facts: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get game facts';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get fact categories
  const getFactCategories = async () => {
    try {
      const response = await axios.get('/api/facts/categories');
      return { success: true, categories: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get categories';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear current game
  const clearCurrentGame = () => {
    setCurrentGame(null);
  };

  const value = {
    currentGame,
    gameHistory,
    loading,
    createSoloGame,
    createMultiplayerGame,
    joinGameByCode,
    getGame,
    markReady,
    submitAnswer,
    getGameHistory,
    getActiveGames,
    getRandomFact,
    getGameFacts,
    getFactCategories,
    clearCurrentGame,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}; 
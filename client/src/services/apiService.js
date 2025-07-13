import { auth } from '../firebase/config';

// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Get Firebase ID token for authentication
const getIdToken = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

// Make authenticated API request
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = await getIdToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// API methods
export const apiService = {
  // GET request
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),

  // POST request
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // PUT request
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // DELETE request
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),

  // PATCH request
  patch: (endpoint, data) => apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

// Specific API endpoints
export const multiplayerAPI = {
  // Create a new game room
  createRoom: (category) => apiService.post('/multiplayer/create-room', { category }),

  // Join a game room
  joinRoom: (roomCode) => apiService.post('/multiplayer/join-room', { roomCode }),

  // Get room info
  getRoom: (roomCode) => apiService.get(`/multiplayer/room/${roomCode}`),

  // Get active games
  getActiveGames: () => apiService.get('/multiplayer/active-games'),

  // Start game
  startGame: (roomCode) => apiService.post('/multiplayer/start-game', { roomCode }),

  // Submit answer
  submitAnswer: (roomCode, answer, timeSpent) => 
    apiService.post('/multiplayer/submit-answer', { roomCode, answer, timeSpent }),

  // Get round results
  getRoundResults: (roomCode) => apiService.get(`/multiplayer/round-results/${roomCode}`),

  // End round
  endRound: (roomCode) => apiService.post('/multiplayer/end-round', { roomCode }),

  // Leave room
  leaveRoom: (roomCode) => apiService.post('/multiplayer/leave-room', { roomCode }),

  // Get game history
  getGameHistory: (roomCode) => apiService.get(`/multiplayer/game-history/${roomCode}`),
};

export const leaderboardAPI = {
  // Get leaderboard
  getLeaderboard: () => apiService.get('/leaderboard'),

  // Submit game session
  submitSession: (sessionData) => apiService.post('/leaderboard/session', sessionData),
};

export const factsAPI = {
  // Get facts by category
  getFactsByCategory: (category, count = 10) => 
    apiService.get(`/facts/category/${category}?count=${count}`),

  // Get random facts
  getRandomFacts: (count = 10) => apiService.get(`/facts/random?count=${count}`),
};

export default apiService; 
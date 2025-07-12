import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { GameProvider } from './contexts/GameContext';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SoloGame from './pages/SoloGame';
import MultiplayerGame from './pages/MultiplayerGame';
import GameLobby from './pages/GameLobby';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? children : <Navigate to="/login" />;
};

// App Routes Component
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route 
            path="/solo" 
            element={
              <ProtectedRoute>
                <SoloGame />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/multiplayer" 
            element={
              <ProtectedRoute>
                <MultiplayerGame />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lobby/:gameId" 
            element={
              <ProtectedRoute>
                <GameLobby />
              </ProtectedRoute>
            } 
          />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <GameProvider>
          <AppRoutes />
        </GameProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App; 
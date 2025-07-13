import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GameProvider } from './contexts/GameContext';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Categories from './pages/Categories';
import GameLobby from './pages/GameLobby';
import SoloGame from './pages/SoloGame';
import AnswerPage from './pages/AnswerPage';
import MultiplayerGame from './pages/MultiplayerGame';
import MultiplayerGameRoom from './pages/MultiplayerGameRoom';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Signup from './pages/Signup';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import VerifyEmailPending from './pages/VerifyEmailPending';
import Dashboard from './pages/Dashboard';
import ComingSoon from './pages/ComingSoon';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import useScrollToTop from './hooks/useScrollToTop';
import './index.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="mb-4">Please refresh the page and try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
    <div className="text-center text-white">
      <LoadingSpinner />
      <p className="mt-4">Loading Fact Buster...</p>
    </div>
  </div>
);

// Scroll to top component
const ScrollToTop = () => {
  useScrollToTop();
  return null;
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Suspense fallback={<LoadingFallback />}>
            <GameProvider>
              <SocketProvider>
                <div className="App min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
                  <Navbar />
                                  <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/verify-email-pending" element={<VerifyEmailPending />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/game-lobby" element={
                    <ProtectedRoute>
                      <GameLobby />
                    </ProtectedRoute>
                  } />
                  <Route path="/solo-game" element={<SoloGame />} />
                  <Route path="/answer" element={<AnswerPage />} />
                  <Route path="/multiplayer" element={<MultiplayerGame />} />
                  <Route path="/multiplayer-room" element={<MultiplayerGameRoom />} />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/coming-soon" element={<ComingSoon />} />
                </Routes>
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#1f2937',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  />
                </div>
              </SocketProvider>
            </GameProvider>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App; 
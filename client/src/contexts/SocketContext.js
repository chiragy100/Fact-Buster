import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { auth } from '../firebase/config';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!connectionAttempted) {
      setConnectionAttempted(true);
      
      // Initialize socket connection with timeout
      const connectTimeout = setTimeout(() => {
        console.log('Socket connection timeout - continuing without real-time features');
        return;
      }, 5000); // 5 second timeout

      const initializeSocket = async () => {
        try {
          // Get Firebase ID token for authentication
          let authData = { isGuest: true };
          
          if (isAuthenticated && currentUser) {
            try {
              const token = await currentUser.getIdToken();
              authData = {
                token,
                username: currentUser.displayName || 'User',
                isGuest: false
              };
            } catch (error) {
              console.error('Error getting Firebase token:', error);
              authData = { isGuest: true };
            }
          }

          socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001', {
            auth: authData,
          transports: ['websocket', 'polling'],
          timeout: 5000,
          forceNew: true
        });

        // Connection events
        socketRef.current.on('connect', () => {
          console.log('Socket connected');
          setIsConnected(true);
          clearTimeout(connectTimeout);
          socketRef.current.emit('join-games');
        });

        socketRef.current.on('disconnect', () => {
          console.log('Socket disconnected');
          setIsConnected(false);
        });

        socketRef.current.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setIsConnected(false);
          clearTimeout(connectTimeout);
          // Don't show error toast - just log it
        });

        // Game events
        socketRef.current.on('player-joined', (data) => {
          toast.success(`${data.username} joined the game!`);
        });

        socketRef.current.on('player-left', (data) => {
          toast.error(`${data.username} left the game`);
        });

        socketRef.current.on('player-disconnected', (data) => {
          toast.error(`${data.username} disconnected`);
        });

        socketRef.current.on('player-ready-update', (data) => {
          toast.success(`${data.username} is ready!`);
        });

        socketRef.current.on('game-started', (data) => {
          toast.success('Game started!');
        });

        socketRef.current.on('answer-submitted', (data) => {
          const result = data.isCorrect ? 'correct' : 'incorrect';
          toast.success(`${data.username} answered ${result}! (+${data.points} points)`);
        });

        socketRef.current.on('fact-results', (data) => {
          toast.success('Round complete! Check the results.');
        });

        socketRef.current.on('game-finished', (data) => {
          toast.success('Game finished!');
        });

        socketRef.current.on('error', (data) => {
          toast.error(data.message);
        });

      } catch (error) {
        console.error('Socket initialization error:', error);
        clearTimeout(connectTimeout);
      }
      };

      // Call the async function
      initializeSocket();

      // Cleanup on unmount
      return () => {
        clearTimeout(connectTimeout);
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [connectionAttempted, isAuthenticated, currentUser]);

  const joinGame = (gameId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-game', gameId);
    }
  };

  const leaveGame = (gameId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-game', gameId);
    }
  };

  const markReady = (gameId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('player-ready', gameId);
    }
  };

  const submitAnswer = (gameId, factId, guess, responseTime) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('submit-answer', {
        gameId,
        factId,
        guess,
        responseTime
      });
    }
  };

  const sendChatMessage = (gameId, message) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('chat-message', { gameId, message });
    }
  };

  const sendEmojiReaction = (gameId, emoji) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('emoji-reaction', { gameId, emoji });
    }
  };

  const value = {
    socket: socketRef.current,
    joinGame,
    leaveGame,
    markReady,
    submitAnswer,
    sendChatMessage,
    sendEmojiReaction,
    isConnected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 
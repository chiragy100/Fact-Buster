import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection
      socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token
        },
        transports: ['websocket', 'polling']
      });

      // Connection events
      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        socketRef.current.emit('join-games');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Connection error. Please refresh the page.');
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

      // Cleanup on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user, token]);

  const joinGame = (gameId) => {
    if (socketRef.current) {
      socketRef.current.emit('join-game', gameId);
    }
  };

  const leaveGame = (gameId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-game', gameId);
    }
  };

  const markReady = (gameId) => {
    if (socketRef.current) {
      socketRef.current.emit('player-ready', gameId);
    }
  };

  const submitAnswer = (gameId, factId, guess, responseTime) => {
    if (socketRef.current) {
      socketRef.current.emit('submit-answer', {
        gameId,
        factId,
        guess,
        responseTime
      });
    }
  };

  const sendChatMessage = (gameId, message) => {
    if (socketRef.current) {
      socketRef.current.emit('chat-message', { gameId, message });
    }
  };

  const sendEmojiReaction = (gameId, emoji) => {
    if (socketRef.current) {
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
    isConnected: socketRef.current?.connected || false
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 
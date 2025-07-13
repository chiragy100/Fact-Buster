const socketIo = require('socket.io');
const admin = require('firebase-admin');
const multiplayerService = require('../services/multiplayerService');

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const username = socket.handshake.auth.username;
      const isGuest = socket.handshake.auth.isGuest;

      if (isGuest) {
        socket.userId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        socket.username = username || 'Guest';
        socket.isGuest = true;
      } else if (token) {
        // Verify Firebase ID token
        if (admin.apps.length) {
          try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            socket.userId = decodedToken.uid;
            socket.username = decodedToken.name || decodedToken.display_name || 'User';
            socket.isGuest = false;
          } catch (firebaseError) {
            console.error('Firebase token verification error:', firebaseError);
            return next(new Error('Invalid Firebase token'));
          }
        } else {
          // Mock authentication for development
          socket.userId = 'mock-user-id';
          socket.username = username || 'User';
        socket.isGuest = false;
        }
      } else {
        return next(new Error('Authentication error'));
      }

      // Store connection
      multiplayerService.storePlayerConnection(socket.userId, socket.id);
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.username} (${socket.userId})`);

    // Join game room
    socket.on('join-game-room', async ({ roomCode }) => {
      try {
        console.log(`👥 ${socket.username} joining room: ${roomCode}`);
        
        // Get room info
        const gameRoom = await multiplayerService.getGameByRoomCode(roomCode);
        if (!gameRoom) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Join socket room
        socket.join(roomCode);
        socket.roomCode = roomCode;

        // Notify other players
        socket.to(roomCode).emit('player-joined', {
          player: {
            userId: socket.userId,
            username: socket.username,
            isHost: false
          },
          updatedRoom: gameRoom
        });

        console.log(`✅ ${socket.username} joined room: ${roomCode}`);
      } catch (error) {
        console.error('❌ Error joining game room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Start game
    socket.on('start-game', async ({ roomCode }) => {
      try {
        console.log(`🚀 Starting game in room: ${roomCode}`);
        
        const gameRoom = await multiplayerService.getGameByRoomCode(roomCode);
        if (!gameRoom) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if user is host
        if (gameRoom.hostId !== socket.userId) {
          socket.emit('error', { message: 'Only host can start the game' });
          return;
        }

        // Start game
        const { gameRoom: updatedRoom, firstQuestion } = await multiplayerService.startGame(roomCode);
        
        // Notify all players
        io.to(roomCode).emit('game-started', {
          question: firstQuestion,
          updatedRoom: updatedRoom
        });

        // Start round timer
        startRoundTimer(roomCode, 30);

        console.log(`✅ Game started in room: ${roomCode}`);
      } catch (error) {
        console.error('❌ Error starting game:', error);
        socket.emit('error', { message: error.message || 'Failed to start game' });
      }
    });

    // Submit answer
    socket.on('submit-answer', async ({ roomCode, answer, timeSpent }) => {
      try {
        console.log(`📝 ${socket.username} submitted answer in room: ${roomCode}`);
        
        const result = await multiplayerService.submitAnswer(roomCode, socket.userId, answer, timeSpent);
        
        if (!result) {
          socket.emit('error', { message: 'Failed to submit answer' });
          return;
        }

        // Notify other players
        socket.to(roomCode).emit('player-answered', {
          player: {
            userId: socket.userId,
            username: socket.username
          },
          timeSpent
        });

        // Check if all players have answered
        const activeGame = multiplayerService.activeGames.get(roomCode);
        if (activeGame && activeGame.room.currentPlayers.length === activeGame.roundAnswers.size) {
          // All players answered, end round
          setTimeout(() => endRound(roomCode), 2000);
        }

      } catch (error) {
        console.error('❌ Error submitting answer:', error);
        socket.emit('error', { message: 'Failed to submit answer' });
      }
    });

    // Leave game room
    socket.on('leave-game-room', async ({ roomCode }) => {
      try {
        console.log(`👋 ${socket.username} leaving room: ${roomCode}`);
        
        const result = await multiplayerService.leaveRoom(roomCode, socket.userId);
        
        if (result) {
          // Notify other players
          socket.to(roomCode).emit('player-left', {
            player: {
              userId: socket.userId,
              username: socket.username
            },
            updatedRoom: result.gameRoom
          });

          // Leave socket room
          socket.leave(roomCode);
          socket.roomCode = null;
        }

        console.log(`✅ ${socket.username} left room: ${roomCode}`);
      } catch (error) {
        console.error('❌ Error leaving game room:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${socket.username} (${socket.userId})`);
      
      // Remove connection
      multiplayerService.removePlayerConnection(socket.userId);
      
      // Leave room if in one
      if (socket.roomCode) {
        try {
          const result = await multiplayerService.leaveRoom(socket.roomCode, socket.userId);
          
          if (result) {
            // Notify other players
            socket.to(socket.roomCode).emit('player-left', {
              player: {
                userId: socket.userId,
                username: socket.username
              },
              updatedRoom: result.gameRoom
            });
          }
        } catch (error) {
          console.error('❌ Error handling disconnect:', error);
        }
      }
    });
  });

  console.log('📡 Socket.io server initialized');
  return io;
};

// Round timer management
const roundTimers = new Map();

const startRoundTimer = (roomCode, duration) => {
  // Clear existing timer
  if (roundTimers.has(roomCode)) {
    clearInterval(roundTimers.get(roomCode));
  }

  let timeLeft = duration;
  
  // Send initial time
  io.to(roomCode).emit('time-update', { timeLeft });
  
  const timer = setInterval(() => {
    timeLeft--;
    
    // Send time update
    io.to(roomCode).emit('time-update', { timeLeft });
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      roundTimers.delete(roomCode);
      
      // End round
      endRound(roomCode);
    }
  }, 1000);
  
  roundTimers.set(roomCode, timer);
};

const endRound = async (roomCode) => {
  try {
    console.log(`🏁 Ending round in room: ${roomCode}`);
    
    // Clear timer
    if (roundTimers.has(roomCode)) {
      clearInterval(roundTimers.get(roomCode));
      roundTimers.delete(roomCode);
    }
    
    const result = await multiplayerService.endRound(roomCode);
    
    if (result.gameFinished) {
      // Game finished
      io.to(roomCode).emit('round-finished', {
        results: result.roundResults,
        gameFinished: true,
        updatedRoom: result.gameRoom
      });
      
      console.log(`🏆 Game finished in room: ${roomCode}`);
    } else {
      // Next round
      io.to(roomCode).emit('round-finished', {
        results: result.roundResults,
        nextQuestion: result.nextQuestion,
        gameFinished: false,
        updatedRoom: result.gameRoom
      });
      
      // Start timer for next round
      setTimeout(() => {
        startRoundTimer(roomCode, 30);
      }, 5000);
      
      console.log(`🔄 Round ended, next round starting in room: ${roomCode}`);
    }
  } catch (error) {
    console.error('❌ Error ending round:', error);
  }
};

// Cleanup inactive games periodically
setInterval(async () => {
  try {
    await multiplayerService.cleanupInactiveGames();
  } catch (error) {
    console.error('❌ Error cleaning up games:', error);
  }
}, 5 * 60 * 1000); // Every 5 minutes

module.exports = { initializeSocket }; 
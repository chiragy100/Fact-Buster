const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Game = require('../models/Game');

const socketHandler = (io) => {
  // Store active connections
  const activeConnections = new Map();
  const gameRooms = new Map();

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.user.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.username = user.username;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.username} (${socket.userId})`);
    
    // Store connection
    activeConnections.set(socket.userId, socket.id);

    // Join user to their active games
    socket.on('join-games', async () => {
      try {
        const activeGames = await Game.find({
          'players.userId': socket.userId,
          status: { $in: ['waiting', 'active'] }
        });

        activeGames.forEach(game => {
          socket.join(`game-${game._id}`);
          gameRooms.set(socket.userId, game._id);
        });

        socket.emit('games-joined', { gameIds: activeGames.map(g => g._id) });
      } catch (error) {
        console.error('Join games error:', error);
      }
    });

    // Join specific game room
    socket.on('join-game', async (gameId) => {
      try {
        const game = await Game.findById(gameId);
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        const isPlayer = game.players.some(p => p.userId.toString() === socket.userId);
        if (!isPlayer) {
          socket.emit('error', { message: 'Not a player in this game' });
          return;
        }

        socket.join(`game-${gameId}`);
        gameRooms.set(socket.userId, gameId);

        // Notify other players
        socket.to(`game-${gameId}`).emit('player-joined', {
          userId: socket.userId,
          username: socket.username
        });

        socket.emit('game-joined', { gameId });
      } catch (error) {
        console.error('Join game error:', error);
        socket.emit('error', { message: 'Failed to join game' });
      }
    });

    // Player ready
    socket.on('player-ready', async (gameId) => {
      try {
        const game = await Game.findById(gameId);
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        const player = game.players.find(p => p.userId.toString() === socket.userId);
        if (!player) {
          socket.emit('error', { message: 'Not a player in this game' });
          return;
        }

        player.isReady = true;
        await game.save();

        // Notify all players in the game
        io.to(`game-${gameId}`).emit('player-ready-update', {
          userId: socket.userId,
          username: socket.username,
          isReady: true
        });

        // Check if game can start
        if (game.isReadyToStart()) {
          // Start the game after a short delay
          setTimeout(async () => {
            try {
              const updatedGame = await Game.findById(gameId);
              if (updatedGame && updatedGame.status === 'waiting') {
                updatedGame.status = 'active';
                updatedGame.startTime = new Date();
                await updatedGame.save();

                io.to(`game-${gameId}`).emit('game-started', {
                  gameId,
                  startTime: updatedGame.startTime,
                  facts: updatedGame.facts
                });
              }
            } catch (error) {
              console.error('Start game error:', error);
            }
          }, 3000);
        }
      } catch (error) {
        console.error('Player ready error:', error);
        socket.emit('error', { message: 'Failed to mark player ready' });
      }
    });

    // Submit answer
    socket.on('submit-answer', async (data) => {
      try {
        const { gameId, factId, guess, responseTime } = data;
        const game = await Game.findById(gameId);
        
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        if (game.status !== 'active') {
          socket.emit('error', { message: 'Game is not active' });
          return;
        }

        // Submit answer
        const result = game.submitAnswer(socket.userId, factId, guess, responseTime);
        await game.save();

        // Notify all players about the answer
        io.to(`game-${gameId}`).emit('answer-submitted', {
          userId: socket.userId,
          username: socket.username,
          factId,
          isCorrect: result.isCorrect,
          points: result.points,
          newScore: result.newScore
        });

        // Check if all players have answered
        const currentFact = game.facts[game.currentRound];
        if (currentFact && currentFact.factId.toString() === factId) {
          const answeredPlayers = game.answers.filter(
            a => a.factId.toString() === factId
          ).length;

          if (answeredPlayers >= game.players.length) {
                         // All players have answered, show results
             setTimeout(async () => {
               io.to(`game-${gameId}`).emit('fact-results', {
                 factId,
                 correctAnswer: currentFact.isReal,
                 explanation: currentFact.explanation,
                 playerResults: game.answers
                   .filter(a => a.factId.toString() === factId)
                   .map(a => ({
                     userId: a.playerId,
                     guess: a.guess,
                     isCorrect: a.isCorrect,
                     points: a.points,
                     responseTime: a.responseTime
                   }))
               });

               // Move to next fact or end game
               game.currentRound += 1;
               if (game.currentRound >= game.facts.length) {
                 // Game finished
                 game.status = 'finished';
                 game.endTime = new Date();
                 const results = game.getResults();
                 game.winner = results.winner.userId;
                 
                 try {
                   await game.save();
                 } catch (error) {
                   console.error('Save game error:', error);
                 }

                 io.to(`game-${gameId}`).emit('game-finished', {
                   gameId,
                   results,
                   endTime: game.endTime
                 });
               } else {
                 // Next fact
                 setTimeout(() => {
                   io.to(`game-${gameId}`).emit('next-fact', {
                     fact: game.facts[game.currentRound],
                     round: game.currentRound + 1,
                     totalRounds: game.facts.length
                   });
                 }, 3000);
               }
             }, 2000);
          }
        }
      } catch (error) {
        console.error('Submit answer error:', error);
        socket.emit('error', { message: 'Failed to submit answer' });
      }
    });

    // Chat message
    socket.on('chat-message', (data) => {
      const { gameId, message } = data;
      io.to(`game-${gameId}`).emit('chat-message', {
        userId: socket.userId,
        username: socket.username,
        message,
        timestamp: new Date()
      });
    });

    // Emoji reaction
    socket.on('emoji-reaction', (data) => {
      const { gameId, emoji } = data;
      io.to(`game-${gameId}`).emit('emoji-reaction', {
        userId: socket.userId,
        username: socket.username,
        emoji,
        timestamp: new Date()
      });
    });

    // Leave game
    socket.on('leave-game', async (gameId) => {
      try {
        socket.leave(`game-${gameId}`);
        gameRooms.delete(socket.userId);

        const game = await Game.findById(gameId);
        if (game && game.status === 'waiting') {
          game.removePlayer(socket.userId);
          await game.save();

          io.to(`game-${gameId}`).emit('player-left', {
            userId: socket.userId,
            username: socket.username
          });
        }
      } catch (error) {
        console.error('Leave game error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.username} (${socket.userId})`);
      
      activeConnections.delete(socket.userId);
      
      // Handle player disconnection from games
      const gameId = gameRooms.get(socket.userId);
      if (gameId) {
        try {
          const game = await Game.findById(gameId);
          if (game && game.status === 'waiting') {
            game.removePlayer(socket.userId);
            await game.save();

            io.to(`game-${gameId}`).emit('player-disconnected', {
              userId: socket.userId,
              username: socket.username
            });
          }
        } catch (error) {
          console.error('Handle disconnect error:', error);
        }
        
        gameRooms.delete(socket.userId);
      }
    });
  });

  return { activeConnections, gameRooms };
};

module.exports = socketHandler; 
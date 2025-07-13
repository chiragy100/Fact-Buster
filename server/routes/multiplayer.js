const express = require('express');
const router = express.Router();
const multiplayerService = require('../services/multiplayerService');
const { firebaseAuth, guestAuth } = require('../middleware/firebaseAuth');

// Create a new game room
router.post('/create-room', guestAuth, async (req, res) => {
  try {
    const { category = 'general-knowledge' } = req.body;
    const userId = req.user.id;
    const username = req.user.username;

    const gameRoom = await multiplayerService.createRoom(userId, username, category);
    
    res.json({
      success: true,
      room: {
        roomCode: gameRoom.roomCode,
        hostId: gameRoom.hostId,
        hostUsername: gameRoom.hostUsername,
        category: gameRoom.category,
        maxPlayers: gameRoom.maxPlayers,
        currentPlayers: gameRoom.currentPlayers,
        gameState: gameRoom.gameState,
        createdAt: gameRoom.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Create room error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create game room'
    });
  }
});

// Join a game room
router.post('/join-room', guestAuth, async (req, res) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user.id;
    const username = req.user.username;

    if (!roomCode) {
      return res.status(400).json({
        success: false,
        message: 'Room code is required'
      });
    }

    const gameRoom = await multiplayerService.joinRoom(roomCode, userId, username);
    
    res.json({
      success: true,
      room: {
        roomCode: gameRoom.roomCode,
        hostId: gameRoom.hostId,
        hostUsername: gameRoom.hostUsername,
        category: gameRoom.category,
        maxPlayers: gameRoom.maxPlayers,
        currentPlayers: gameRoom.currentPlayers,
        gameState: gameRoom.gameState,
        createdAt: gameRoom.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Join room error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to join game room'
    });
  }
});

// Get game room info
router.get('/room/:roomCode', async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const gameRoom = await multiplayerService.getGameByRoomCode(roomCode);
    
    if (!gameRoom) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      room: {
        roomCode: gameRoom.roomCode,
        hostId: gameRoom.hostId,
        hostUsername: gameRoom.hostUsername,
        category: gameRoom.category,
        maxPlayers: gameRoom.maxPlayers,
        currentPlayers: gameRoom.currentPlayers,
        gameState: gameRoom.gameState,
        currentRound: gameRoom.currentRound,
        totalRounds: gameRoom.totalRounds,
        currentQuestion: gameRoom.currentQuestion,
        createdAt: gameRoom.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get room info'
    });
  }
});

// Get active games (for lobby)
router.get('/active-games', async (req, res) => {
  try {
    const activeGames = await multiplayerService.getActiveGames();
    
    res.json({
      success: true,
      games: activeGames.map(game => ({
        roomCode: game.roomCode,
        hostUsername: game.hostUsername,
        category: game.category,
        playerCount: game.currentPlayers.length,
        maxPlayers: game.maxPlayers,
        createdAt: game.createdAt
      }))
    });
  } catch (error) {
    console.error('❌ Get active games error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active games'
    });
  }
});

// Start game (host only)
router.post('/start-game', firebaseAuth, async (req, res) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user.id;

    const gameRoom = await multiplayerService.getGameByRoomCode(roomCode);
    
    if (!gameRoom) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (gameRoom.hostId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can start the game'
      });
    }

    const { gameRoom: updatedRoom, firstQuestion } = await multiplayerService.startGame(roomCode);
    
    res.json({
      success: true,
      room: {
        roomCode: updatedRoom.roomCode,
        gameState: updatedRoom.gameState,
        currentRound: updatedRoom.currentRound,
        totalRounds: updatedRoom.totalRounds,
        currentPlayers: updatedRoom.currentPlayers
      },
      firstQuestion
    });
  } catch (error) {
    console.error('❌ Start game error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to start game'
    });
  }
});

// Submit answer
router.post('/submit-answer', firebaseAuth, async (req, res) => {
  try {
    const { roomCode, answer, timeSpent } = req.body;
    const userId = req.user.id;

    if (!roomCode || !answer || timeSpent === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Room code, answer, and time spent are required'
      });
    }

    const result = await multiplayerService.submitAnswer(roomCode, userId, answer, timeSpent);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('❌ Submit answer error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit answer'
    });
  }
});

// Get round results
router.get('/round-results/:roomCode', async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const results = await multiplayerService.getRoundResults(roomCode);
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('❌ Get round results error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get round results'
    });
  }
});

// End round and get next question
router.post('/end-round', firebaseAuth, async (req, res) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user.id;

    const gameRoom = await multiplayerService.getGameByRoomCode(roomCode);
    
    if (!gameRoom) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (gameRoom.hostId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can end rounds'
      });
    }

    const result = await multiplayerService.endRound(roomCode);
    
    res.json({
      success: true,
      roundResults: result.roundResults,
      nextQuestion: result.nextQuestion,
      gameFinished: result.gameFinished,
      gameRoom: result.gameRoom
    });
  } catch (error) {
    console.error('❌ End round error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to end round'
    });
  }
});

// Leave game room
router.post('/leave-room', firebaseAuth, async (req, res) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user.id;

    const result = await multiplayerService.leaveRoom(roomCode, userId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Room not found or player not in room'
      });
    }

    res.json({
      success: true,
      removedPlayer: result.removedPlayer,
      gameRoom: result.gameRoom
    });
  } catch (error) {
    console.error('❌ Leave room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave room'
    });
  }
});

// Get game history
router.get('/game-history/:roomCode', async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const gameRoom = await multiplayerService.getGameByRoomCode(roomCode);
    
    if (!gameRoom) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      gameHistory: gameRoom.gameHistory,
      finalResults: gameRoom.finalResults,
      winner: gameRoom.winner
    });
  } catch (error) {
    console.error('❌ Get game history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get game history'
    });
  }
});

module.exports = router; 
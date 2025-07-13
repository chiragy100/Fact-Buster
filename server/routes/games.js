const express = require('express');
const { body, validationResult } = require('express-validator');
// Remove MongoDB Game model
// const Game = require('../models/Game');
const { firebaseAuth } = require('../middleware/firebaseAuth');

const router = express.Router();

// Mock games data for development
const mockGames = [];

// @route   POST /api/games
// @desc    Create a new game
// @access  Private
router.post('/', firebaseAuth, [
  body('type')
    .isIn(['solo', 'multiplayer'])
    .withMessage('Game type must be solo or multiplayer'),
  body('settings')
    .isObject()
    .withMessage('Settings must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, settings } = req.body;
    
    const newGame = {
      id: Date.now().toString(),
      type,
      settings,
      players: [req.user.id],
      status: 'waiting',
      createdAt: new Date(),
      createdBy: req.user.id
    };
    
    mockGames.push(newGame);
    
    res.json(newGame);
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games
// @desc    Get user's games
// @access  Private
router.get('/', firebaseAuth, async (req, res) => {
  try {
    const userGames = mockGames.filter(game => 
      game.players.includes(req.user.id)
    );
    
    res.json(userGames);
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/:id
// @desc    Get game by ID
// @access  Private
router.get('/:id', firebaseAuth, async (req, res) => {
  try {
    const game = mockGames.find(g => g.id === req.params.id);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    res.json(game);
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/games/:id/join
// @desc    Join a multiplayer game
// @access  Private
router.put('/:id/join', firebaseAuth, async (req, res) => {
  try {
    const game = mockGames.find(g => g.id === req.params.id);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    if (game.players.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already in game' });
    }
    
    game.players.push(req.user.id);
    
    res.json(game);
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/games/:id/start
// @desc    Start a game
// @access  Private
router.put('/:id/start', firebaseAuth, async (req, res) => {
  try {
    const game = mockGames.find(g => g.id === req.params.id);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    if (game.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    game.status = 'active';
    game.startedAt = new Date();
    
    res.json(game);
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/games/:id/end
// @desc    End a game
// @access  Private
router.put('/:id/end', firebaseAuth, async (req, res) => {
  try {
    const game = mockGames.find(g => g.id === req.params.id);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    game.status = 'completed';
    game.endedAt = new Date();
    
    res.json(game);
  } catch (error) {
    console.error('End game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
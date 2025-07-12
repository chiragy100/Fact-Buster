const express = require('express');
const { body, validationResult } = require('express-validator');
const Game = require('../models/Game');
const User = require('../models/User');
const Fact = require('../models/Fact');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/games/solo
// @desc    Create a new solo game
// @access  Private
router.post('/solo', auth, [
  body('settings.categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
  body('settings.difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),
  body('settings.factCount')
    .optional()
    .isInt({ min: 5, max: 20 })
    .withMessage('Fact count must be between 5 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { settings = {} } = req.body;
    const user = await User.findById(req.user.id);

    // Create new solo game
    const game = new Game({
      gameType: 'solo',
      settings: {
        categories: settings.categories || ['geography', 'sports', 'space', 'history', 'science', 'pop-culture'],
        difficulty: settings.difficulty || 'medium',
        factCount: settings.factCount || 10,
        timeLimit: settings.timeLimit || 30
      }
    });

    // Add player to game
    game.addPlayer(user.id, user.username);

    // Get facts for the game
    const facts = await Fact.getGameFacts(
      game.settings.factCount,
      game.settings.categories,
      game.settings.difficulty
    );

    // Add facts to game
    game.facts = facts.map((fact, index) => ({
      factId: fact._id,
      content: fact.content,
      category: fact.category,
      isReal: fact.isReal,
      explanation: fact.explanation,
      order: index
    }));

    await game.save();

    res.json(game);
  } catch (error) {
    console.error('Create solo game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/games/multiplayer
// @desc    Create a new multiplayer game
// @access  Private
router.post('/multiplayer', auth, [
  body('settings.categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
  body('settings.difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),
  body('settings.factCount')
    .optional()
    .isInt({ min: 5, max: 20 })
    .withMessage('Fact count must be between 5 and 20'),
  body('maxPlayers')
    .optional()
    .isInt({ min: 2, max: 8 })
    .withMessage('Max players must be between 2 and 8')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { settings = {}, maxPlayers = 4 } = req.body;
    const user = await User.findById(req.user.id);

    // Create new multiplayer game
    const game = new Game({
      gameType: 'multiplayer',
      maxPlayers,
      settings: {
        categories: settings.categories || ['geography', 'sports', 'space', 'history', 'science', 'pop-culture'],
        difficulty: settings.difficulty || 'medium',
        factCount: settings.factCount || 10,
        timeLimit: settings.timeLimit || 30
      }
    });

    // Generate room code
    game.generateRoomCode();

    // Add creator to game
    game.addPlayer(user.id, user.username);

    await game.save();

    res.json(game);
  } catch (error) {
    console.error('Create multiplayer game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/:id
// @desc    Get game by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate('players.userId', 'username avatar')
      .populate('winner', 'username');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Check if user is part of the game
    const isPlayer = game.players.some(p => p.userId.toString() === req.user.id);
    if (!isPlayer) {
      return res.status(403).json({ message: 'Not authorized to view this game' });
    }

    res.json(game);
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/games/:id/join
// @desc    Join a multiplayer game
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game.gameType !== 'multiplayer') {
      return res.status(400).json({ message: 'Cannot join solo game' });
    }

    if (game.status !== 'waiting') {
      return res.status(400).json({ message: 'Game has already started' });
    }

    // Add player to game
    game.addPlayer(user.id, user.username);
    await game.save();

    res.json(game);
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/games/:id/ready
// @desc    Mark player as ready
// @access  Private
router.post('/:id/ready', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const player = game.players.find(p => p.userId.toString() === req.user.id);
    if (!player) {
      return res.status(403).json({ message: 'Not a player in this game' });
    }

    player.isReady = true;
    await game.save();

    res.json({ message: 'Player ready', game });
  } catch (error) {
    console.error('Player ready error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/games/:id/answer
// @desc    Submit an answer for a fact
// @access  Private
router.post('/:id/answer', auth, [
  body('factId')
    .isMongoId()
    .withMessage('Invalid fact ID'),
  body('guess')
    .isBoolean()
    .withMessage('Guess must be a boolean'),
  body('responseTime')
    .isInt({ min: 0 })
    .withMessage('Response time must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { factId, guess, responseTime } = req.body;
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game.status !== 'active') {
      return res.status(400).json({ message: 'Game is not active' });
    }

    // Submit answer
    const result = game.submitAnswer(req.user.id, factId, guess, responseTime);
    await game.save();

    // Update fact usage statistics
    const fact = await Fact.findById(factId);
    if (fact) {
      fact.updateUsage(result.isCorrect, responseTime);
      await fact.save();
    }

    res.json(result);
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/active
// @desc    Get user's active games
// @access  Private
router.get('/active', auth, async (req, res) => {
  try {
    const games = await Game.find({
      'players.userId': req.user.id,
      status: { $in: ['waiting', 'active'] }
    })
    .populate('players.userId', 'username avatar')
    .sort({ createdAt: -1 });

    res.json(games);
  } catch (error) {
    console.error('Get active games error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/history
// @desc    Get user's game history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const games = await Game.find({
      'players.userId': req.user.id,
      status: 'finished'
    })
    .populate('players.userId', 'username avatar')
    .populate('winner', 'username')
    .sort({ endTime: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Game.countDocuments({
      'players.userId': req.user.id,
      status: 'finished'
    });

    res.json({
      games,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: skip + games.length < total
      }
    });
  } catch (error) {
    console.error('Get game history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
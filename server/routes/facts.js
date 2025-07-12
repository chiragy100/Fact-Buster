const express = require('express');
const { body, validationResult } = require('express-validator');
const Fact = require('../models/Fact');
const auth = require('../middleware/auth');
const { generateFakeFact } = require('../services/openai');

const router = express.Router();

// @route   GET /api/facts/random
// @desc    Get a random fact
// @access  Public
router.get('/random', async (req, res) => {
  try {
    const { category, difficulty, excludeIds } = req.query;
    
    const excludeArray = excludeIds ? excludeIds.split(',') : [];
    const fact = await Fact.getRandomFact(category, difficulty, excludeArray);
    
    if (!fact) {
      return res.status(404).json({ message: 'No facts found with the specified criteria' });
    }
    
    res.json(fact);
  } catch (error) {
    console.error('Get random fact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facts/game
// @desc    Get facts for a game round
// @access  Public
router.get('/game', async (req, res) => {
  try {
    const { count = 10, categories, difficulty } = req.query;
    
    const categoryArray = categories ? categories.split(',') : null;
    const facts = await Fact.getGameFacts(parseInt(count), categoryArray, difficulty);
    
    res.json(facts);
  } catch (error) {
    console.error('Get game facts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/facts/generate
// @desc    Generate a fake fact using OpenAI
// @access  Private
router.post('/generate', auth, [
  body('category')
    .isIn(['geography', 'sports', 'space', 'history', 'science', 'pop-culture'])
    .withMessage('Invalid category'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, difficulty = 'medium' } = req.body;
    
    // Generate fake fact using OpenAI
    const fakeFactContent = await generateFakeFact(category, difficulty);
    
    if (!fakeFactContent) {
      return res.status(500).json({ message: 'Failed to generate fake fact' });
    }
    
    // Create new fact
    const fact = new Fact({
      content: fakeFactContent,
      category,
      difficulty,
      isReal: false,
      aiGenerated: true,
      createdBy: req.user.id,
      explanation: `This is an AI-generated fake fact in the ${category} category.`
    });
    
    await fact.save();
    
    res.json(fact);
  } catch (error) {
    console.error('Generate fact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/facts
// @desc    Create a new fact (admin only)
// @access  Private
router.post('/', auth, [
  body('content')
    .isLength({ min: 10, max: 500 })
    .withMessage('Fact content must be between 10 and 500 characters'),
  body('category')
    .isIn(['geography', 'sports', 'space', 'history', 'science', 'pop-culture'])
    .withMessage('Invalid category'),
  body('isReal')
    .isBoolean()
    .withMessage('isReal must be a boolean'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, category, isReal, difficulty = 'medium', source, explanation, tags } = req.body;
    
    const fact = new Fact({
      content,
      category,
      isReal,
      difficulty,
      source,
      explanation,
      tags: tags || [],
      createdBy: req.user.id
    });
    
    await fact.save();
    
    res.json(fact);
  } catch (error) {
    console.error('Create fact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facts/categories
// @desc    Get available categories with fact counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = ['geography', 'sports', 'space', 'history', 'science', 'pop-culture'];
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const [realCount, fakeCount] = await Promise.all([
          Fact.countDocuments({ category, isReal: true, isActive: true }),
          Fact.countDocuments({ category, isReal: false, isActive: true })
        ]);
        
        return {
          name: category,
          displayName: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
          realCount,
          fakeCount,
          totalCount: realCount + fakeCount
        };
      })
    );
    
    res.json(categoryStats);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/facts/:id/usage
// @desc    Update fact usage statistics
// @access  Public
router.put('/:id/usage', async (req, res) => {
  try {
    const { isCorrect, responseTime } = req.body;
    const fact = await Fact.findById(req.params.id);
    
    if (!fact) {
      return res.status(404).json({ message: 'Fact not found' });
    }
    
    fact.updateUsage(isCorrect, responseTime);
    await fact.save();
    
    res.json({ message: 'Usage updated successfully' });
  } catch (error) {
    console.error('Update fact usage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facts/stats
// @desc    Get fact statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const [totalFacts, realFacts, fakeFacts, totalUsage] = await Promise.all([
      Fact.countDocuments({ isActive: true }),
      Fact.countDocuments({ isReal: true, isActive: true }),
      Fact.countDocuments({ isReal: false, isActive: true }),
      Fact.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, totalUsage: { $sum: '$usageCount' } } }
      ])
    ]);
    
    const mostUsedFacts = await Fact.find({ isActive: true })
      .sort({ usageCount: -1 })
      .limit(5)
      .select('content category usageCount');
    
    const hardestFacts = await Fact.find({ isActive: true, totalGuesses: { $gt: 10 } })
      .sort({ correctGuesses: 1 })
      .limit(5)
      .select('content category correctGuesses totalGuesses');
    
    res.json({
      totalFacts,
      realFacts,
      fakeFacts,
      totalUsage: totalUsage[0]?.totalUsage || 0,
      mostUsedFacts,
      hardestFacts: hardestFacts.map(fact => ({
        ...fact.toObject(),
        successRate: fact.getSuccessRate()
      }))
    });
  } catch (error) {
    console.error('Get fact stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
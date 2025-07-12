const express = require('express');
const User = require('../models/User');
const Game = require('../models/Game');

const router = express.Router();

// @route   GET /api/leaderboard/global
// @desc    Get global leaderboard
// @access  Public
router.get('/global', async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'totalScore' } = req.query;
    const skip = (page - 1) * limit;

    // Validate sortBy parameter
    const validSortFields = ['totalScore', 'correctAnswers', 'bestStreak', 'gamesPlayed'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'totalScore';

    const sortCriteria = {};
    sortCriteria[`stats.${sortField}`] = -1;

    const users = await User.find({ isAnonymous: false })
      .select('username avatar stats')
      .sort(sortCriteria)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({ isAnonymous: false });

    // Calculate ranks
    const usersWithRanks = users.map((user, index) => ({
      rank: skip + index + 1,
      username: user.username,
      avatar: user.avatar,
      stats: {
        ...user.stats,
        accuracy: user.getAccuracy()
      }
    }));

    res.json({
      leaderboard: usersWithRanks,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: skip + users.length < total
      },
      sortBy
    });
  } catch (error) {
    console.error('Get global leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaderboard/category
// @desc    Get category-specific leaderboard
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Validate category
    const validCategories = ['geography', 'sports', 'space', 'history', 'science', 'pop-culture'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Get users who have played games in this category
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'games',
          localField: '_id',
          foreignField: 'players.userId',
          as: 'games'
        }
      },
      {
        $unwind: '$games'
      },
      {
        $match: {
          'games.settings.categories': category,
          'games.status': 'finished',
          isAnonymous: false
        }
      },
      {
        $group: {
          _id: '$_id',
          username: { $first: '$username' },
          avatar: { $first: '$avatar' },
          totalScore: { $sum: '$games.players.score' },
          gamesPlayed: { $sum: 1 },
          correctAnswers: { $sum: '$games.players.correctAnswers' },
          totalAnswers: { $sum: '$games.players.totalAnswers' }
        }
      },
      {
        $addFields: {
          accuracy: {
            $cond: [
              { $eq: ['$totalAnswers', 0] },
              0,
              { $multiply: [{ $divide: ['$correctAnswers', '$totalAnswers'] }, 100] }
            ]
          }
        }
      },
      {
        $sort: { totalScore: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    const total = await User.aggregate([
      {
        $lookup: {
          from: 'games',
          localField: '_id',
          foreignField: 'players.userId',
          as: 'games'
        }
      },
      {
        $unwind: '$games'
      },
      {
        $match: {
          'games.settings.categories': category,
          'games.status': 'finished',
          isAnonymous: false
        }
      },
      {
        $group: {
          _id: '$_id'
        }
      },
      {
        $count: 'total'
      }
    ]);

    // Calculate ranks
    const usersWithRanks = users.map((user, index) => ({
      rank: skip + index + 1,
      ...user
    }));

    res.json({
      leaderboard: usersWithRanks,
      category,
      pagination: {
        current: parseInt(page),
        total: Math.ceil((total[0]?.total || 0) / limit),
        hasMore: skip + users.length < (total[0]?.total || 0)
      }
    });
  } catch (error) {
    console.error('Get category leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaderboard/weekly
// @desc    Get weekly leaderboard
// @access  Public
router.get('/weekly', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get start of current week (Monday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const users = await User.aggregate([
      {
        $lookup: {
          from: 'games',
          localField: '_id',
          foreignField: 'players.userId',
          as: 'games'
        }
      },
      {
        $unwind: '$games'
      },
      {
        $match: {
          'games.endTime': { $gte: startOfWeek },
          'games.status': 'finished',
          isAnonymous: false
        }
      },
      {
        $group: {
          _id: '$_id',
          username: { $first: '$username' },
          avatar: { $first: '$avatar' },
          weeklyScore: { $sum: '$games.players.score' },
          weeklyGames: { $sum: 1 },
          weeklyCorrect: { $sum: '$games.players.correctAnswers' },
          weeklyTotal: { $sum: '$games.players.totalAnswers' }
        }
      },
      {
        $addFields: {
          weeklyAccuracy: {
            $cond: [
              { $eq: ['$weeklyTotal', 0] },
              0,
              { $multiply: [{ $divide: ['$weeklyCorrect', '$weeklyTotal'] }, 100] }
            ]
          }
        }
      },
      {
        $sort: { weeklyScore: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    const total = await User.aggregate([
      {
        $lookup: {
          from: 'games',
          localField: '_id',
          foreignField: 'players.userId',
          as: 'games'
        }
      },
      {
        $unwind: '$games'
      },
      {
        $match: {
          'games.endTime': { $gte: startOfWeek },
          'games.status': 'finished',
          isAnonymous: false
        }
      },
      {
        $group: {
          _id: '$_id'
        }
      },
      {
        $count: 'total'
      }
    ]);

    // Calculate ranks
    const usersWithRanks = users.map((user, index) => ({
      rank: skip + index + 1,
      ...user
    }));

    res.json({
      leaderboard: usersWithRanks,
      weekStart: startOfWeek,
      pagination: {
        current: parseInt(page),
        total: Math.ceil((total[0]?.total || 0) / limit),
        hasMore: skip + users.length < (total[0]?.total || 0)
      }
    });
  } catch (error) {
    console.error('Get weekly leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaderboard/user/:userId
// @desc    Get user's ranking and stats
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('username avatar stats');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get global rank
    const globalRank = await User.countDocuments({
      'stats.totalScore': { $gt: user.stats.totalScore },
      isAnonymous: false
    }) + 1;

    // Get category rankings
    const categories = ['geography', 'sports', 'space', 'history', 'science', 'pop-culture'];
    const categoryRanks = await Promise.all(
      categories.map(async (category) => {
        const categoryUsers = await User.aggregate([
          {
            $lookup: {
              from: 'games',
              localField: '_id',
              foreignField: 'players.userId',
              as: 'games'
            }
          },
          {
            $unwind: '$games'
          },
          {
            $match: {
              'games.settings.categories': category,
              'games.status': 'finished',
              isAnonymous: false
            }
          },
          {
            $group: {
              _id: '$_id',
              totalScore: { $sum: '$games.players.score' }
            }
          },
          {
            $sort: { totalScore: -1 }
          }
        ]);

        const userRank = categoryUsers.findIndex(u => u._id.toString() === userId) + 1;
        return {
          category,
          rank: userRank > 0 ? userRank : null,
          totalPlayers: categoryUsers.length
        };
      })
    );

    res.json({
      user: {
        ...user.toObject(),
        stats: {
          ...user.stats,
          accuracy: user.getAccuracy()
        }
      },
      globalRank,
      categoryRanks
    });
  } catch (error) {
    console.error('Get user ranking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
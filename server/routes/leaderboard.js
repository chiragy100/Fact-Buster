const express = require('express');
const router = express.Router();

// In-memory mock leaderboard data
const mockSessions = [];

// @route   POST /api/leaderboard/session
// @desc    Record a new game session
// @access  Public
router.post('/session', async (req, res) => {
  try {
    const {
      username,
      score,
      totalFacts,
      category,
      isGuest = true,
      longestStreak = 0,
      currentStreak = 0,
      streakHistory = [],
      accuracy = 0,
    } = req.body;

    if (!username || score === undefined || !totalFacts || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Generate unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const completedAt = new Date();

    const session = {
      id: sessionId,
      username,
      score,
      totalFacts,
      category,
      isGuest,
      longestStreak,
      currentStreak,
      streakHistory,
      accuracy,
      completedAt,
    };
    mockSessions.push(session);

    res.status(201).json({
      message: 'Game session recorded successfully',
      session,
    });
  } catch (error) {
    console.error('Record game session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaderboard
// @desc    Get global leaderboard
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    // Group by username and get best score, best streak, etc.
    const leaderboardMap = {};
    for (const session of mockSessions) {
      if (!leaderboardMap[session.username]) {
        leaderboardMap[session.username] = {
          username: session.username,
          bestScore: session.score,
          bestStreak: session.longestStreak,
          totalGames: 1,
          totalScore: session.score,
          accuracySum: session.accuracy || 0,
          accuracyCount: session.accuracy !== undefined ? 1 : 0,
          lastPlayed: session.completedAt,
        };
      } else {
        const entry = leaderboardMap[session.username];
        entry.bestScore = Math.max(entry.bestScore, session.score);
        entry.bestStreak = Math.max(entry.bestStreak, session.longestStreak);
        entry.totalGames += 1;
        entry.totalScore += session.score;
        entry.accuracySum += session.accuracy || 0;
        entry.accuracyCount += session.accuracy !== undefined ? 1 : 0;
        if (session.completedAt > entry.lastPlayed) {
          entry.lastPlayed = session.completedAt;
        }
      }
    }
    let leaderboard = Object.values(leaderboardMap);
    leaderboard = leaderboard.sort((a, b) => b.bestScore - a.bestScore || b.lastPlayed - a.lastPlayed);
    const paged = leaderboard.slice(Number(offset), Number(offset) + Number(limit));
    res.json({
      leaderboard: paged.map(entry => ({
        id: entry.username,
        username: entry.username,
        bestScore: entry.bestScore,
        bestStreak: entry.bestStreak,
        totalGames: entry.totalGames,
        totalScore: entry.totalScore,
        averageAccuracy: entry.accuracyCount ? Math.round(entry.accuracySum / entry.accuracyCount) : 0,
        lastPlayed: entry.lastPlayed,
      })),
      total: leaderboard.length,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaderboard/streaks
// @desc    Get global streak leaderboard
// @access  Public
router.get('/streaks', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    // Group by username and get best streak
    const streakMap = {};
    for (const session of mockSessions) {
      if (!streakMap[session.username]) {
        streakMap[session.username] = {
          username: session.username,
          bestStreak: session.longestStreak,
          totalGames: 1,
          totalScore: session.score,
          accuracySum: session.accuracy || 0,
          accuracyCount: session.accuracy !== undefined ? 1 : 0,
          lastPlayed: session.completedAt,
        };
      } else {
        const entry = streakMap[session.username];
        entry.bestStreak = Math.max(entry.bestStreak, session.longestStreak);
        entry.totalGames += 1;
        entry.totalScore += session.score;
        entry.accuracySum += session.accuracy || 0;
        entry.accuracyCount += session.accuracy !== undefined ? 1 : 0;
        if (session.completedAt > entry.lastPlayed) {
          entry.lastPlayed = session.completedAt;
        }
      }
    }
    let leaderboard = Object.values(streakMap);
    leaderboard = leaderboard.sort((a, b) => b.bestStreak - a.bestStreak || b.lastPlayed - a.lastPlayed);
    const paged = leaderboard.slice(Number(offset), Number(offset) + Number(limit));
    res.json({
      leaderboard: paged.map(entry => ({
        id: entry.username,
        username: entry.username,
        bestStreak: entry.bestStreak,
        totalGames: entry.totalGames,
        totalScore: entry.totalScore,
        averageAccuracy: entry.accuracyCount ? Math.round(entry.accuracySum / entry.accuracyCount) : 0,
        lastPlayed: entry.lastPlayed,
      })),
      total: leaderboard.length,
    });
  } catch (error) {
    console.error('Get streak leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaderboard/recent
// @desc    Get recent game sessions
// @access  Public
router.get('/recent', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const sorted = mockSessions.slice().sort((a, b) => b.completedAt - a.completedAt);
    const recentSessions = sorted.slice(0, Number(limit));
    res.json({
      recentSessions: recentSessions.map(session => ({
        id: session.id,
        username: session.username,
        score: session.score,
        totalFacts: session.totalFacts,
        category: session.category,
        completedAt: session.completedAt,
        accuracy: session.accuracy,
        longestStreak: session.longestStreak,
      })),
    });
  } catch (error) {
    console.error('Get recent sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaderboard/weekly
// @desc    Get weekly leaderboard
// @access  Public
router.get('/weekly', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    // Filter sessions from the last 7 days
    const weeklySessions = mockSessions.filter(session => session.completedAt >= oneWeekAgo);
    // Group by username
    const weeklyMap = {};
    for (const session of weeklySessions) {
      if (!weeklyMap[session.username]) {
        weeklyMap[session.username] = {
          username: session.username,
          bestScore: session.score,
          bestStreak: session.longestStreak,
          totalGames: 1,
          totalScore: session.score,
          accuracySum: session.accuracy || 0,
          accuracyCount: session.accuracy !== undefined ? 1 : 0,
          lastPlayed: session.completedAt,
        };
      } else {
        const entry = weeklyMap[session.username];
        entry.bestScore = Math.max(entry.bestScore, session.score);
        entry.bestStreak = Math.max(entry.bestStreak, session.longestStreak);
        entry.totalGames += 1;
        entry.totalScore += session.score;
        entry.accuracySum += session.accuracy || 0;
        entry.accuracyCount += session.accuracy !== undefined ? 1 : 0;
        if (session.completedAt > entry.lastPlayed) {
          entry.lastPlayed = session.completedAt;
        }
      }
    }
    let leaderboard = Object.values(weeklyMap);
    leaderboard = leaderboard.sort((a, b) => b.bestScore - a.bestScore || b.lastPlayed - a.lastPlayed);
    const paged = leaderboard.slice(Number(offset), Number(offset) + Number(limit));
    res.json({
      leaderboard: paged.map(entry => ({
        id: entry.username,
        username: entry.username,
        bestScore: entry.bestScore,
        bestStreak: entry.bestStreak,
        totalGames: entry.totalGames,
        totalScore: entry.totalScore,
        averageAccuracy: entry.accuracyCount ? Math.round(entry.accuracySum / entry.accuracyCount) : 0,
        lastPlayed: entry.lastPlayed,
      })),
      total: leaderboard.length,
    });
  } catch (error) {
    console.error('Get weekly leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
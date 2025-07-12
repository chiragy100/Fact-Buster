const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameType: {
    type: String,
    enum: ['solo', 'multiplayer'],
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'finished'],
    default: 'waiting'
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      default: 0
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    totalAnswers: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    bestStreak: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    isReady: {
      type: Boolean,
      default: false
    },
    isOnline: {
      type: Boolean,
      default: true
    }
  }],
  settings: {
    categories: [{
      type: String,
      enum: ['geography', 'sports', 'space', 'history', 'science', 'pop-culture']
    }],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    factCount: {
      type: Number,
      default: 10,
      min: 5,
      max: 20
    },
    timeLimit: {
      type: Number,
      default: 30, // seconds per fact
      min: 10,
      max: 60
    }
  },
  facts: [{
    factId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fact',
      required: true
    },
    content: String,
    category: String,
    isReal: Boolean,
    explanation: String,
    order: Number
  }],
  currentRound: {
    type: Number,
    default: 0
  },
  answers: [{
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    factId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fact'
    },
    guess: {
      type: Boolean, // true for real, false for fake
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    responseTime: {
      type: Number, // milliseconds
      required: true
    },
    points: {
      type: Number,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  roomCode: {
    type: String,
    unique: true,
    sparse: true
  },
  maxPlayers: {
    type: Number,
    default: 4,
    min: 2,
    max: 8
  }
}, {
  timestamps: true
});

// Generate room code for multiplayer games
gameSchema.methods.generateRoomCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  this.roomCode = result;
  return result;
};

// Add player to game
gameSchema.methods.addPlayer = function(userId, username) {
  if (this.players.length >= this.maxPlayers) {
    throw new Error('Game is full');
  }
  
  const existingPlayer = this.players.find(p => p.userId.toString() === userId.toString());
  if (existingPlayer) {
    existingPlayer.isOnline = true;
    return existingPlayer;
  }
  
  const newPlayer = {
    userId,
    username,
    score: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
    averageResponseTime: 0,
    isReady: false,
    isOnline: true
  };
  
  this.players.push(newPlayer);
  return newPlayer;
};

// Remove player from game
gameSchema.methods.removePlayer = function(userId) {
  const playerIndex = this.players.findIndex(p => p.userId.toString() === userId.toString());
  if (playerIndex !== -1) {
    this.players.splice(playerIndex, 1);
  }
};

// Submit answer
gameSchema.methods.submitAnswer = function(playerId, factId, guess, responseTime) {
  const fact = this.facts.find(f => f.factId.toString() === factId.toString());
  if (!fact) {
    throw new Error('Fact not found in game');
  }
  
  const isCorrect = guess === fact.isReal;
  const player = this.players.find(p => p.userId.toString() === playerId.toString());
  
  if (!player) {
    throw new Error('Player not found in game');
  }
  
  // Calculate points (base points + streak bonus + speed bonus)
  let points = isCorrect ? 10 : 0;
  
  if (isCorrect) {
    // Streak bonus
    if (player.currentStreak > 0) {
      points += Math.min(player.currentStreak * 2, 20);
    }
    
    // Speed bonus (faster = more points)
    const maxTime = this.settings.timeLimit * 1000;
    const timeBonus = Math.max(0, Math.floor((maxTime - responseTime) / 1000) * 2);
    points += timeBonus;
    
    player.currentStreak += 1;
    if (player.currentStreak > player.bestStreak) {
      player.bestStreak = player.currentStreak;
    }
  } else {
    player.currentStreak = 0;
  }
  
  // Update player stats
  player.score += points;
  player.correctAnswers += isCorrect ? 1 : 0;
  player.totalAnswers += 1;
  
  // Update average response time
  const totalTime = player.averageResponseTime * (player.totalAnswers - 1) + responseTime;
  player.averageResponseTime = totalTime / player.totalAnswers;
  
  // Record answer
  this.answers.push({
    playerId,
    factId,
    guess,
    isCorrect,
    responseTime,
    points,
    timestamp: new Date()
  });
  
  return { isCorrect, points, newScore: player.score };
};

// Check if game is ready to start
gameSchema.methods.isReadyToStart = function() {
  if (this.gameType === 'solo') {
    return this.players.length === 1 && this.players[0].isReady;
  }
  
  return this.players.length >= 2 && this.players.every(p => p.isReady);
};

// Get game results
gameSchema.methods.getResults = function() {
  const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);
  
  return {
    winner: sortedPlayers[0],
    rankings: sortedPlayers.map((player, index) => ({
      ...player.toObject(),
      rank: index + 1
    })),
    totalRounds: this.facts.length,
    gameDuration: this.endTime ? this.endTime - this.startTime : null
  };
};

module.exports = mongoose.model('Game', gameSchema); 
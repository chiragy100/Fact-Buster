const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: null
  },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    totalAnswers: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 }
  },
  preferences: {
    favoriteCategories: [{ type: String }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate accuracy
userSchema.methods.getAccuracy = function() {
  if (this.stats.totalAnswers === 0) return 0;
  return Math.round((this.stats.correctAnswers / this.stats.totalAnswers) * 100);
};

// Update stats after game
userSchema.methods.updateStats = function(gameResult) {
  this.stats.gamesPlayed += 1;
  this.stats.totalScore += gameResult.score || 0;
  this.stats.correctAnswers += gameResult.correct || 0;
  this.stats.totalAnswers += gameResult.total || 0;
  
  if (gameResult.streak > this.stats.bestStreak) {
    this.stats.bestStreak = gameResult.streak;
  }
  
  // Update average response time
  if (gameResult.avgResponseTime) {
    const totalTime = this.stats.averageResponseTime * (this.stats.totalAnswers - gameResult.total) + 
                     gameResult.avgResponseTime * gameResult.total;
    this.stats.averageResponseTime = totalTime / this.stats.totalAnswers;
  }
  
  this.lastActive = new Date();
};

module.exports = mongoose.model('User', userSchema); 
const mongoose = require('mongoose');

const factSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['geography', 'sports', 'space', 'history', 'science', 'pop-culture']
  },
  isReal: {
    type: Boolean,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  source: {
    type: String,
    default: null // For real facts, this could be a URL or reference
  },
  explanation: {
    type: String,
    default: null // Brief explanation of why it's real or fake
  },
  tags: [{
    type: String,
    trim: true
  }],
  usageCount: {
    type: Number,
    default: 0
  },
  correctGuesses: {
    type: Number,
    default: 0
  },
  totalGuesses: {
    type: Number,
    default: 0
  },
  averageResponseTime: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for system-generated facts
  },
  aiGenerated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
factSchema.index({ category: 1, difficulty: 1, isActive: 1 });
factSchema.index({ isReal: 1, category: 1 });
factSchema.index({ usageCount: -1 });

// Calculate success rate
factSchema.methods.getSuccessRate = function() {
  if (this.totalGuesses === 0) return 0;
  return Math.round((this.correctGuesses / this.totalGuesses) * 100);
};

// Update usage statistics
factSchema.methods.updateUsage = function(isCorrect, responseTime) {
  this.usageCount += 1;
  this.totalGuesses += 1;
  
  if (isCorrect) {
    this.correctGuesses += 1;
  }
  
  // Update average response time
  if (responseTime) {
    const totalTime = this.averageResponseTime * (this.totalGuesses - 1) + responseTime;
    this.averageResponseTime = totalTime / this.totalGuesses;
  }
};

// Get random fact by category and difficulty
factSchema.statics.getRandomFact = async function(category = null, difficulty = null, excludeIds = []) {
  const query = { isActive: true };
  
  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  if (excludeIds.length > 0) query._id = { $nin: excludeIds };
  
  const count = await this.countDocuments(query);
  const random = Math.floor(Math.random() * count);
  
  return this.findOne(query).skip(random);
};

// Get facts for a game round
factSchema.statics.getGameFacts = async function(count = 10, categories = null, difficulty = null) {
  const query = { isActive: true };
  
  if (categories && categories.length > 0) {
    query.category = { $in: categories };
  }
  
  if (difficulty) query.difficulty = difficulty;
  
  // Get a mix of real and fake facts
  const realFacts = await this.find({ ...query, isReal: true })
    .limit(Math.ceil(count / 2))
    .sort({ usageCount: 1 }); // Prefer less used facts
  
  const fakeFacts = await this.find({ ...query, isReal: false })
    .limit(Math.floor(count / 2))
    .sort({ usageCount: 1 });
  
  // Combine and shuffle
  const allFacts = [...realFacts, ...fakeFacts];
  return allFacts.sort(() => Math.random() - 0.5).slice(0, count);
};

module.exports = mongoose.model('Fact', factSchema); 
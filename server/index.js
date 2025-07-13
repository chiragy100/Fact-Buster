const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const factsRoutes = require('./routes/facts');
const gamesRoutes = require('./routes/games');
const leaderboardRoutes = require('./routes/leaderboard');
const multiplayerRoutes = require('./routes/multiplayer');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);
// Socket.io setup
const { initializeSocket } = require('./socket/socketHandler');
const io = initializeSocket(server);

// Trust proxy to fix rate limiting issues
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/facts', factsRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/multiplayer', multiplayerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Fact Buster API is running' });
});

// Socket.io connection handling
// The socketHandler function is now imported directly and its initialization is handled here.

const PORT = process.env.PORT || 5001;

// Start server immediately (no DB connection needed)
server.listen(PORT, () => {
  console.log(`🚀 Fact Buster server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready for real-time connections`);
});

module.exports = { app, server, io }; 
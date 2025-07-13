// Mock multiplayer service without mongoose dependencies
const { v4: uuidv4 } = require('uuid');

// General Knowledge questions for multiplayer
const generalKnowledgeQuestions = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris",
    explanation: "Paris is the capital and largest city of France."
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "Mars",
    explanation: "Mars is called the Red Planet due to its reddish appearance."
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correctAnswer: "Pacific Ocean",
    explanation: "The Pacific Ocean is the largest and deepest ocean on Earth."
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
    correctAnswer: "Leonardo da Vinci",
    explanation: "The Mona Lisa was painted by Italian artist Leonardo da Vinci."
  },
  {
    question: "What is the chemical symbol for gold?",
    options: ["Ag", "Au", "Fe", "Cu"],
    correctAnswer: "Au",
    explanation: "Au comes from the Latin word for gold, 'aurum'."
  },
  {
    question: "Which country is home to the kangaroo?",
    options: ["New Zealand", "South Africa", "Australia", "Brazil"],
    correctAnswer: "Australia",
    explanation: "Kangaroos are native to Australia and are a national symbol."
  },
  {
    question: "What is the largest mammal in the world?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
    correctAnswer: "Blue Whale",
    explanation: "The blue whale is the largest animal known to have ever existed."
  },
  {
    question: "How many continents are there?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "7",
    explanation: "There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia."
  },
  {
    question: "What is the main component of the sun?",
    options: ["Liquid lava", "Molten iron", "Hydrogen gas", "Solid rock"],
    correctAnswer: "Hydrogen gas",
    explanation: "The sun is primarily composed of hydrogen gas that undergoes nuclear fusion."
  },
  {
    question: "Which year did World War II end?",
    options: ["1943", "1944", "1945", "1946"],
    correctAnswer: "1945",
    explanation: "World War II ended in 1945 with the surrender of Germany and Japan."
  },
  {
    question: "What is the largest desert in the world?",
    options: ["Sahara Desert", "Arabian Desert", "Gobi Desert", "Antarctic Desert"],
    correctAnswer: "Antarctic Desert",
    explanation: "The Antarctic Desert is the largest desert in the world, covering 14.2 million square kilometers."
  },
  {
    question: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "6",
    explanation: "A hexagon is a six-sided polygon."
  },
  {
    question: "What is the fastest land animal?",
    options: ["Lion", "Cheetah", "Leopard", "Gazelle"],
    correctAnswer: "Cheetah",
    explanation: "The cheetah can reach speeds of up to 70 mph (113 km/h)."
  },
  {
    question: "Which element has the chemical symbol 'O'?",
    options: ["Osmium", "Oxygen", "Oganesson", "Osmium"],
    correctAnswer: "Oxygen",
    explanation: "Oxygen is essential for respiration and has the symbol 'O'."
  },
  {
    question: "What is the smallest country in the world?",
    options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"],
    correctAnswer: "Vatican City",
    explanation: "Vatican City is the smallest independent state in the world."
  }
];

class MultiplayerService {
  constructor() {
    this.activeGames = new Map(); // roomCode -> gameState
    this.playerConnections = new Map(); // userId -> socketId
  }

  // Generate a random room code
  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Create a new game room
  async createRoom(hostId, hostUsername, category = 'general-knowledge') {
    try {
      const roomCode = this.generateRoomCode();
      
      const gameRoom = {
        roomCode,
        hostId,
        hostUsername,
        category,
        maxPlayers: 4,
        currentPlayers: [{
          id: hostId,
          username: hostUsername,
          isHost: true,
          score: 0,
          answers: []
        }],
        gameState: 'waiting',
        currentRound: 0,
        totalRounds: 10,
        currentQuestion: null,
        gameHistory: [],
        finalResults: null,
        winner: null,
        createdAt: new Date(),
        isActive: true
      };
      
      // Store in memory for quick access
      this.activeGames.set(roomCode, {
        room: gameRoom,
        currentQuestion: null,
        roundAnswers: new Map(),
        roundTimer: null
      });

      console.log(`🎮 Created game room: ${roomCode} by ${hostUsername}`);
      
      return gameRoom;
    } catch (error) {
      console.error('❌ Error creating game room:', error);
      throw error;
    }
  }

  // Join an existing game room
  async joinRoom(roomCode, userId, username) {
    try {
      const activeGame = this.activeGames.get(roomCode);
      
      if (!activeGame || !activeGame.room.isActive) {
        throw new Error('Room not found or inactive');
      }

      const gameRoom = activeGame.room;

      if (gameRoom.gameState !== 'waiting') {
        throw new Error('Game already in progress');
      }

      if (gameRoom.currentPlayers.length >= gameRoom.maxPlayers) {
        throw new Error('Room is full');
      }

      // Check if player already joined
      const existingPlayer = gameRoom.currentPlayers.find(p => p.id === userId);
      if (existingPlayer) {
        throw new Error('Player already in room');
      }

      // Add new player
      gameRoom.currentPlayers.push({
        id: userId,
        username,
        isHost: false,
        score: 0,
        answers: []
      });

      console.log(`👥 ${username} joined room: ${roomCode}`);
      
      return gameRoom;
    } catch (error) {
      console.error('❌ Error joining room:', error);
      throw error;
    }
  }

  // Leave a game room
  async leaveRoom(roomCode, userId) {
    try {
      const activeGame = this.activeGames.get(roomCode);
      
      if (!activeGame) {
        return null;
      }

      const gameRoom = activeGame.room;
      const playerIndex = gameRoom.currentPlayers.findIndex(p => p.id === userId);
      
      if (playerIndex === -1) {
        return null;
      }

      const removedPlayer = gameRoom.currentPlayers.splice(playerIndex, 1)[0];

      // If no players left, delete the room
      if (gameRoom.currentPlayers.length === 0) {
        this.activeGames.delete(roomCode);
        console.log(`🗑️ Deleted empty room: ${roomCode}`);
      }

      console.log(`👋 ${removedPlayer.username} left room: ${roomCode}`);
      
      return { removedPlayer, gameRoom };
    } catch (error) {
      console.error('❌ Error leaving room:', error);
      throw error;
    }
  }

  // Start a game
  async startGame(roomCode) {
    try {
      const activeGame = this.activeGames.get(roomCode);
      
      if (!activeGame) {
        throw new Error('Room not found');
      }

      const gameRoom = activeGame.room;

      if (gameRoom.gameState !== 'waiting') {
        throw new Error('Game already started');
      }

      if (gameRoom.currentPlayers.length < 2) {
        throw new Error('Need at least 2 players to start');
      }

      gameRoom.gameState = 'playing';
      gameRoom.currentRound = 1;
      
      // Set first question
      const firstQuestion = this.getRandomQuestion();
      gameRoom.currentQuestion = firstQuestion;
      
      // Update memory cache
      activeGame.currentQuestion = firstQuestion;
      activeGame.roundAnswers.clear();

      console.log(`🚀 Game started in room: ${roomCode}`);
      
      return { gameRoom, firstQuestion };
    } catch (error) {
      console.error('❌ Error starting game:', error);
      throw error;
    }
  }

  // Submit an answer
  async submitAnswer(roomCode, userId, answer, timeSpent) {
    try {
      const activeGame = this.activeGames.get(roomCode);
      
      if (!activeGame) {
        throw new Error('Room not found');
      }

      const gameRoom = activeGame.room;
      const player = gameRoom.currentPlayers.find(p => p.id === userId);
      
      if (!player) {
        throw new Error('Player not found in room');
      }

      const currentQuestion = activeGame.currentQuestion;
      if (!currentQuestion) {
        throw new Error('No active question');
      }

      const isCorrect = answer === currentQuestion.correctAnswer;
      const points = isCorrect ? Math.max(10 - Math.floor(timeSpent / 10), 1) : 0;
      
      player.score += points;
      player.answers.push({
        question: currentQuestion.question,
        answer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        points,
        timeSpent
      });

      // Store answer for round results
      activeGame.roundAnswers.set(userId, {
        username: player.username,
        answer,
        isCorrect,
        points,
        timeSpent
      });

      console.log(`📝 ${player.username} answered: ${answer} (${isCorrect ? 'correct' : 'incorrect'})`);
      
      return {
        isCorrect,
        points,
        correctAnswer: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation
      };
    } catch (error) {
      console.error('❌ Error submitting answer:', error);
      throw error;
    }
  }

  // Get round results
  async getRoundResults(roomCode) {
    try {
      const activeGame = this.activeGames.get(roomCode);
      
      if (!activeGame) {
        throw new Error('Room not found');
      }

      const roundAnswers = Array.from(activeGame.roundAnswers.values());
      
      return {
        answers: roundAnswers,
        question: activeGame.currentQuestion,
        roundNumber: activeGame.room.currentRound
      };
    } catch (error) {
      console.error('❌ Error getting round results:', error);
      throw error;
    }
  }

  // End round and get next question
  async endRound(roomCode) {
    try {
      const activeGame = this.activeGames.get(roomCode);
      
      if (!activeGame) {
        throw new Error('Room not found');
      }

      const gameRoom = activeGame.room;
      const roundResults = await this.getRoundResults(roomCode);
      
      gameRoom.currentRound++;
      
      // Check if game is finished
      if (gameRoom.currentRound > gameRoom.totalRounds) {
        gameRoom.gameState = 'finished';
        
        // Calculate final results
        const sortedPlayers = [...gameRoom.currentPlayers].sort((a, b) => b.score - a.score);
        gameRoom.finalResults = sortedPlayers;
        gameRoom.winner = sortedPlayers[0];
        
        return {
          roundResults,
          nextQuestion: null,
          gameFinished: true,
          gameRoom
        };
      }
      
      // Get next question
      const nextQuestion = this.getRandomQuestion();
      gameRoom.currentQuestion = nextQuestion;
      activeGame.currentQuestion = nextQuestion;
      activeGame.roundAnswers.clear();

      return {
        roundResults,
        nextQuestion,
        gameFinished: false,
        gameRoom
      };
    } catch (error) {
      console.error('❌ Error ending round:', error);
      throw error;
    }
  }

  // Get a random question
  getRandomQuestion() {
    const randomIndex = Math.floor(Math.random() * generalKnowledgeQuestions.length);
    return generalKnowledgeQuestions[randomIndex];
  }

  // Get game by room code
  async getGameByRoomCode(roomCode) {
    const activeGame = this.activeGames.get(roomCode);
    return activeGame ? activeGame.room : null;
  }

  // Get active games
  async getActiveGames() {
    return Array.from(this.activeGames.values())
      .filter(activeGame => activeGame.room.isActive && activeGame.room.gameState === 'waiting')
      .map(activeGame => activeGame.room);
  }

  // Cleanup inactive games
  async cleanupInactiveGames() {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
    
    for (const [roomCode, activeGame] of this.activeGames.entries()) {
      const timeSinceCreation = now - activeGame.room.createdAt;
      
      if (timeSinceCreation > inactiveThreshold && activeGame.room.gameState === 'waiting') {
        this.activeGames.delete(roomCode);
        console.log(`🧹 Cleaned up inactive room: ${roomCode}`);
      }
    }
  }

  // Store player connection
  storePlayerConnection(userId, socketId) {
    this.playerConnections.set(userId, socketId);
  }

  // Remove player connection
  removePlayerConnection(userId) {
    this.playerConnections.delete(userId);
  }

  // Get player socket ID
  getPlayerSocketId(userId) {
    return this.playerConnections.get(userId);
  }
}

module.exports = new MultiplayerService(); 
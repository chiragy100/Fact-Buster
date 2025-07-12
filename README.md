# Fact Buster 🧠

A web-based trivia game where players test their knowledge by guessing whether facts are real or AI-generated. Challenge yourself in solo mode or compete with friends in real-time multiplayer battles!

## 🎮 Features

### Core Gameplay
- **Fact Classification**: Guess whether facts are real or AI-generated
- **Multiple Categories**: Geography, Sports, Space, History, Science, Pop Culture
- **Difficulty Levels**: Easy, Medium, Hard
- **Scoring System**: Points based on accuracy, speed, and streaks

### Game Modes
- **Solo Challenge**: Practice alone with customizable settings
- **Multiplayer Battle**: Real-time competition with 2-8 players
- **Global Leaderboards**: Track your progress against other players
- **Category Rankings**: Specialized leaderboards for each topic

### User Features
- **Anonymous Play**: Start playing immediately without registration
- **User Accounts**: Full registration with persistent stats
- **Profile Management**: View detailed statistics and achievements
- **Game History**: Track your past performances

### Real-time Features
- **Live Chat**: Communicate with other players during games
- **Emoji Reactions**: Express yourself with quick reactions
- **Real-time Scoring**: See points update instantly
- **Player Status**: Track who's online and ready

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Framer Motion** - Smooth animations
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **React Hot Toast** - User notifications
- **Zustand** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **OpenAI API** - AI-generated fake facts

### Development Tools
- **Concurrently** - Run frontend and backend simultaneously
- **Nodemon** - Auto-restart server on changes
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- OpenAI API key (for fake fact generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FactBuster
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   **Backend:**
   ```bash
   cd server
   cp env.example .env
   ```
   
   Edit `server/.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/factbuster
   JWT_SECRET=your-super-secret-jwt-key
   OPENAI_API_KEY=your-openai-api-key
   ```
   
   **Frontend:**
   ```bash
   cd client
   cp env.example .env
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend development server on `http://localhost:3000`

## 📁 Project Structure

```
FactBuster/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── socket/           # Socket.io handlers
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/anonymous` - Anonymous login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Facts
- `GET /api/facts/random` - Get random fact
- `GET /api/facts/game` - Get facts for game
- `POST /api/facts/generate` - Generate fake fact with AI
- `GET /api/facts/categories` - Get fact categories
- `PUT /api/facts/:id/usage` - Update fact usage stats

### Games
- `POST /api/games/solo` - Create solo game
- `POST /api/games/multiplayer` - Create multiplayer game
- `GET /api/games/:id` - Get game details
- `POST /api/games/:id/join` - Join game
- `POST /api/games/:id/ready` - Mark player ready
- `POST /api/games/:id/answer` - Submit answer

### Leaderboard
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/category/:category` - Category leaderboard
- `GET /api/leaderboard/weekly` - Weekly leaderboard
- `GET /api/leaderboard/user/:userId` - User ranking

## 🎮 Game Rules

### Scoring System
- **Base Points**: 10 points for correct answers
- **Streak Bonus**: +2 points per consecutive correct answer (max 20)
- **Speed Bonus**: +2 points per second under time limit
- **Accuracy**: No points for incorrect answers

### Game Flow
1. **Setup**: Choose categories, difficulty, and number of facts
2. **Gameplay**: Read facts and classify as real or fake
3. **Scoring**: Points awarded based on accuracy and speed
4. **Results**: View final score and performance breakdown

### Multiplayer Features
- **Room Codes**: 6-character codes to join games
- **Ready System**: All players must be ready to start
- **Real-time Updates**: Live scoring and player status
- **Chat System**: In-game communication

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/factbuster
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
CLIENT_URL=http://localhost:3000
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Database Setup

The application uses MongoDB with the following collections:
- `users` - User accounts and statistics
- `facts` - Real and AI-generated facts
- `games` - Game sessions and results

### OpenAI Integration

The app uses OpenAI's GPT API to generate believable fake facts. Set up your API key in the backend environment variables.

## 🚀 Deployment

### Backend Deployment
1. Set up a MongoDB instance (MongoDB Atlas recommended)
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, Vercel, etc.)

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy the `build` folder to your hosting platform
3. Update environment variables for production URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT API
- The React and Node.js communities
- All contributors and testers

## 📞 Support

For questions or support, please open an issue on GitHub or contact the development team.

---

**Happy Fact Busting! 🧠✨** 
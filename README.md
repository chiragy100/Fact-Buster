# 🎯 FactBuster - Real vs Fake Trivia Game

A modern, interactive trivia game where players test their knowledge by distinguishing between real and fake facts. Built with React, Node.js, and Firebase for a seamless gaming experience.

![FactBuster Demo](https://img.shields.io/badge/Status-Live%20Demo-brightgreen)
![React](https://img.shields.io/badge/React-18.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.0.0-green)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-orange)

## 🚀 Live Demo

**Frontend**: [http://localhost:3000](http://localhost:3000)  
**Backend API**: [http://localhost:5001](http://localhost:5001)

## ✨ Features

### 🎮 Core Gameplay
- **Solo Mode**: Challenge yourself with curated fact-checking questions
- **Multiple Categories**: General Knowledge (50 questions) & Science & Technology (25 questions)
- **Real-time Feedback**: Instant scoring and detailed explanations
- **Streak Tracking**: Monitor your progress with visual progress bars
- **Educational Content**: Learn while you play with verified facts

### 🔐 Authentication & User Experience
- **Firebase Authentication**: Secure Google and email login
- **Guest Mode**: Play instantly without registration
- **User Profiles**: Track your gaming history and achievements
- **Responsive Design**: Works seamlessly on desktop and mobile

### 🏆 Progress & Analytics
- **Streak System**: Track your longest streaks per category
- **Progress Visualization**: Beautiful progress bars with milestone badges
- **Offline Support**: Continue playing even with connection issues
- **Real-time Updates**: Live streak updates during gameplay

### 🎯 Multiplayer Features (Coming Soon)
- **Real-time Rooms**: Compete with friends in live multiplayer
- **Socket.io Integration**: Seamless real-time communication
- **Leaderboards**: Global and friend-based rankings
- **Social Features**: Invite friends and share achievements

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Framer Motion** - Smooth animations and transitions
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - User notifications

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Rate Limiting** - API protection

### Authentication & Database
- **Firebase Authentication** - User management
- **Firestore** - Cloud database (for user data)
- **Firebase Admin SDK** - Server-side Firebase integration

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server
- **Concurrently** - Run multiple commands

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/chiragy100/Fact-Buster.git
cd Fact-Buster
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Setup

#### Backend (.env in server directory)
```env
PORT=5001
CLIENT_URL=http://localhost:3000
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_key
```

#### Frontend (.env in client directory)
```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
```

### 4. Start Development Servers
```bash
# Start both frontend and backend (from root directory)
npm start

# Or start individually:
# Backend (from server directory)
cd server && npm start (I did face some erros with this command so might need the alternate command for this which for me was: cd client; npm start)

# Frontend (from client directory)
cd client && npm start
```

## 🎮 How to Play

### Getting Started
1. **Visit the app**: Navigate to [http://localhost:3000](http://localhost:3000)
2. **Choose your mode**: Sign up/login or play as a guest
3. **Select a category**: Choose from General Knowledge or Science & Technology
4. **Start playing**: Read each fact and decide if it's real or fake
5. **Track your progress**: Watch your streak grow and learn from explanations

### Game Rules
- Each question presents a fact
- Click "Real" or "Fake" based on your knowledge
- Get immediate feedback with detailed explanations
- Build streaks by answering correctly
- Challenge yourself to beat your personal best

## 📊 Project Structure

```
FactBuster/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── index.js       # App entry point
│   └── package.json
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── socket/           # Socket.io handlers
│   └── index.js          # Server entry point
├── README.md
└── package.json
```

## 🔧 API Endpoints

### Facts
- `GET /api/facts/random` - Get a random fact
- `GET /api/facts/game` - Get facts for game rounds
- `GET /api/facts/categories` - Get available categories
- `GET /api/facts/stats` - Get fact statistics

### Games
- `POST /api/games/solo` - Create solo game
- `GET /api/games/active` - Get active games
- `POST /api/games/:id/join` - Join multiplayer game
- `POST /api/games/:id/answer` - Submit answer

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify email

## 🎨 Key Features in Detail

### Streak Tracking System
- **Real-time Updates**: Streaks update instantly during gameplay
- **Visual Progress**: Beautiful progress bars with milestone indicators
- **Offline Resilience**: Local storage backup for uninterrupted play
- **Category-specific**: Separate tracking for each category

### Content Management
- **Curated Questions**: 50 General Knowledge + 25 Science & Technology questions
- **Fact-checked**: All content verified from reliable sources
- **Educational**: Detailed explanations for learning
- **Scalable**: Easy to add new categories and questions

### User Experience
- **Smooth Navigation**: Intuitive routing with scroll-to-top
- **Loading States**: Professional loading indicators
- **Error Handling**: Graceful error recovery
- **Responsive Design**: Works on all screen sizes

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy the build folder
```

### Backend (Heroku/Railway)
```bash
cd server
# Set environment variables
# Deploy to your preferred platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Chirag Yadav** - [chiragy100](https://github.com/chiragy100)

## 🙏 Acknowledgments

- Firebase for authentication and database services
- React community for excellent documentation
- All contributors and testers

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainer.

---

⭐ **Star this repository if you found it helpful!** 

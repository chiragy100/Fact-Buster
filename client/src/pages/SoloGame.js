import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { updateUserStreak } from '../services/streakService';
import { useGame } from '../contexts/GameContext';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Trophy,
  User,
  Brain,
  Flame
} from 'lucide-react';

const SoloGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated } = useAuth();
  const { getGameFacts } = useGame();
  const [username, setUsername] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [currentFact, setCurrentFact] = useState(0);
  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [streakHistory, setStreakHistory] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load facts from backend based on selected category
  const loadFacts = async (category) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get 30 facts for the selected category
      const result = await getGameFacts(30, [category]);
      
      if (result.success) {
        setFacts(result.facts);
        console.log(`Loaded ${result.facts.length} facts for category: ${category}`);
      } else {
        setError(result.error || 'Failed to load facts');
        console.error('Failed to load facts:', result.error);
      }
    } catch (error) {
      setError('Failed to load facts from server');
      console.error('Error loading facts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback facts if backend fails
  const fallbackFacts = [
    {
      fact: "Bananas are technically herbs, and the \"tree\" they grow on is classified as the world's largest flowering herbaceous plant.",
      isReal: true,
      explanation: "Real - Bananas are indeed herbs, and the banana plant is the world's largest herbaceous flowering plant, not a tree."
    },
    {
      fact: "The first ever recorded computer virus was designed to promote an antivirus software by the same company.",
      isReal: false,
      explanation: "Fake – It was a prank, not marketing."
    },
    {
      fact: "The Eiffel Tower grows by up to 6 inches during summer due to thermal expansion of the metal.",
      isReal: true,
      explanation: "Real - The Eiffel Tower does expand in the heat due to thermal expansion of the iron."
    },
    {
      fact: "In ancient Rome, urine was taxed because it was used in textile processing and tooth cleaning.",
      isReal: true,
      explanation: "Real - Roman urine was indeed taxed as it was used in various industrial processes."
    },
    {
      fact: "The Great Wall of China was built in a continuous, uninterrupted effort over 2,000 years.",
      isReal: false,
      explanation: "Fake – Built in fragments by different dynasties."
    },
    {
      fact: "Sharks can live up to 500 years, making them the longest-living vertebrates.",
      isReal: true,
      explanation: "Real – Greenland sharks can live up to 500 years."
    },
    {
      fact: "Albert Einstein declined the offer to become President of Germany after World War II.",
      isReal: false,
      explanation: "Fake – He was offered Israel's presidency."
    },
    {
      fact: "Most of the oxygen on Earth comes from the Amazon rainforest.",
      isReal: false,
      explanation: "Fake – Most comes from oceanic plankton."
    },
    {
      fact: "During WWII, British spies used Monopoly games to smuggle maps and compasses to prisoners of war.",
      isReal: true,
      explanation: "Real - British intelligence did use Monopoly games to smuggle escape tools to POWs."
    },
    {
      fact: "A bolt of lightning has enough energy to boil 1 million cups of tea.",
      isReal: true,
      explanation: "Real – It carries up to 1 billion joules."
    },
    {
      fact: "There's a species of jellyfish known to biologically revert to a younger state, effectively making it immortal.",
      isReal: true,
      explanation: "Real - The Turritopsis dohrnii jellyfish can revert to its polyp stage."
    },
    {
      fact: "In Switzerland, it's illegal to own just one guinea pig because they get lonely.",
      isReal: true,
      explanation: "Real - Swiss animal welfare laws require guinea pigs to be kept in pairs."
    },
    {
      fact: "The longest time a person has stayed awake voluntarily is 43 days.",
      isReal: false,
      explanation: "Fake – The record is 11 days."
    },
    {
      fact: "The current U.S. flag was designed by a 17-year-old for a school project and earned a B-.",
      isReal: true,
      explanation: "Real - Robert Heft designed the 50-star flag as a school project."
    },
    {
      fact: "Earth is closer to the sun in July than in January.",
      isReal: true,
      explanation: "Real – But seasons are caused by axial tilt."
    },
    {
      fact: "You can balance a raw egg perfectly upright only on the spring equinox.",
      isReal: false,
      explanation: "Fake - This is a common myth with no scientific basis."
    },
    {
      fact: "It rains diamonds on Neptune and Uranus due to atmospheric pressure.",
      isReal: true,
      explanation: "Real - The extreme pressure can convert carbon into diamonds."
    },
    {
      fact: "The microwave was invented after a scientist walked past a radar and a chocolate bar melted in his pocket.",
      isReal: true,
      explanation: "Real - Percy Spencer discovered microwave cooking when a chocolate bar melted in his pocket."
    },
    {
      fact: "Humans can distinguish over 500 different musical notes by frequency.",
      isReal: false,
      explanation: "Fake – We can distinguish over 1,400 distinct pitches."
    },
    {
      fact: "The first oranges were actually green, not orange.",
      isReal: true,
      explanation: "Real - Original oranges were green, the orange color came from selective breeding."
    },
    {
      fact: "Venus is the hottest planet in the solar system, even though Mercury is closer to the Sun.",
      isReal: true,
      explanation: "Real - Venus's thick atmosphere creates a greenhouse effect making it hotter than Mercury."
    },
    {
      fact: "Typing \"Google\" into Google crashes the internet.",
      isReal: false,
      explanation: "Fake - This is a common internet myth."
    },
    {
      fact: "Octopuses can taste things through their arms.",
      isReal: true,
      explanation: "Real - Octopuses have taste receptors on their suckers."
    },
    {
      fact: "Thomas Edison invented the motion picture camera, the electric light bulb, and the telephone.",
      isReal: false,
      explanation: "Fake – He didn't invent the telephone (Bell did)."
    },
    {
      fact: "The average person walks the equivalent of three times around the Earth in their lifetime.",
      isReal: true,
      explanation: "Real - The average person walks about 75,000 miles in their lifetime."
    },
    {
      fact: "If the sun were the size of a white blood cell, the Milky Way would be the size of the Earth.",
      isReal: true,
      explanation: "Real - This scale comparison is accurate."
    },
    {
      fact: "You're never more than 10 feet away from a spider.",
      isReal: false,
      explanation: "Fake – There's no scientific basis for this claim."
    },
    {
      fact: "Peanuts are not nuts; they're legumes.",
      isReal: true,
      explanation: "Real - Peanuts are legumes, not true nuts."
    },
    {
      fact: "Butterflies can see ultraviolet light, which humans cannot.",
      isReal: true,
      explanation: "Real - Butterflies can see UV light, which helps them find flowers and mates."
    },
    {
      fact: "The Atlantic and Pacific Oceans don't mix due to salinity and temperature barriers.",
      isReal: false,
      explanation: "Fake – They do mix, though slowly."
    },
    {
      fact: "Birds are the only animals with hollow bones.",
      isReal: false,
      explanation: "Fake – Some dinosaurs and bats also have hollow bones."
    },
    {
      fact: "Cleopatra lived closer to the invention of the iPhone than to the construction of the pyramids.",
      isReal: true,
      explanation: "Real - Cleopatra lived around 30 BC, while the pyramids were built around 2500 BC."
    },
    {
      fact: "A blue whale's heart is the size of a school bus and its heartbeat can be detected from 2 miles away.",
      isReal: true,
      explanation: "Real - A blue whale's heart can weigh up to 400 pounds."
    },
    {
      fact: "You cannot hum while holding your nose shut.",
      isReal: true,
      explanation: "Real - Try it! You can't hum with your nose pinched."
    },
    {
      fact: "Cows have best friends and get stressed when separated.",
      isReal: true,
      explanation: "Real - Cows form strong social bonds and prefer to be with their friends."
    },
    {
      fact: "The human body contains enough iron to make a 3-inch nail.",
      isReal: true,
      explanation: "Real - The average human body contains about 4 grams of iron."
    },
    {
      fact: "A day on Venus is longer than a year on Venus.",
      isReal: true,
      explanation: "Real - Venus takes 243 Earth days to rotate but only 225 Earth days to orbit the Sun."
    },
    {
      fact: "The first computer mouse was made of wood.",
      isReal: true,
      explanation: "Real - Douglas Engelbart's first mouse prototype was made of wood in 1964."
    },
    {
      fact: "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
      isReal: true,
      explanation: "Real - Honey's low moisture content and acidic pH make it naturally antimicrobial."
    },
    {
      fact: "The shortest war in history lasted only 38 minutes.",
      isReal: true,
      explanation: "Real - The Anglo-Zanzibar War of 1896 lasted 38 minutes."
    },
    {
      fact: "A group of flamingos is called a 'flamboyance'.",
      isReal: true,
      explanation: "Real - This is the official collective noun for flamingos."
    },
    {
      fact: "The Great Wall of China is visible from space with the naked eye.",
      isReal: false,
      explanation: "Fake - It's not visible from space with the naked eye, though it can be seen from low Earth orbit with magnification."
    },
    {
      fact: "There are more possible iterations of a game of chess than there are atoms in the observable universe.",
      isReal: true,
      explanation: "Real - The Shannon number estimates 10^120 possible chess games, while the universe has about 10^80 atoms."
    },
    {
      fact: "A day on Mars is only 37 minutes longer than a day on Earth.",
      isReal: true,
      explanation: "Real - A Martian day (sol) is 24 hours and 37 minutes."
    },
    {
      fact: "The first oranges were actually green, not orange.",
      isReal: true,
      explanation: "Real - Original oranges were green, the orange color came from selective breeding."
    },
    {
      fact: "You can't sneeze with your eyes open.",
      isReal: false,
      explanation: "Fake - While it's difficult, it is possible to sneeze with your eyes open."
    },
    {
      fact: "The average person spends 6 months of their lifetime waiting for red lights to turn green.",
      isReal: true,
      explanation: "Real - This is a commonly cited statistic about time spent at traffic lights."
    },
    {
      fact: "A bolt of lightning is 5 times hotter than the surface of the sun.",
      isReal: true,
      explanation: "Real - Lightning can reach temperatures of 30,000°C, while the sun's surface is about 5,500°C."
    },
    {
      fact: "The first computer bug was an actual bug.",
      isReal: true,
      explanation: "Real - In 1947, Grace Hopper found a moth causing problems in the Harvard Mark II computer."
    },
    {
      fact: "You can't fold a piece of paper in half more than 7 times.",
      isReal: false,
      explanation: "Fake - While difficult, it's possible to fold paper more than 7 times with the right technique and paper size."
    },
    {
      fact: "The average person walks the equivalent of three times around the Earth in their lifetime.",
      isReal: true,
      explanation: "Real - The average person walks about 75,000 miles in their lifetime."
    },
    {
      fact: "There are more atoms in a glass of water than glasses of water in all the oceans.",
      isReal: true,
      explanation: "Real - A glass of water contains about 10^24 atoms, while there are about 10^21 glasses of water in the oceans."
    }
  ];

  useEffect(() => {
    // Set username based on authentication status
    if (isAuthenticated && currentUser) {
      const displayName = currentUser.displayName || 'User';
      setUsername(displayName);
    } else {
      // Get username from session storage for guest users
      const storedUsername = sessionStorage.getItem('guestUsername');
      if (!storedUsername) {
        navigate('/');
        return;
      }
      setUsername(storedUsername);
    }
    
    // Get selected category from session storage
    const storedCategory = sessionStorage.getItem('selectedCategory');
    const storedCategoryName = sessionStorage.getItem('selectedCategoryName');
    
    if (!storedCategory) {
      // If no category, redirect back to categories
      navigate('/categories');
      return;
    }
    
    setSelectedCategory(storedCategory);
    setSelectedCategoryName(storedCategoryName);

    // Load facts for the selected category
    if (storedCategory) {
      loadFacts(storedCategory);
    }

    // Check if returning from answer page
    if (location.state?.returningFromAnswer) {
      setGameStarted(true);
      setCurrentFact(location.state.currentFact);
      setScore(location.state.score);
      setCurrentStreak(location.state.currentStreak);
      setLongestStreak(location.state.longestStreak);
      setStreakHistory(location.state.streakHistory);
    }
  }, [navigate, isAuthenticated, currentUser]); // Add auth dependencies

  const handleBackToCategories = () => {
    // Always go to categories page (handles both authenticated and guest users)
    navigate('/categories');
  };

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleAnswer = (isReal) => {
    // Use facts from backend, fallback to hardcoded facts if needed
    const currentFacts = facts.length > 0 ? facts : fallbackFacts;
    const currentFactData = currentFacts[currentFact];
    
    if (!currentFactData) {
      console.error('No fact data available');
      return;
    }
    
    const correct = isReal === currentFactData.isReal;
    const newScore = correct ? score + 1 : score;
    
    // Update streak tracking
    let newCurrentStreak = currentStreak;
    let newLongestStreak = longestStreak;
    const newStreakHistory = [...streakHistory];
    
    if (correct) {
      newCurrentStreak += 1;
      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }
    } else {
      newCurrentStreak = 0;
    }
    
    // Add to streak history
    newStreakHistory.push({
      factNumber: currentFact + 1,
      isCorrect: correct,
      streakAtPoint: newCurrentStreak
    });
    
    // Update Firebase streak data for authenticated users (non-blocking)
    if (isAuthenticated && currentUser && selectedCategory) {
      updateUserStreak(currentUser.uid, selectedCategory, correct)
        .then(() => {
          console.log('Streak updated for category:', selectedCategory, 'Correct:', correct);
        })
        .catch((error) => {
          console.error('Error updating streak:', error);
        });
    }
    
    if (correct) {
      setScore(newScore);
      setCurrentStreak(newCurrentStreak);
      setLongestStreak(newLongestStreak);
      setStreakHistory(newStreakHistory);
    }

    // Navigate to answer page immediately (don't wait for Firebase)
    navigate('/answer', {
      state: {
        isCorrect: correct,
        userAnswer: isReal,
        correctAnswer: currentFactData.isReal,
        explanation: currentFactData.explanation,
        factNumber: currentFact + 1,
        totalFacts: currentFacts.length,
        score: newScore,
        username: username,
        categoryName: selectedCategoryName,
        gameOver: !correct || currentFact >= currentFacts.length - 1,
        returningToGame: correct && currentFact < currentFacts.length - 1,
        nextFactIndex: currentFact + 1,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        streakHistory: newStreakHistory
      }
    });
  };

  if (!username || !selectedCategory || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>{loading ? 'Loading questions...' : 'Loading...'}</p>
          {error && (
            <p className="text-red-400 mt-2">Error: {error}</p>
          )}
        </div>
      </div>
    );
  }

  // Use facts from backend, fallback to hardcoded facts if needed
  const currentFacts = facts.length > 0 ? facts : fallbackFacts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToCategories}
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Categories</span>
              </button>
            </div>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">{selectedCategoryName}</h1>
              <div className="flex items-center justify-center space-x-4 text-white/70 text-sm">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{username}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="w-4 h-4" />
                  <span>Score: {score}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Brain className="w-4 h-4" />
                  <span>Fact {currentFact + 1}/{currentFacts.length}</span>
                </div>
                {gameStarted && currentStreak > 0 && (
                  <div className="flex items-center space-x-1 text-orange-400">
                    <Flame className="w-4 h-4" />
                    <span>Streak: {currentStreak}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-white/70">
              {isAuthenticated ? (
                <>
                  <User className="w-5 h-5" />
                  <span>Account</span>
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5" />
                  <span>Guest Mode</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!gameStarted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Play?</h2>
              <p className="text-xl text-white/80 mb-8">
                Welcome, <span className="text-yellow-300 font-semibold">{username}</span>! 
                You're about to test your knowledge in <span className="text-blue-300 font-semibold">{selectedCategoryName}</span>.
              </p>
              
              <div className="bg-white/5 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-bold text-white mb-4">How to Play:</h3>
                <ul className="text-white/80 space-y-2 text-left max-w-md mx-auto">
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>You'll see {currentFacts.length} facts one by one</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Decide if each fact is REAL or FAKE</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Get points for correct answers</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                    <span>Build streaks for consecutive correct answers</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    <span>Wrong answers end the game</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>See your final score and longest streak at the end</span>
                  </li>
                </ul>
              </div>
              
              <button
                onClick={handleStartGame}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
              >
                Start Game
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-white/20">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">Fact #{currentFact + 1}</h2>
                <div className="bg-white/5 rounded-xl p-6 mb-6">
                  <p className="text-lg text-white/90 leading-relaxed">
                    {currentFacts[currentFact]?.content || currentFacts[currentFact]?.fact || 'Loading fact...'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-8 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>REAL</span>
                </button>
                
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 px-8 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200"
                >
                  <XCircle className="w-5 h-5" />
                  <span>FAKE</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SoloGame; 
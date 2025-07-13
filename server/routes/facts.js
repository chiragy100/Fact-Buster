const express = require('express');
const { body, validationResult } = require('express-validator');
// Remove MongoDB Fact model
// const Fact = require('../models/Fact');
const { firebaseAuth } = require('../middleware/firebaseAuth');
// Remove OpenAI service for now
// const { generateFakeFact } = require('../services/openai');

const router = express.Router();

// Mock facts data for development
const mockFacts = [
  {
    id: '1',
    content: 'The Great Wall of China is visible from space with the naked eye.',
    category: 'geography',
    isReal: false,
    difficulty: 'medium',
    explanation: 'This is a common misconception. The Great Wall is not visible from space with the naked eye.'
  },
  {
    id: '2',
    content: 'A day on Venus is longer than a year on Venus.',
    category: 'space',
    isReal: true,
    difficulty: 'hard',
    explanation: 'Venus rotates very slowly, taking 243 Earth days to complete one rotation, while it orbits the Sun in 225 Earth days.'
  },
  {
    id: '3',
    content: 'Bananas are berries, but strawberries are not.',
    category: 'science',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Botanically, bananas are classified as berries, while strawberries are aggregate fruits.'
  },
  {
    id: '4',
    content: 'The first oranges weren\'t orange.',
    category: 'history',
    isReal: true,
    difficulty: 'easy',
    explanation: 'The original oranges from Southeast Asia were green, and the orange color was developed through selective breeding.'
  },
  {
    id: '5',
    content: 'Humans have five senses.',
    category: 'science',
    isReal: false,
    difficulty: 'easy',
    explanation: 'Humans actually have many more than five senses, including balance, temperature, pain, and more.'
  },
  // New Science and Technology questions
  {
    id: '6',
    content: 'The James Webb Space Telescope can see stars that formed less than 100 million years after the Big Bang.',
    category: 'science',
    isReal: true,
    difficulty: 'hard',
    explanation: 'The James Webb Space Telescope is designed to observe the earliest galaxies and stars in the universe.'
  },
  {
    id: '7',
    content: 'The chemical formula for table sugar is C₁₂H₂₂O₁₁, the same as TNT.',
    category: 'science',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Sugar and TNT are different compounds entirely. Sugar is C₁₂H₂₂O₁₁, while TNT is C₇H₅N₃O₆.'
  },
  {
    id: '8',
    content: 'In quantum mechanics, observing a particle can alter its behavior.',
    category: 'science',
    isReal: true,
    difficulty: 'hard',
    explanation: 'Known as the observer effect, this is a fundamental principle in quantum mechanics.'
  },
  {
    id: '9',
    content: 'Artificial intelligence has passed the Turing Test and is legally recognized as sentient in Switzerland.',
    category: 'science',
    isReal: false,
    difficulty: 'medium',
    explanation: 'While AI has made significant progress, no AI has definitively passed the Turing Test, and no country has legally recognized AI as sentient.'
  },
  {
    id: '10',
    content: 'Graphene is 200 times stronger than steel yet only one atom thick.',
    category: 'science',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Graphene is indeed incredibly strong and thin, making it one of the most remarkable materials discovered.'
  },
  {
    id: '11',
    content: 'All modern Wi-Fi signals are transmitted via low-powered microwave radiation.',
    category: 'science',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Wi-Fi uses radio waves in the microwave frequency range, typically 2.4 GHz or 5 GHz.'
  },
  {
    id: '12',
    content: 'Black holes destroy all information that crosses their event horizon.',
    category: 'science',
    isReal: false,
    difficulty: 'hard',
    explanation: 'This is debated; Hawking\'s paradox questions this assumption about information loss in black holes.'
  },
  {
    id: '13',
    content: '3D printing has been used to create functioning human organs for transplant.',
    category: 'science',
    isReal: false,
    difficulty: 'medium',
    explanation: 'While 3D printing has been used for organ prototypes and some tissue engineering, fully functional human organs for transplant are not yet available.'
  },
  {
    id: '14',
    content: 'Einstein won his Nobel Prize for his theory of relativity.',
    category: 'science',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Einstein won his Nobel Prize for the photoelectric effect, not relativity.'
  },
  {
    id: '15',
    content: 'The human genome contains over 100,000 protein-coding genes.',
    category: 'science',
    isReal: false,
    difficulty: 'medium',
    explanation: 'The human genome contains around 20,000–25,000 protein-coding genes, not 100,000.'
  },
  {
    id: '16',
    content: 'CRISPR is a technology that allows scientists to cut and edit DNA with high precision.',
    category: 'science',
    isReal: true,
    difficulty: 'medium',
    explanation: 'CRISPR-Cas9 is a revolutionary gene-editing technology that allows precise modification of DNA.'
  },
  {
    id: '17',
    content: 'The speed of light changes depending on the direction of travel.',
    category: 'science',
    isReal: false,
    difficulty: 'medium',
    explanation: 'In a vacuum, the speed of light is constant in all directions according to Einstein\'s theory of relativity.'
  },
  {
    id: '18',
    content: 'Solar panels can still generate electricity on cloudy days.',
    category: 'science',
    isReal: true,
    difficulty: 'easy',
    explanation: 'Solar panels can generate electricity even on cloudy days, though at reduced efficiency.'
  },
  {
    id: '19',
    content: 'Pluto is considered a double planet with its moon Charon because they orbit a point outside Pluto.',
    category: 'science',
    isReal: true,
    difficulty: 'hard',
    explanation: 'Pluto and Charon are considered a binary system because their barycenter (center of mass) lies outside Pluto\'s surface.'
  },
  {
    id: '20',
    content: 'Bluetooth technology was named after a 10th-century Scandinavian king.',
    category: 'science',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Bluetooth was named after King Harald "Bluetooth" Gormsson, who united Denmark and Norway.'
  },
  {
    id: '21',
    content: 'Dark matter makes up over 85% of the total mass in the universe, yet it has never been directly observed.',
    category: 'science',
    isReal: true,
    difficulty: 'hard',
    explanation: 'Dark matter is estimated to make up about 85% of the universe\'s mass, but has only been detected through its gravitational effects.'
  },
  {
    id: '22',
    content: 'Sound cannot travel in space because there are no molecules to transmit vibrations.',
    category: 'science',
    isReal: true,
    difficulty: 'easy',
    explanation: 'Sound requires a medium (like air, water, or solid material) to travel through, which space lacks.'
  },
  {
    id: '23',
    content: 'A quantum computer can break all existing encryption instantly.',
    category: 'science',
    isReal: false,
    difficulty: 'medium',
    explanation: 'While quantum computers have potential to break certain types of encryption, practical quantum decryption isn\'t there yet.'
  },
  {
    id: '24',
    content: 'The first computer mouse was made of wood.',
    category: 'science',
    isReal: true,
    difficulty: 'medium',
    explanation: 'The first computer mouse, invented by Douglas Engelbart in 1964, was indeed made of wood.'
  },
  {
    id: '25',
    content: 'NASA\'s Voyager 1 probe is the only man-made object to have ever left our solar system.',
    category: 'science',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Both Voyager 1 and Voyager 2 have exited the solar system and entered interstellar space.'
  },
  {
    id: '26',
    content: 'The term "bug" in programming originated from a literal insect found in an early computer.',
    category: 'science',
    isReal: true,
    difficulty: 'medium',
    explanation: 'The term "bug" originated in 1947 when a moth was found in the Harvard Mark II computer, causing a malfunction.'
  },
  {
    id: '27',
    content: 'Modern smartphones have more processing power than NASA\'s computers during the Apollo missions.',
    category: 'science',
    isReal: true,
    difficulty: 'easy',
    explanation: 'Modern smartphones have significantly more processing power than the computers used during the Apollo missions.'
  },
  {
    id: '28',
    content: 'Atoms are mostly empty space, meaning all solid matter is technically 99% void.',
    category: 'science',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Atoms are indeed mostly empty space, with the nucleus taking up only a tiny fraction of the atom\'s volume.'
  },
  {
    id: '29',
    content: 'The Large Hadron Collider has created miniature black holes.',
    category: 'science',
    isReal: false,
    difficulty: 'hard',
    explanation: 'While theoretically possible, no miniature black holes have been observed at the Large Hadron Collider.'
  },
  {
    id: '30',
    content: 'A kilogram is now defined by a physical platinum-iridium cylinder stored in France.',
    category: 'science',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Since 2019, the kilogram has been defined by Planck\'s constant, not by the physical prototype.'
  },
  // General Knowledge questions
  {
    id: '31',
    content: 'Bananas are technically herbs, and the "tree" they grow on is classified as the world\'s largest flowering herbaceous plant.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - Bananas are indeed herbs, and the banana plant is the world\'s largest herbaceous flowering plant, not a tree.'
  },
  {
    id: '32',
    content: 'The first ever recorded computer virus was designed to promote an antivirus software by the same company.',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake – It was a prank, not marketing.'
  },
  {
    id: '33',
    content: 'The Eiffel Tower grows by up to 6 inches during summer due to thermal expansion of the metal.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - The Eiffel Tower does expand in the heat due to thermal expansion of the iron.'
  },
  {
    id: '34',
    content: 'In ancient Rome, urine was taxed because it was used in textile processing and tooth cleaning.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - Roman urine was indeed taxed as it was used in various industrial processes.'
  },
  {
    id: '35',
    content: 'The Great Wall of China was built in a continuous, uninterrupted effort over 2,000 years.',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake – Built in fragments by different dynasties.'
  },
  {
    id: '36',
    content: 'Sharks can live up to 500 years, making them the longest-living vertebrates.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real – Greenland sharks can live up to 500 years.'
  },
  {
    id: '37',
    content: 'Albert Einstein declined the offer to become President of Germany after World War II.',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake – He was offered Israel\'s presidency.'
  },
  {
    id: '38',
    content: 'Most of the oxygen on Earth comes from the Amazon rainforest.',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake – Most comes from oceanic plankton.'
  },
  {
    id: '39',
    content: 'During WWII, British spies used Monopoly games to smuggle maps and compasses to prisoners of war.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - British intelligence did use Monopoly games to smuggle escape tools to POWs.'
  },
  {
    id: '40',
    content: 'A bolt of lightning has enough energy to boil 1 million cups of tea.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real – It carries up to 1 billion joules.'
  },
  {
    id: '41',
    content: 'There\'s a species of jellyfish known to biologically revert to a younger state, effectively making it immortal.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - The Turritopsis dohrnii jellyfish can revert to its polyp stage.'
  },
  {
    id: '42',
    content: 'In Switzerland, it\'s illegal to own just one guinea pig because they get lonely.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - Swiss animal welfare laws require guinea pigs to be kept in pairs.'
  },
  {
    id: '43',
    content: 'The longest time a person has stayed awake voluntarily is 43 days.',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake – The record is 11 days.'
  },
  {
    id: '44',
    content: 'The current U.S. flag was designed by a 17-year-old for a school project and earned a B-.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - Robert Heft designed the 50-star flag as a school project.'
  },
  {
    id: '45',
    content: 'Earth is closer to the sun in July than in January.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real – But seasons are caused by axial tilt.'
  },
  {
    id: '46',
    content: 'You can balance a raw egg perfectly upright only on the spring equinox.',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake - This is a common myth with no scientific basis.'
  },
  {
    id: '47',
    content: 'It rains diamonds on Neptune and Uranus due to atmospheric pressure.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - The extreme pressure can convert carbon into diamonds.'
  },
  {
    id: '48',
    content: 'The microwave was invented after a scientist walked past a radar and a chocolate bar melted in his pocket.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - Percy Spencer discovered microwave cooking when a chocolate bar melted in his pocket.'
  },
  {
    id: '49',
    content: 'Humans can distinguish over 500 different musical notes by frequency.',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake – We can distinguish over 1,400 distinct pitches.'
  },
  {
    id: '50',
    content: 'The first oranges were actually green, not orange.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - Original oranges were green, the orange color came from selective breeding.'
  },
  {
    id: '51',
    content: 'Venus is the hottest planet in the solar system, even though Mercury is closer to the Sun.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - Venus\'s thick atmosphere creates a greenhouse effect making it hotter than Mercury.'
  },
  {
    id: '52',
    content: 'Typing "Google" into Google crashes the internet.',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake - This is a common internet myth.'
  },
  {
    id: '53',
    content: 'Octopuses can taste things through their arms.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - Octopuses have taste receptors on their suckers.'
  },
  {
    id: '54',
    content: 'Thomas Edison invented the motion picture camera, the electric light bulb, and the telephone.',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake – He didn\'t invent the telephone (Bell did).'
  },
  {
    id: '55',
    content: 'The average person walks the equivalent of three times around the Earth in their lifetime.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - The average person walks about 75,000 miles in their lifetime.'
  },
  {
    id: '56',
    content: 'If the sun were the size of a white blood cell, the Milky Way would be the size of the Earth.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - This scale comparison is accurate.'
  },
  {
    id: '57',
    content: 'You\'re never more than 10 feet away from a spider.',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake – There\'s no scientific basis for this claim.'
  },
  {
    id: '58',
    content: 'Peanuts are not nuts; they\'re legumes.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - Peanuts are legumes, not true nuts.'
  },
  {
    id: '59',
    content: 'Butterflies can see ultraviolet light, which humans cannot.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - Butterflies can see UV light, which helps them find flowers and mates.'
  },
  {
    id: '60',
    content: 'The Atlantic and Pacific Oceans don\'t mix due to salinity and temperature barriers.',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake – They do mix, though slowly.'
  },
  {
    id: '61',
    content: 'Birds are the only animals with hollow bones.',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake – Some dinosaurs and bats also have hollow bones.'
  },
  {
    id: '62',
    content: 'Cleopatra lived closer to the invention of the iPhone than to the construction of the pyramids.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - Cleopatra lived around 30 BC, while the pyramids were built around 2500 BC.'
  },
  {
    id: '63',
    content: 'A blue whale\'s heart is the size of a school bus and its heartbeat can be detected from 2 miles away.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - A blue whale\'s heart can weigh up to 400 pounds.'
  },
  {
    id: '64',
    content: 'You cannot hum while holding your nose shut.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - Try it! You can\'t hum with your nose pinched.'
  },
  {
    id: '65',
    content: 'Cows have best friends and get stressed when separated.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - Cows form strong social bonds and can recognize individual herd members.'
  },
  {
    id: '66',
    content: 'The first email ever sent said "Hello, this is a test."',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake – It was gibberish due to a test bug.'
  },
  {
    id: '67',
    content: 'Mona Lisa has no eyebrows because it was fashionable in her time to shave them off.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - In Renaissance Florence, it was fashionable for women to shave their eyebrows.'
  },
  {
    id: '68',
    content: 'The human brain has more synapses than stars in the galaxy.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - The brain has about 100 trillion synapses, while the Milky Way has about 100 billion stars.'
  },
  {
    id: '69',
    content: 'A cockroach can live without its head for up to a week.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - Cockroaches can survive without their heads due to their decentralized nervous system.'
  },
  {
    id: '70',
    content: 'Pineapples take 10 years to grow a single fruit.',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake – About 18–24 months is typical.'
  },
  {
    id: '71',
    content: 'The color orange is named after the fruit.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - The color was named after the fruit, not the other way around.'
  },
  {
    id: '72',
    content: 'There\'s more bacteria in your mouth than people on Earth.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - The human mouth contains billions of bacteria.'
  },
  {
    id: '73',
    content: 'Bamboo can grow almost 1 meter in a single day.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - Some bamboo species can grow up to 91 cm (3 feet) in a single day.'
  },
  {
    id: '74',
    content: 'Walt Disney was cryogenically frozen.',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake – That\'s an urban legend.'
  },
  {
    id: '75',
    content: 'Humans are the only animals that cry emotional tears.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - Humans are unique in shedding tears in response to emotions.'
  },
  {
    id: '76',
    content: 'All snowflakes have exactly six sides and are identical.',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake – Six sides is true, but no two are identical.'
  },
  {
    id: '77',
    content: 'Snakes dislocate their jaws to swallow prey.',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake – Their jaws stretch thanks to elastic ligaments.'
  },
  {
    id: '78',
    content: 'You can hear the northern lights in remote places.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real – Rare, but sometimes people report faint sounds.'
  },
  {
    id: '79',
    content: 'The world\'s deepest postbox is in Japan, located 10 meters underwater.',
    category: 'general',
    isReal: true,
    difficulty: 'medium',
    explanation: 'Real - There is indeed an underwater postbox in Japan.'
  },
  {
    id: '80',
    content: 'The Library of Congress archives every tweet ever posted.',
    category: 'general',
    isReal: false,
    difficulty: 'medium',
    explanation: 'Fake – It stopped full archiving in 2018.'
  }
];

// @route   GET /api/facts/random
// @desc    Get a random fact
// @access  Public
router.get('/random', async (req, res) => {
  try {
    const { category, difficulty, excludeIds } = req.query;
    
    let filteredFacts = mockFacts;
    
    if (category) {
      filteredFacts = filteredFacts.filter(fact => fact.category === category);
    }
    
    if (difficulty) {
      filteredFacts = filteredFacts.filter(fact => fact.difficulty === difficulty);
    }
    
    if (excludeIds) {
      const excludeArray = excludeIds.split(',');
      filteredFacts = filteredFacts.filter(fact => !excludeArray.includes(fact.id));
    }
    
    if (filteredFacts.length === 0) {
      return res.status(404).json({ message: 'No facts found with the specified criteria' });
    }
    
    const randomFact = filteredFacts[Math.floor(Math.random() * filteredFacts.length)];
    res.json(randomFact);
  } catch (error) {
    console.error('Get random fact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facts/game
// @desc    Get facts for a game round
// @access  Public
router.get('/game', async (req, res) => {
  try {
    const { count = 10, categories, difficulty } = req.query;
    
    let filteredFacts = mockFacts;
    
    if (categories) {
      const categoryArray = categories.split(',');
      filteredFacts = filteredFacts.filter(fact => categoryArray.includes(fact.category));
    }
    
    if (difficulty) {
      filteredFacts = filteredFacts.filter(fact => fact.difficulty === difficulty);
    }
    
    // Shuffle and limit to requested count
    const shuffled = filteredFacts.sort(() => 0.5 - Math.random());
    const selectedFacts = shuffled.slice(0, Math.min(parseInt(count), filteredFacts.length));
    
    res.json(selectedFacts);
  } catch (error) {
    console.error('Get game facts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facts/categories
// @desc    Get available categories with fact counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = ['general', 'science', 'history', 'geography', 'entertainment', 'sports', 'technology', 'nature'];
    const categoryStats = categories.map(category => {
      const categoryFacts = mockFacts.filter(fact => fact.category === category);
      const realCount = categoryFacts.filter(fact => fact.isReal).length;
      const fakeCount = categoryFacts.filter(fact => !fact.isReal).length;
      
      return {
        name: category,
        displayName: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
        realCount,
        fakeCount,
        totalCount: realCount + fakeCount
      };
    });
    
    res.json(categoryStats);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/facts/stats
// @desc    Get fact statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalFacts = mockFacts.length;
    const realFacts = mockFacts.filter(fact => fact.isReal).length;
    const fakeFacts = mockFacts.filter(fact => !fact.isReal).length;
    
    res.json({
      totalFacts,
      realFacts,
      fakeFacts,
      realPercentage: Math.round((realFacts / totalFacts) * 100),
      fakePercentage: Math.round((fakeFacts / totalFacts) * 100)
    });
  } catch (error) {
    console.error('Get fact stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mock other routes that might be called
router.post('/generate', firebaseAuth, (req, res) => {
  res.status(501).json({ message: 'Fact generation not available in development mode' });
});

router.post('/', firebaseAuth, (req, res) => {
  res.status(501).json({ message: 'Fact creation not available in development mode' });
});

router.put('/:id/usage', (req, res) => {
  res.json({ message: 'Usage updated successfully' });
});

module.exports = router; 
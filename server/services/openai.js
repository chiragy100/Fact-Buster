const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

const categoryPrompts = {
  geography: {
    easy: "Create a believable but completely false fact about geography, countries, cities, or landmarks. Make it sound like something someone might believe is true.",
    medium: "Generate a plausible but fake geographical fact about world geography, climate, or natural features. It should be convincing enough to fool most people.",
    hard: "Create a sophisticated fake fact about geography that sounds authoritative and scientific but is completely false. Use technical terms and specific details."
  },
  sports: {
    easy: "Create a believable but false fact about sports, athletes, or sporting events. Make it sound like something a casual sports fan might believe.",
    medium: "Generate a plausible but fake sports fact about records, statistics, or historical events in sports. It should be convincing to sports enthusiasts.",
    hard: "Create a sophisticated fake sports fact with specific statistics, dates, and technical details that sounds authoritative but is completely false."
  },
  space: {
    easy: "Create a believable but false fact about space, planets, stars, or space exploration. Make it sound like something from popular science.",
    medium: "Generate a plausible but fake space fact about astronomy, space missions, or celestial bodies. It should sound scientifically credible.",
    hard: "Create a sophisticated fake space fact with technical astronomical details, specific measurements, and scientific terminology that sounds authoritative but is false."
  },
  history: {
    easy: "Create a believable but false historical fact about events, people, or places. Make it sound like something from a history book.",
    medium: "Generate a plausible but fake historical fact about significant events, figures, or periods. It should sound like credible historical information.",
    hard: "Create a sophisticated fake historical fact with specific dates, names, and details that sounds like it comes from authoritative historical research but is completely false."
  },
  science: {
    easy: "Create a believable but false scientific fact about biology, chemistry, physics, or other sciences. Make it sound like something from popular science.",
    medium: "Generate a plausible but fake scientific fact with technical details that sounds credible to someone with basic scientific knowledge.",
    hard: "Create a sophisticated fake scientific fact with complex terminology, specific data, and technical details that sounds like it comes from peer-reviewed research but is completely false."
  },
  'pop-culture': {
    easy: "Create a believable but false fact about movies, music, celebrities, or popular culture. Make it sound like something from entertainment news.",
    medium: "Generate a plausible but fake pop culture fact about films, music, TV shows, or celebrities that sounds like credible entertainment trivia.",
    hard: "Create a sophisticated fake pop culture fact with specific details, dates, and insider information that sounds authoritative but is completely false."
  }
};

const generateFakeFact = async (category, difficulty = 'medium') => {
  try {
    if (!categoryPrompts[category]) {
      throw new Error(`Invalid category: ${category}`);
    }

    // If OpenAI is not configured, use fallback facts
    if (!openai) {
      const fallbackFacts = {
        geography: [
          "The Great Wall of China is visible from space with the naked eye.",
          "Mount Everest grows exactly 2.5 inches every year due to tectonic activity.",
          "The Sahara Desert was once a lush rainforest 10,000 years ago."
        ],
        sports: [
          "Michael Jordan was cut from his high school basketball team twice.",
          "The first Olympic Games included events like chariot racing and javelin throwing.",
          "Soccer was originally played with a human skull in ancient civilizations."
        ],
        space: [
          "The sun is actually white, not yellow, when viewed from space.",
          "There are exactly 88 constellations officially recognized by astronomers.",
          "The moon is slowly moving away from Earth at 3.8 centimeters per year."
        ],
        history: [
          "Napoleon Bonaparte was actually 5'7\" tall, not short as commonly believed.",
          "The Declaration of Independence was signed on July 4th, 1776.",
          "Cleopatra lived closer to the invention of the iPhone than the building of the Great Pyramid."
        ],
        science: [
          "The human body contains enough iron to make a 3-inch nail.",
          "Bananas are berries, but strawberries are not.",
          "The average person spends 6 months of their life waiting for red lights."
        ],
        'pop-culture': [
          "The first color film was made in 1902, not the 1930s.",
          "Mickey Mouse's original name was Mortimer.",
          "The first Star Wars film was originally titled 'The Adventures of Luke Starkiller'."
        ]
      };

      const categoryFacts = fallbackFacts[category] || fallbackFacts['pop-culture'];
      const randomIndex = Math.floor(Math.random() * categoryFacts.length);
      return categoryFacts[randomIndex];
    }

    const prompt = categoryPrompts[category][difficulty] || categoryPrompts[category]['medium'];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a fact generator for a trivia game. Your job is to create believable but completely false facts. The facts should be concise (1-2 sentences), interesting, and sound credible. Do not include any disclaimers or explanations - just the fact itself."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.8,
      top_p: 0.9
    });

    const generatedFact = completion.choices[0]?.message?.content?.trim();
    
    if (!generatedFact) {
      throw new Error('No fact generated');
    }

    // Clean up the response (remove quotes, extra formatting)
    return generatedFact.replace(/^["']|["']$/g, '').trim();

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback facts if API fails
    const fallbackFacts = {
      geography: [
        "The Great Wall of China is visible from space with the naked eye.",
        "Mount Everest grows exactly 2.5 inches every year due to tectonic activity.",
        "The Sahara Desert was once a lush rainforest 10,000 years ago."
      ],
      sports: [
        "Michael Jordan was cut from his high school basketball team twice.",
        "The first Olympic Games included events like chariot racing and javelin throwing.",
        "Soccer was originally played with a human skull in ancient civilizations."
      ],
      space: [
        "The sun is actually white, not yellow, when viewed from space.",
        "There are exactly 88 constellations officially recognized by astronomers.",
        "The moon is slowly moving away from Earth at 3.8 centimeters per year."
      ],
      history: [
        "Napoleon Bonaparte was actually 5'7\" tall, not short as commonly believed.",
        "The Declaration of Independence was signed on July 4th, 1776.",
        "Cleopatra lived closer to the invention of the iPhone than the building of the Great Pyramid."
      ],
      science: [
        "The human body contains enough iron to make a 3-inch nail.",
        "Bananas are berries, but strawberries are not.",
        "The average person spends 6 months of their life waiting for red lights."
      ],
      'pop-culture': [
        "The first color film was made in 1902, not the 1930s.",
        "Mickey Mouse's original name was Mortimer.",
        "The first Star Wars film was originally titled 'The Adventures of Luke Starkiller'."
      ]
    };

    const categoryFacts = fallbackFacts[category] || fallbackFacts['pop-culture'];
    const randomIndex = Math.floor(Math.random() * categoryFacts.length);
    
    return categoryFacts[randomIndex];
  }
};

const generateMultipleFakeFacts = async (category, difficulty, count = 5) => {
  const facts = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const fact = await generateFakeFact(category, difficulty);
      facts.push(fact);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Failed to generate fact ${i + 1}:`, error);
    }
  }
  
  return facts;
};

module.exports = {
  generateFakeFact,
  generateMultipleFakeFacts
}; 
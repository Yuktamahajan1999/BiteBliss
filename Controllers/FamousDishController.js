import axios from 'axios';
import Dish from '../Models/TasteBot-Feature/FamousIndianDish.js';
import { famousDishes } from '../data.js';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

function extractJSON(str) {
  const first = str.indexOf('{');
  const last = str.lastIndexOf('}');
  if (first === -1 || last === -1) return null;
  try {
    return JSON.parse(str.substring(first, last + 1));
  } catch (e) {
    return null;
  }
}

function stateMatches(state, query) {
  const abbr = state
    .split(' ')
    .map(word => word[0])
    .join('')
    .toLowerCase();
  return (
    state.toLowerCase().includes(query.toLowerCase()) ||
    abbr === query.toLowerCase()
  );
}

export const searchDishes = async (req, res) => {
  const { query } = req.query;
  const sanitizedQuery = query?.trim().substring(0, 50);

  if (!sanitizedQuery || sanitizedQuery.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a search term (at least 2 characters)'
    });
  }

  try {
    const dbResults = await Dish.find({
      $or: [
        { dish: { $regex: sanitizedQuery, $options: 'i' } },
        { state: { $regex: sanitizedQuery, $options: 'i' } },
        { description: { $regex: sanitizedQuery, $options: 'i' } },
        { ingredients: { $elemMatch: { $regex: sanitizedQuery, $options: 'i' } } }
      ]
    }).limit(10);

    const staticResults = famousDishes.filter(dish =>
      dish.dish.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
      stateMatches(dish.state, sanitizedQuery)
    );

    const allResults = [
      ...dbResults,
      ...staticResults.filter(
        s => !dbResults.some(d => (d.dish || "").toLowerCase() === (s.dish || "").toLowerCase())
      )
    ];

    if (allResults.length > 0) {
      return res.json({
        success: true,
        source: dbResults.length && staticResults.length ? 'database+static'
          : dbResults.length ? 'database'
          : 'static',
        data: allResults
      });
    }
    if (GROQ_API_KEY) {
      try {
        const prompt = `Suggest 1 famous Indian dish from "${sanitizedQuery}" region. Respond only with a valid JSON object using this format:
{
  "dish": "Dish Name",
  "state": "State/Region",
  "emoji": "🍛",
  "description": "Short description.",
  "ingredients": ["..."], 
  "instructions": ["..."],
  "image": "<public food image url from unsplash.com or pexels.com that CLEARLY SHOWS THE DISH, not a building or scenery. If unsure, leave blank.>"
}`;
        const aiRes = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama3-70b-8192',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 600
          },
          {
            headers: {
              'Authorization': `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
        const aiContent = aiRes.data.choices[0].message.content;
        const aiDish = extractJSON(aiContent);

        if (aiDish && aiDish.dish && aiDish.state) {
          aiDish.emoji = aiDish.emoji || "🍛";
          aiDish.description = aiDish.description || "No description available";
          aiDish.ingredients = Array.isArray(aiDish.ingredients) ? aiDish.ingredients : [];
          aiDish.instructions = Array.isArray(aiDish.instructions) ? aiDish.instructions : [];
          aiDish.source = 'ai';
          if (!aiDish.image || aiDish.image.trim() === "") aiDish.image = "";

          return res.json({
            success: true,
            source: 'ai',
            data: [aiDish]
          });
        }
      } catch (e) {
        return res.status(500).json({
          success: false,
          message: 'AI API error',
          error: e.message
        });
      }
    }

    return res.json({
      success: false,
      message: 'No results found',
      data: []
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Search service unavailable',
      error: error.message,
      data: []
    });
  }
};


export const createDish = async (req, res) => {
  try {
    const dish = new Dish(req.body);
    const saved = await dish.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: 'Failed to save dish', detail: error.message });
  }
};

export const getDishById = async (req, res) => {
  try {
    const dish = await Dish.findById(req.query.id);
    if (dish) {
      res.json(dish);
    } else {
      res.status(404).json({ error: 'Dish not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dish', detail: error.message });
  }
};

import axios from 'axios';
import SuggestMood from '../Models/TasteBot-Feature/SuggestMood.js';
import { recipes } from '../data.js';

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

export const searchMoods = async (req, res) => {
    const { mood } = req.query;
    const sanitizedMood = mood?.trim().substring(0, 50);

    if (!sanitizedMood || sanitizedMood.length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a mood (at least 2 characters)'
        });
    }

    try {
        const dbResults = await SuggestMood.find({
            mood: { $regex: sanitizedMood, $options: 'i' }
        }).limit(5);

        if (dbResults.length > 0) {
            return res.json({
                success: true,
                source: 'database',
                data: dbResults
            });
        }

        if (GROQ_API_KEY) {
            try {
               const prompt = `Suggest 1 Indian food mood and 5-8 Indian dishes for the mood "${sanitizedMood}". Only include Indian foods. Respond in this JSON format ...
                {
                    "mood": "Mood name",
                        "emoji": "Emoji",
                            "description": "Short mood description.",
                                "color": "#color",
                                    "foods": [
                                        {
                                            "name": "Food name",
                                            "type": "Meal type",
                                            "time": "Approximate time",
                                            "description": "Short description",
                                            "ingredients": ["..."],
                                            "instructions": ["..."]
                                        }
                                    ]
                } `;
        const aiRes = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama3-70b-8192',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 1000
          },
          {
            headers: {
              'Authorization': `Bearer ${ GROQ_API_KEY } `,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
        const aiContent = aiRes.data.choices[0].message.content;
        const aiMood = extractJSON(aiContent);

        if (aiMood && aiMood.mood && Array.isArray(aiMood.foods) && aiMood.foods.length > 0) {
          aiMood.emoji = aiMood.emoji || "😋";
          aiMood.description = aiMood.description || "No description available";
          aiMood.color = aiMood.color || "#FFC300";
          aiMood.foods = aiMood.foods.map(food => ({
            ...food,
            ingredients: Array.isArray(food.ingredients) ? food.ingredients : [],
            instructions: Array.isArray(food.instructions) ? food.instructions : [],
          }));

          try {
            const newMood = await SuggestMood.create(aiMood);
            return res.json({
              success: true,
              source: 'openai',
              data: [newMood]
            });
          } catch (error) {
            return res.status(500).json({
              success: false,
              message: 'Failed to save mood',
              error: error.message
            });
          }
        }
      } catch (e) {
        return res.status(500).json({
          success: false,
          message: 'AI API error',
          error: e.message
        });
      }
    }

    const staticResults = recipes.filter(r =>
      r.mood.toLowerCase().includes(sanitizedMood.toLowerCase())
    );

    return res.json({
      success: true,
      source: 'static',
      data: staticResults.slice(0, 3)
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

export const createMood = async (req, res) => {
  try {
    const mood = new SuggestMood(req.body);
    const saved = await mood.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: 'Failed to save mood', detail: error.message });
  }
};

export const getMoodById = async (req, res) => {
  try {
    const mood = await SuggestMood.findById(req.query.id);
    if (mood) {
      res.json(mood);
    } else {
      res.status(404).json({ error: 'Mood not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mood', detail: error.message });
  }
};

export const getAllMoods = async (req, res) => {
  try {
    const dbMoods = await SuggestMood.find();
    const staticUnique = recipes.filter(staticMood =>
      !dbMoods.some(dbMood => dbMood.mood.toLowerCase() === staticMood.mood.toLowerCase())
    );
    res.json({
      success: true,
      source: 'all',
      data: [...dbMoods, ...staticUnique]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch moods',
      error: error.message,
      data: []
    });
  }
};
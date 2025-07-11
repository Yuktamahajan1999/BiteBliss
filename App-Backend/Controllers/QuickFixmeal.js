import axios from "axios";
import QuickFixMeals from "../Models/TasteBot-Feature/QuickFixMeal.js";
import { quickFixMeals } from "../data.js";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

function extractJSON(str) {
    const firstCurly = str.indexOf('{');
    const lastCurly = str.lastIndexOf('}');
    if (firstCurly === -1 || lastCurly === -1) return null;
    const jsonString = str.substring(firstCurly, lastCurly + 1);
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return null;
    }
}

// Search Meals 
export const searchQuickFixMeals = async (req, res) => {
    const { query } = req.query;
    if (!query || query.trim().length < 2) {
        return res.status(400).json({ success: false, message: "Enter at least 2 characters" });
    }
    const search = query.trim();

    try {
        const found = await QuickFixMeals.find({
            $or: [
                { name: { $regex: search, $options: "i" } },
                { type: { $regex: search, $options: "i" } },
                { mood: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { ingredients: { $elemMatch: { $regex: search, $options: "i" } } }
            ]
        }).limit(10);

        if (found.length) {
            return res.json({ success: true, source: "database", data: found });
        }

        const inStatic = quickFixMeals.filter(
            m =>
                ((m.name || m.title || "") + "").toLowerCase().includes(search.toLowerCase()) ||
                (m.type || "").toLowerCase().includes(search.toLowerCase()) ||
                (m.mood || "").toLowerCase().includes(search.toLowerCase()) ||
                (m.description || "").toLowerCase().includes(search.toLowerCase()) ||
                (Array.isArray(m.ingredients) ? m.ingredients : []).some(ing => (ing || "").toLowerCase().includes(search.toLowerCase()))
        );

        if (inStatic.length) {
            return res.json({ success: true, source: "static", data: inStatic.slice(0, 10) });
        }

        if (GROQ_API_KEY) {
            try {
                const prompt = `Suggest 1 quick fix meal for "${search}". Respond only with a single valid JSON object in this format: { "name": "...", "type": "...", "description": "...", "ingredients": ["..."], "instructions": ["..."], "time": "...", "mood": "...", "image": "<public food image url, do not use example.com>" }`;
                const aiRes = await axios.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    {
                        model: "llama3-70b-8192",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.7,
                        max_tokens: 500,
                    },
                    {
                        headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
                    }
                );
                const aiContent = aiRes.data.choices[0].message.content;
                const generated = extractJSON(aiContent);
                if (!generated) {
                    return res.json({ success: false, source: "ai", message: "AI response invalid JSON", data: [] });
                }
                const saved = await QuickFixMeals.create(generated);
                return res.json({ success: true, source: "ai", data: [saved] });
            } catch (e) {
                return res.json({ success: false, source: "ai", message: "AI API error", data: [] });
            }
        }

        return res.json({ success: false, message: "No meal found", data: [] });
    } catch (e) {
        return res.status(500).json({ success: false, message: "Server error", data: [] });
    }
};

// Create new meal
export const createQuickFixMeal = async (req, res) => {
    try {
        const saved = await QuickFixMeals.create(req.body);
        res.status(201).json(saved);
    } catch (e) {
        res.status(400).json({ error: "Failed to save meal" });
    }
};

// Get meal by ID
export const getQuickFixMealById = async (req, res) => {
    try {
        const meal = await QuickFixMeals.findById(req.query.id);
        if (meal) {
            return res.json(meal);
        }
        res.status(404).json({ error: "Meal not found" });
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch meal" });
    }
};
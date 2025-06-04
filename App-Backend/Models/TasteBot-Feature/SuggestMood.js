import mongoose from "mongoose";

let SuggestMoodSchema = new mongoose.Schema({
    mood: {
        type: String,
        required: true,
    },
    emoji: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    foods: [{
        name: { 
            type: String, 
            required: true 
        },
        type: { 
            type: String, 
            required: true 
        },
        time: { 
            type: String, 
            required: true 
        },
        description: { 
            type: String 
        },
        ingredients: { 
            type: [String], 
            required: true 
        },
        instructions: { 
            type: [String], 
            required: true 
        }
    }],
}, { timestamps: true });

let SuggestMood = mongoose.model("SuggestMood", SuggestMoodSchema);
export default SuggestMood;
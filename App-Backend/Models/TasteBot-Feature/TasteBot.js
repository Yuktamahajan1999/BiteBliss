import mongoose from "mongoose";

let TasteBotSchema = new mongoose.Schema({
    title: {
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
    path: {
        type: String,
        required: true,
    },
}, { timestamps: true });

let TasteBot = mongoose.model("TasteBot", TasteBotSchema);
export default TasteBot;
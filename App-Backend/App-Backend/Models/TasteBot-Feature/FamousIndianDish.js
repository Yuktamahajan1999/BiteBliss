import mongoose from "mongoose";

let FamousDishSchema = new mongoose.Schema({
    dish:{
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    emoji:{
        type: String,
    },
    description:{
        type: String,
        required: true,
    },
    ingredients:{
        type: [String],
        required: true,
    },
    instructions:{
        type: [String],
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
    video:{
        type: String,
    },

}, { timestamps: true });
let FamousDish = mongoose.model("FamousDish", FamousDishSchema);
export default FamousDish;




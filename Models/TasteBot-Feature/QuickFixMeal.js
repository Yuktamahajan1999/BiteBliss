import mongoose from "mongoose";

let QuickFixMealsSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
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
    time:{
        type: String,
        required: true,
    },
    mood:{
        type: String,
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

let QuickFixMeals = mongoose.model("QuickFixMeals", QuickFixMealsSchema);
export default QuickFixMeals;
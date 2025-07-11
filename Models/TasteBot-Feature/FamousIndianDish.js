import mongoose from 'mongoose';

const dishSchema = new mongoose.Schema({
    state: {
        type: String,
        required: true
    },
    dish: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    emoji: {
        type: String,
        required: true
    },
    ingredients: {
        type: [String],
        required: true
    },
    instructions: {
        type: [String],
        required: true
    },
    image: {
        type: String
    },
    video: {
        type: String
    },
    source: {
        type: String,
        enum: ['static', 'ai'],
        default: 'static'
    }
}, { timestamps: true });

const Dish = mongoose.model('Dish', dishSchema);

export default Dish;

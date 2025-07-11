import mongoose from "mongoose";

let rewardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    tag: {
        type: String
    },
    icon: {
        type: String
    },
    extra: {
        type: String
    }
}, { timestamps: true });

let Reward = mongoose.model("Reward", rewardSchema);

export default Reward;
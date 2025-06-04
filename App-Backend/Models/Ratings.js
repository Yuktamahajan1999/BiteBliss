import mongoose from "mongoose";

let RatingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    targetType: {
        type: String,
        enum: ['Restaurant', 'Dish', 'DeliveryPartner'],
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    feedback: {
        type: String
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    date: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

let Rating = mongoose.model("Rating", RatingSchema);
export default Rating;  
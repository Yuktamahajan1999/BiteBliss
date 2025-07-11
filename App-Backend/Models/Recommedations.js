import mongoose from "mongoose";

let RecommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  liked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

RecommendationSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });

let Recommendation = mongoose.model("Recommendation", RecommendationSchema);
export default Recommendation;

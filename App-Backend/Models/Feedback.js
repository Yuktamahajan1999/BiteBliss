import mongoose from "mongoose";

let FeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  rating: {
    usability: { type: Number, min: 1, max: 5 },
    performance: { type: Number, min: 1, max: 5 },
    customerService: { type: Number, min: 1, max: 5 },
  },
  feedbackText: {
    type: String,
    required: true,
  },
  feedbackType: {
    type: String,
    enum: ['complaint', 'suggestion', 'praise'],
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  helpRequested: {
    type: Boolean,
    default: false,
  },
  videoUrl: {
    type: String,
    default: null,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'closed'],
    default: 'pending',
  },
  response: {
    type: String,
    default: null,
  },
}, { timestamps: true });

let Feedback = mongoose.model('Feedback', FeedbackSchema);

export default Feedback;

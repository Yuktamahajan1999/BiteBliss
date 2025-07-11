import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  feedbackText: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: false,
    trim: true,
  },
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,  
  }
}, { timestamps: true });


const FeedbackPage = mongoose.model('Feedbackpage', feedbackSchema);

export default FeedbackPage;

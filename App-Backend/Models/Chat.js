import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000,
    minlength: 1
  },
  read: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true
});

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

export default ChatMessage;
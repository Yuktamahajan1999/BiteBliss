import mongoose from "mongoose";

let ChatMessageSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  from: { 
    type: String, 
    enum: ['user', 'bot'], 
    required: true 
  },
  text: { 
    type: String, 
    required: true, 
    maxlength: 1000, 
    minlength: 1 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

let ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

export default ChatMessage;

import mongoose from 'mongoose';

const GroupOrderSchema = new mongoose.Schema({
  orderRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  joinCode: {
    type: String,
    required: true,
    unique: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    items: [{
      name: String,
      price: Number,
      quantity: Number
    }]
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 20 * 60 * 1000)
  }
}, { timestamps: true });

const GroupOrder = mongoose.model('GroupOrder', GroupOrderSchema);
export default GroupOrder;
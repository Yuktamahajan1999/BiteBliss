import mongoose from 'mongoose';

let OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantName: {
    type: String,
    required: true
  },
  restaurantLocation: {
    type: String
  },
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem' 
      },
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'UPI', 'Card'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Preparing', 'Out for delivery', 'Delivered'],
    default: 'Preparing'
  },
  deliveryTime: {
    type: Number,
    default: 30 
  }
}, { timestamps: true });

let Order = mongoose.model('Order', OrderSchema);
export default Order;

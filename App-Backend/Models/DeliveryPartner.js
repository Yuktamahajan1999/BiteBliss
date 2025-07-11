import mongoose from 'mongoose';

const DeliveryPartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  assignedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
 status: {
  type: String,
  enum: ['available', 'assigned', 'on_delivery', 'arrived'],
  default: 'available'
},
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  orderHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  ratings: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  }
}, { timestamps: true });

const DeliveryPartner = mongoose.model('DeliveryPartner', DeliveryPartnerSchema);
export default DeliveryPartner;

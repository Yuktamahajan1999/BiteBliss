import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
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
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  restaurantName: {
    type: String,
    required: true
  },
  orderType: {
    type: String,
    enum: ['normal', 'train', 'group'],
    required: true,
    default: 'normal'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  isTrainOrder: {
    type: Boolean,
    default: false
  },
  trainOrderRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderOnTrain'
  },
  groupOrderRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupOrder'
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
  totalAmount: {
    type: Number,
    required: true
  },
  gst: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    required: true
  },
  isFreeDelivery: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'restaurant_accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryStatus: {
    type: String,
    enum: ['unassigned', 'assigned', 'picked_up', 'arrived', 'delivered'],
    default: 'unassigned'
  },
  ownerApproval: {
    type: Boolean,
    default: false
  },
  rejectedByOwners: {
    type: Boolean,
    default: false
  },
  rejectionReason: {
    type: String,
    default: ""
  },
  rejectedByPartners: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryPartner'
    }
  ],
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  deliveryStage: {
    type: Number,
    default: 1
  },
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPartner',
    default: null
  },
  deliveryTime: {
    type: Number,
    default: 30
  },
  orderPlacedTime: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
export default Order;

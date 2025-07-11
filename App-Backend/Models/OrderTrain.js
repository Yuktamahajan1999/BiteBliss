import mongoose from "mongoose";

const OrderOnTrainSchema = new mongoose.Schema({
  orderRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
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
  pnrNumber: {
    type: String,
    required: true
  },
  trainNumber: {
    type: String,
    required: true
  },
  stationName: {
    type: String,
    required: true
  },
  mealType: {
    type: String,
    enum: ['veg', 'non-veg', 'both'],
    required: true
  },
  specialRequest: {
    type: String,
    default: "",
    maxLength: 500
  },
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'Ready', 'Arrived', 'Out for delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  deliveryTime: {
    type: Number,
    default: 30
  },
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPartner'
  }
}, { timestamps: true });

const OrderOnTrain = mongoose.model("OrderOnTrain", OrderOnTrainSchema);
export default OrderOnTrain;

import mongoose from "mongoose";

let OrderOnTrainSchema = new mongoose.Schema({
  orderNumber: { 
    type: String,
    required: true,
    unique: true
  },
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
  orderId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  pnrNumber: {
    type: String,
    required: true,
  },
  trainNumber: {
    type: String,
    required: true,
  },
  stationName: {
    type: String,
    required: true,
  },
  mealType: {
    type: String,
    enum: ['veg', 'non-veg', 'both'],
    required: true,
  },
  specialRequest: {
    type: String,
    default: "",
    maxLength: 500,
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });


let OrderOnTrain = mongoose.model("OrderOnTrain", OrderOnTrainSchema);
export default OrderOnTrain;
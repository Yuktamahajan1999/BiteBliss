
import mongoose from 'mongoose';


const ChefBookingSchema = new mongoose.Schema({
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChefProfile',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String
  },
  headCount: {
    type: Number
  },
  eventType: {
    type: String,
    enum: ['corporate', 'birthday', 'private'],
    default: 'other'
  },
  eventDate: {
    type: Date,
    required: true
  },
  eventTime: {
    type: String,
    required: true
  },
  menu: {
    type: [String],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'arrived', 'cancelled', 'completed'],
    default: 'pending'
  },
  cateringBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CateringBooking'
  },
  notes: String
}, { timestamps: true });

const chefBooking = mongoose.model('ChefBooking', ChefBookingSchema);
export default chefBooking;

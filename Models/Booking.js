import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  text: String,
  media: [{
    mediaUrl: String,
    mediaType: {
      type: String,
      enum: ['image', 'video'],
    }
  }]
}, { timestamps: true });

const tableBookingSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  bookingDate: {
    type: String,
    required: true,
  },
  bookingTime: {
    type: String,
    required: true,
  },
  numberOfGuests: {
    type: Number,
    required: true,
  },
  specialRequests: {
    type: String,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'waitlisted'],
    default: 'pending',
  },

  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  cancellationReason: {
    type: String,
    enum: ['no-show', 'customer-request', 'restaurant-closed', 'other'],
    default: 'other',
  },
 experiences: [experienceSchema],
}, { timestamps: true });

const TableBooking = mongoose.model("TableBooking", tableBookingSchema);

export default TableBooking;

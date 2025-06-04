import mongoose from "mongoose";

let RestaurantOwnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  photos: {
    type: [String],
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  offer: {
    type: String,
    default: "No offer available",
  },
  time: {
    type: String,
    required: true,
  },
  distance: {
    type: String,
    required: true,
  },
  deliveryAvailable: {
    type: Boolean,
    default: true,
  },
  diningAvailability: {
    type: Boolean,
    default: true,
  },
  contact: {
    type: String,
    required: true,
    default: "No contact available",
  },
  petAllow: {
    type: Boolean,
    default: false,
  },
  gstNumber: {
    type: String,
    required: true,
  },
  legalName: {
    type: String,
    required: true,
  },
  fssaiNumber: {
    type: String,
    required: true,
  },
  cuisine: {
    type: [String],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  restaurantowner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  openHours: {
    monday: {
      open: { type: String, default: "09:00 AM" },
      close: { type: String, default: "11:00 PM" },
    },
    tuesday: {
      open: { type: String, default: "09:00 AM" },
      close: { type: String, default: "11:00 PM" },
    },
    wednesday: {
      open: { type: String, default: "09:00 AM" },
      close: { type: String, default: "11:00 PM" },
    },
    thursday: {
      open: { type: String, default: "09:00 AM" },
      close: { type: String, default: "11:00 PM" },
    },
    friday: {
      open: { type: String, default: "09:00 AM" },
      close: { type: String, default: "11:00 PM" },
    },
    saturday: {
      open: { type: String, default: "10:00 AM" },
      close: { type: String, default: "11:59 PM" },
    },
    sunday: {
      open: { type: String, default: "10:00 AM" },
      close: { type: String, default: "11:00 PM" },
    },
  },
}, { timestamps: true });

let Restaurant = mongoose.model("Restaurant", RestaurantOwnerSchema);

export default Restaurant;

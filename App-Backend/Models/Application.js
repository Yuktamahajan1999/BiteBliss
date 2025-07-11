import mongoose from "mongoose";

let ApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true
    },

    position: {
      type: String,
      required: true,
      enum: [
        'Delivery Partner',
        'Chef',
        'Customer Support'
      ]
    },

    experience: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [
        'pending',
        'reviewed',
        'accepted',
        'rejected'
      ],
      default: 'pending'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }, { timestamps: true }
);


let Application = mongoose.model("Application", ApplicationSchema);
export default Application;
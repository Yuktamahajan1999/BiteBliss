import mongoose from "mongoose";

const PartnerApplicationSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
  },
  contactPerson: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  cuisineType: {
    type: [String],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    maxLength: 500,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  submittedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'submittedBy.role'
    },
    role: {
      type: String,
      enum: ['admin', 'restaurantowner'],
      required: true
    }
  }
}, { timestamps: true });

const PartnerApplication = mongoose.model("PartnerApplication", PartnerApplicationSchema);

export default PartnerApplication;

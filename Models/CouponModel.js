import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'delivery'],
      required: true
    },
    discountValue: { type: Number, required: true },
    minOrder: Number,
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon ;
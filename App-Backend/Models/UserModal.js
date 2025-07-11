import mongoose from "mongoose";

const UserPreferencesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    wishList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
    hiddenRestaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],rewardPoints: {
      type: Number,
      default: 0
    },
    ratingRewardGiven: {
      type: Boolean,
      default: false
    },
    redeemedRewards: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);


const UserPreference = mongoose.model("UserPreference", UserPreferencesSchema);

const GiftCardSchema = new mongoose.Schema(
  {
    cardCode: {
      type: String,
      required: true,
      trim: true,
    },
    redeemedAt: {
      type: Date,
      default: Date.now,
    },
    redeemedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    pin: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true
    },
    occasion: {
      type: String
    },
    message: {
      type: String
    },

  }
);

GiftCardSchema.index(
  { cardCode: 1, redeemedBy: 1 },
  {
    unique: true,
    partialFilterExpression: {
      cardCode: { $ne: null },
      redeemedBy: { $ne: null },
    },
  }
);

const GiftCard = mongoose.model("GiftCard", GiftCardSchema);

const UserCouponPrefsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  appliedCoupons: [{
    code: {
      type: String,
      required: true
    }
  }]
});
const UserCouponPrefs = mongoose.model("UserCouponPrefs", UserCouponPrefsSchema);


export { UserPreference, GiftCard, UserCouponPrefs };


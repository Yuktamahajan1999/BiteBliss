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
    ],
    appliedCoupons: [
      {
        code: { type: String, required: true },
        appliedAt: { type: Date, default: Date.now }
      }
    ]
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
      required: true,
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


export { UserPreference, GiftCard };

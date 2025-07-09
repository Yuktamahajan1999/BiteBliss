import mongoose from "mongoose";

const cardDetailsSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    expiry: {
      type: String,
      required: true
    },
    cvv: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    method: {
      type: String,
      enum: ["credit-card", "google-pay", "cod"],
      required: true
    },
    cardDetails: {
      type: cardDetailsSchema,
      required: function () {
        return this.method === "credit-card";
      }
    },
    transactionId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending"
    },
    type: {
      type: String,
      enum: ["order", "donation"],
      default: "order"
    },
    amount: {
      type: Number,
      required: true
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: function () {
        return this.type === "order";
      }
    }
  }, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;

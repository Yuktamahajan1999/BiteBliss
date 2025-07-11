import mongoose from "mongoose";

let cartItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  }
});

let cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  restaurant: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    name: {
      type: String
    },
    location: {
      type: String
    }
  },
  items: [cartItemSchema]
}, { timestamps: true });

let Cart = mongoose.model('Cart', cartSchema);

export default Cart;

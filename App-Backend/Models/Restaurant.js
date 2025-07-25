import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  legalName: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  photos: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: ""
  },
  cuisine: {
    type: [String],
    required: true
  },
  address: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  distance: {
    type: String,
    required: true
  },
  openHours: {
    monday: {
      open: {
        type: String,
        default: "09:00 AM"
      },
      close: {
        type: String,
        default: "10:00 PM"
      }
    },
    tuesday: {
      open: {
        type: String,
        default: "09:00 AM"
      },
      close: {
        type: String,
        default: "10:00 PM"
      }
    },
    wednesday: {
      open: {
        type: String,
        default: "09:00 AM"
      },
      close: {
        type: String,
        default: "10:00 PM"
      }
    },
    thursday: {
      open: {
        type: String,
        default: "09:00 AM"
      },
      close: {
        type: String,
        default: "10:00 PM"
      }
    },
    friday: {
      open: {
        type: String,
        default: "09:00 AM"
      },
      close: {
        type: String,
        default: "10:00 PM"
      }
    },
    saturday: {
      open: {
        type: String,
        default: "10:00 AM"
      },
      close: {
        type: String,
        default: "10:00 PM"
      }
    },
    sunday: {
      open: {
        type: String,
        default: "10:00 AM"
      },
      close: {
        type: String,
        default: "10:00 PM"
      }
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  offer: {
    type: String,
    default: "No offer available"
  },
  deliveryPartners: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
    }
  ],
  fssaiNumber: {
    type: String,
    required: true
  },
  gstNumber: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true,
    default: "No contact available"
  },
  deliveryAvailable: {
    type: Boolean,
    default: true
  },
  deliveryUnavailableReason: {
    type: String,
    default: ""
  },
  acceptingOrders: {
    type: Boolean,
    default: true
  },
  acceptingBookings: {
    type: Boolean,
    default: true
  },
  diningAvailability: {
    type: Boolean,
    default: true
  },
  petAllow: {
    type: Boolean,
    default: false
  },
  restaurantowner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  menu: [
    {
      name: String,
      description: String,
      items: [
        {
          name: String,
          description: String,
          price: Number,
          type: {
            type: String,
            enum: ["veg", "non-veg"]
          },
          image: String,
          highlyReordered: Boolean
        }
      ]
    }
  ],
  reviews: [
    {
      userName: String,
      rating: Number,
      text: String,
      date: String
    }
  ],
  isOpen: {
    type: Boolean,
    default: true
  },
  closureReason: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      userName: String,
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },
      text: String,
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

const Restaurant = mongoose.model("Restaurant", RestaurantSchema);

export default Restaurant;
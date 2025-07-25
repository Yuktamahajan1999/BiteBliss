import mongoose from "mongoose";

const CateringBookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    address: {
        type: String,
        ref: 'Address',
        required: [true, 'Address is required'],
        trim: true
    },
      eventTime: {  
        type: String,
        required: [true, 'Event time is required'],
        trim: true
    },
    headCount: {
        type: Number,
        required: [true, 'Head count is required'],
        min: 1,
        max: 20
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    specialRequests: {
        type: String,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    chef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChefProfile',
        required: false,
    },
    chefName: {
        type: String,
        required: false,
        trim: true
    },
    type: {
        type: String,
        default: "Book Chef"
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'arrived', 'cancelled', 'completed'],
        default: 'pending'
    },
}, { timestamps: true });

const CateringBooking = mongoose.model('CateringBooking', CateringBookingSchema);

const ChefStatusSchema = new mongoose.Schema({
    chefName: {
        type: String,
        required: true,
        trim: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    availabilityStatus: {  
        type: String,
        enum: ['available', 'unavailable'],
        default: 'available'
    },
    statusMessage: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        required: false,
        trim: true
    },
    ratings: [{
        reviewer: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        comment: {
            type: String,
            default: ""
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CateringBooking'
        }
    }],
    rating: {
        type: Number,
        default: 0
    },
    location: {
        type: String,
        required: true,
        trim: true 
    }
}, { timestamps: true });
const ChefStatus = mongoose.model('ChefStatus', ChefStatusSchema);

export { CateringBooking, ChefStatus };
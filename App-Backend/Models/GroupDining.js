import mongoose from "mongoose";

const GroupDiningBookingSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    persons: {
        type: Number,
        required: true,
        min: 1
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    specialRequests: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const GroupDiningBooking = mongoose.model('GroupDiningBooking', GroupDiningBookingSchema);
export default GroupDiningBooking;

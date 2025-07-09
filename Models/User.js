import mongoose from "mongoose";

let UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['user', 'restaurantowner', 'chef', 'admin', 'deliverypartner'],
        default: 'user',
        lowercase: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved',
    }
}, { timestamps: true });

let User = mongoose.model("User", UserSchema);

export default User;

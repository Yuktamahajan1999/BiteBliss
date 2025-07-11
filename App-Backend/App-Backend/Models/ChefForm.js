import mongoose from "mongoose";

const ChefProfileSchema = new mongoose.Schema({
    chefName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 30
    },
    specialty: {
        type: String,
        required: true,
        trim: true
    },
    cuisines: {
        type: [String],
        required: true,
        validate: [arr => arr.length > 0, 'At least one cuisine must be selected']
    },
    price: {
        type: Number,
        required: true,
        min: 99,
        max: 1999
    },
    vegNonVeg: {
        type: String,
        enum: ['veg', 'non-veg', 'both'],
        required: true
    },
    signatureDishes: {
        type: [String],
        required: true
    },
    menu: {
        type: [String],
        default: []
    },
    location: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Contact number must be a 10-digit number']
    },
    bio: {
        type: String,
        maxlength: 500
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isHygienic: {
        type: Boolean,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const ChefProfile = mongoose.model('ChefProfile', ChefProfileSchema);

export default ChefProfile;


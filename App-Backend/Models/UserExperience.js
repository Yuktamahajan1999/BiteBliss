import mongoose from "mongoose";

const UserExperienceSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    restaurantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    mediaUrl:{
        type: String,
    },
    mediaType:{
        type: String,
        enum: ['image', 'video'],
        required: true,
    },
    review:{    
        type: String,
        maxlength: 1000,
    },
    rating:{
        type: Number,
        min: 1,
        max: 5,
    },
    isDeconsted:{
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const UserExperience = mongoose.model("UserExperience", UserExperienceSchema);  
export default UserExperience;
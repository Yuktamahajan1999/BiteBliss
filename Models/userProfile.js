import mongoose from "mongoose";

let UserProfileSchema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
   },
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
    mobile: {
        type: String,
        required: true,
    },
    gender:{
        type: String,
        enum:['female' , 'male' , 'Other'],
        default: '',
    },
    dob:{
        type: Date,
        required: true,
    },
    profileImage : {
        type: String,
        default:""
    },
}, { timestamps: true });

let UserProfile = mongoose.model("UserProfile", UserProfileSchema);

export default UserProfile;
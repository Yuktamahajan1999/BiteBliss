import mongoose from "mongoose";

let VolunteerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    interests: {
        type: String,
        required: true,
    },
}, { timestamps: true });

let Volunteer = mongoose.model("Volunteer", VolunteerSchema);
export default Volunteer;
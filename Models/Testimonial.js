import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema({
    story: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
     page: {
        type: String,
        required: true,
        enum: ["employees", "feeding-india"], 
    }
}, { timestamps: true });

const Testimonial = mongoose.model("Testimonial", TestimonialSchema);

export default Testimonial;

import mongoose from "mongoose";

let NotificationSchema = new mongoose.Schema({
    sms:{
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    push: {
        type: String,
        required: true,
    }
}, { timestamps: true });

let Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
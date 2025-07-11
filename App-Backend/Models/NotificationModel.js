import mongoose from "mongoose";

let NotificationSchema = new mongoose.Schema({
    sms:{
        type: Boolean,
        required: true,
    },
    email: {
        type: Boolean,
        required: true,
    },
    push: {
        type: Boolean,
        required: true,
    }
}, { timestamps: true });

let Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
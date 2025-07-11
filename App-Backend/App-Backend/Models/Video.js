import mongoose from "mongoose";

let CommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
}, { timestamps: true });

let VideoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: "Untitled Recipe",
        minlength: 3,
    },
    description: {
        type: String,
        required: true,
        default: "No description provided.",
        maxlength: 1000,
    },
    src: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: false,
    },
    tags: {
        type: [String],
        default: [],
    },
    thumbnail: {
        type: String,
        required: false,
    },
    views: {
        type: Number,
        default: 0,
    },
    votes: {
        type: Number,
        default: 0,
    },
    isPrivate: {
        type: Boolean,
        default: false,
    },
    comments: [CommentSchema],

    uploadedByType: {
        type: String,
        required: true,
        enum: ["User", "Restaurant"],
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "uploadedByType",
    },
}, { timestamps: true });

VideoSchema.index({ uploadedBy: 1, createdAt: -1 });

let Video = mongoose.model("Video", VideoSchema);
export default Video;

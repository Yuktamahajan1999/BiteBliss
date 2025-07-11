import mongoose from "mongoose";
import Video from "../Models/Video.js";
import { uploadToCloudinary } from "../Middlewares/UploadMiddleware.js";
// Get videos 
export const getVideos = async (req, res) => {
  try {
    const { uploadedByType, uploadedBy } = req.query;

    const filter = {};
    if (uploadedByType) filter.uploadedByType = uploadedByType;
    if (uploadedBy) filter.uploadedBy = uploadedBy;

    const videos = await Video.find(filter);
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch videos", error: error.message });
  }
};


// Upload a new video
export const uploadVideo = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      tags,
      thumbnail,
      isPrivate,
      uploadedByType,
      uploadedBy,
    } = req.body;

    if (!uploadedByType || !["User", "Restaurant"].includes(uploadedByType)) {
      return res.status(400).json({ message: "Invalid uploadedByType" });
    }
    if (!uploadedBy) {
      return res.status(400).json({ message: "uploadedBy is required" });
    }
    let videoUrl = "";
    let thumbUrl = thumbnail;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "videos"
      );
      videoUrl = uploadResult.secure_url;
    } else if (req.body.src) {
      videoUrl = req.body.src;
    } else {
      return res.status(400).json({ message: "No video file uploaded." });
    }

    const video = new Video({
      title,
      description,
      src: videoUrl,
      duration,
      tags,
      thumbnail: thumbUrl,
      isPrivate,
      uploadedByType,
      uploadedBy,
    });

    await video.save();
    res.status(201).json({ message: "Video uploaded successfully", video });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload video", error: error.message });
  }
};

// Add a comment to a video
export const addComment = async (req, res) => {
  try {
    const { videoId, text } = req.body;
    const { id: userId, name: userName, role: userType } = req.user;

    if (!videoId || !text || !userId || !userName || !userType) {
      return res.status(400).json({ message: "All fields required" });
    }

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    video.comments.push({ text, userId, userName, userType });
    video.comments.forEach(c => {
      if (!c.userType) c.userType = "User";
      if (Array.isArray(c.replies)) {
        c.replies.forEach(r => {
          if (!r.userType) r.userType = "User";
        });
      }
    });
    await video.save();

    res.status(201).json({ message: "Comment added", comments: video.comments });
  } catch (error) {
    res.status(500).json({ message: "Comment failed", error: error.message });
  }
};

// Delete a video
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.query;
    const userId = req.user.id;

    if (!id) return res.status(400).json({ message: "Video id is required" });

    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.uploadedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this video" });
    }

    await Video.findByIdAndDelete(id);
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete video", error });
  }
};


// Update a video
export const updateVideo = async (req, res) => {
  try {
    const { id } = req.query;
    const userId = req.user.id;

    if (!id) return res.status(400).json({ message: "Video ID is required" });

    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.uploadedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this video" });
    }

    const updateData = {
      title: req.body.title || video.title,
      description: req.body.description || video.description,
      duration: req.body.duration || video.duration,
      tags: req.body.tags || video.tags,
      thumbnail: req.body.thumbnail || video.thumbnail,
      isPrivate: req.body.isPrivate ?? video.isPrivate,
    };

    if (req.body.src) {
      updateData.src = req.body.src;
    }

    const updated = await Video.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({ message: "Video updated successfully", video: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update video", error: error.message });
  }
};


// Votes for video
export const upvoteVideo = async (req, res) => {
  try {
    const { videoId } = req.query;
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const updated = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { votes: 1 } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Video not found" });

    res.status(200).json({ message: "Video upvoted", votes: updated.votes });
  } catch (error) {
    res.status(500).json({ message: "Vote failed", error: error.message });
  }
};


// Reply Comment
export const addReply = async (req, res) => {
  try {
    const { videoId, commentId, text } = req.body;
    const { id: userId, name: userName, role: userType } = req.user;

    if (!videoId || !commentId || !text || !userId || !userName || !userType) {
      return res.status(400).json({ message: "All fields required" });
    }

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.replies.push({ text, userId, userName, userType });
    video.comments.forEach(c => {
      if (!c.userType) c.userType = "User";
      if (Array.isArray(c.replies)) {
        c.replies.forEach(r => {
          if (!r.userType) r.userType = "User";
        });
      }
    });
    await video.save();

    res.status(201).json({ message: "Reply added", replies: comment.replies });
  } catch (error) {
    res.status(500).json({ message: "Reply failed", error: error.message });
  }
};  
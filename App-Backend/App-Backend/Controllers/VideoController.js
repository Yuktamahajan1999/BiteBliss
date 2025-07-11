import Video from "../Models/Video.js";
import { uploadToCloudinary } from "../Middlewares/UploadMiddleware.js";
import User from '../Models/User.js'
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

    // Upload video file to cloudinary if present
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

// Add comment to a video
export const addComment = async (req, res) => {
  try {
    const { videoId, userId, text } = req.body;
    if (!videoId || !userId || !text) {
      return res.status(400).json({ message: "videoId, userId and text are required" });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const user = await User.findById(userId);
    const userName = user ? user.name : "Anonymous";

    video.comments.push({ text, userId, userName });
    video.updatedAt = new Date();
    await video.save();

    res.status(201).json({ message: "Comment added", comments: video.comments });
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment", error: error.message });
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
    const videoId = req.query.id;
    if (!videoId) return res.status(400).json({ message: "Video ID is required" });

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    video.votes = (video.votes || 0) + 1;
    await video.save();

    res.status(200).json({ message: "Video upvoted successfully", votes: video.votes });
  } catch (error) {
    res.status(500).json({ message: "Failed to upvote video", error: error.message });
  }
};


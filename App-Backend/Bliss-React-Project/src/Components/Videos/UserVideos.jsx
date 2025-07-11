// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import AddCommentIcon from "@mui/icons-material/AddComment";
import { UserContext } from "../UserContext";

const UserVideos = () => {
  const { user } = useContext(UserContext);
  const [videos, setVideos] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDesc, setVideoDesc] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("User changed:", user);
    if (user) {
      fetchVideos();
    } else {
      setVideos([]);
    }
  }, [user]);

  const fetchVideos = async () => {
    if (!user) return;

    try {
      console.log("Fetching videos for user:", user.id);
      setLoading(true);
      const res = await axios.get("http://localhost:8000/videos/user", {
        headers: { Authorization: `Bearer ${user.token}` },
        params: {
          uploadedByType: "User",
          uploadedBy: user.id,
        },
      });

      // Support various response formats
      const videosData = Array.isArray(res.data)
        ? res.data
        : res.data.videos || [];

      console.log("Fetched videos:", videosData);
      setVideos(videosData);
      setErrorMsg("");
    } catch (err) {
      console.error("Fetch error:", err);
      setErrorMsg(
        err.response?.data?.message || "Failed to load videos from server."
      );
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("Selected file:", file);
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setErrorMsg("");
    } else {
      setErrorMsg("Please upload a valid video file!");
      setVideoFile(null);
    }
  };

  const uploadVideo = async () => {
    if (!videoFile) {
      setErrorMsg("Please select a video file to upload.");
      return;
    }
    if (!videoTitle.trim()) {
      setErrorMsg("Please enter a video title.");
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("title", videoTitle);
    formData.append("description", videoDesc);
    formData.append("uploadedByType", "User");
    formData.append("uploadedBy", user.id);

    try {
      console.log("Uploading video:", videoTitle, videoFile);
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/videos/user/uploadvideo",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const newVideo = res.data.video || res.data;
      console.log("Upload successful, new video:", newVideo);
      setVideos((prev) => [newVideo, ...prev]);
      setVideoFile(null);
      setVideoTitle("");
      setVideoDesc("");
      setErrorMsg("");
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg(
        err.response?.data?.message || err.message || "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      console.log("Deleting video with id:", id);
      setLoading(true);
      await axios.delete("http://localhost:8000/videos/user/deletevideo", {
        headers: { Authorization: `Bearer ${user.token}` },
        params: { id },
      });
      setVideos((prev) => prev.filter((v) => v._id !== id));
      setErrorMsg("");
      console.log("Video deleted:", id);
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to delete video");
    } finally {
      setLoading(false);
    }
  };

  const upvoteVideo = async (id) => {
    try {
      console.log("Upvoting video with id:", id);
      const res = await axios.post(
        `http://localhost:8000/videos/upvote?id=${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setVideos((prev) =>
        prev.map((video) =>
          video._id === id ? { ...video, votes: res.data.votes } : video
        )
      );
      setErrorMsg("");
      console.log("Upvote successful:", res.data.votes);
    } catch (err) {
      console.error("Upvote error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to upvote video");
    }
  };

  const handleCommentChange = (videoId, text) => {
    console.log("Comment input changed for video:", videoId, "Text:", text);
    setCommentInputs((prev) => ({
      ...prev,
      [videoId]: text,
    }));
  };

  const addComment = async (videoId) => {
    const commentText = commentInputs[videoId]?.trim();
    if (!commentText) {
      console.log("Empty comment, nothing to add");
      return;
    }

    try {
      console.log("Adding comment to video:", videoId, "Comment:", commentText);
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/videos/comment",
        {
          videoId,
          userId: user.id,
          text: commentText,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setVideos((prev) =>
        prev.map((video) =>
          video._id === videoId ? { ...video, comments: res.data.comments } : video
        )
      );

      setCommentInputs((prev) => ({
        ...prev,
        [videoId]: "",
      }));
      setErrorMsg("");
      console.log("Comment added successfully");
    } catch (err) {
      console.error("Comment error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uservideo-container">
      <h1 className="uservideo-header">📹 User Cooking Videos</h1>
      <p className="uservideo-subtext">
        {user
          ? "Share your home-cooked meals and personal recipes!"
          : "Please login to view and upload videos."}
      </p>

      {user && (
        <div className="uservideo-upload-section">
          <div className="rolebadge-section">
            <span className="role-badge">👤 User Mode</span>
          </div>

          <input
            type="text"
            placeholder="Enter video title..."
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            className="uservideo-input"
          />

          <textarea
            placeholder="Add a short description..."
            value={videoDesc}
            onChange={(e) => setVideoDesc(e.target.value)}
            className="uservideo-textarea"
            rows={3}
          ></textarea>

          <div className="upload-video-section">
            <input
              type="file"
              accept="video/*"
              id="user-video-upload"
              className="uservideo-upload-input"
              onChange={handleFileChange}
            />
            <label htmlFor="user-video-upload" className="uservideo-upload-label">
              <span className="upload-icon">📤</span> Choose Video File
            </label>

            {videoFile && (
              <p className="selected-file-name">Selected: {videoFile.name}</p>
            )}

            <button
              className="uservideo-submit-btn"
              onClick={uploadVideo}
              disabled={loading}
              aria-label="Upload video"
            >
              {loading ? "Uploading..." : "Upload Now"}
            </button>

            {errorMsg && <p className="uservideo-error">{errorMsg}</p>}
          </div>
        </div>
      )}

      {loading && <div className="loading-spinner">Loading...</div>}

      {!loading && videos.length === 0 ? (
        <p className="uservideo-empty-message">
          {user
            ? "No videos uploaded yet. Share your first cooking video!"
            : "Please login to view videos."}
        </p>
      ) : (
        <div className="uservideo-gallery">
          {videos.map((video) => (
            <div key={video._id} className="uservideo-video-card">
              {user && (
                <button
                  className="uservideo-delete-btn"
                  onClick={() => deleteVideo(video._id)}
                  disabled={loading}
                  aria-label="Delete video"
                >
                  ❌
                </button>
              )}
              <div className="uservideo-video-wrapper">
                <video
                  src={
                    video.src.startsWith("http")
                      ? video.src
                      : `http://localhost:8000/${video.src.replace(/\\/g, "/")}`
                  }
                  controls
                  className="uservideo-video"
                  poster={video.thumbnail || ""}
                />
              </div>
              <div className="uservideo-info">
                <h3 className="uservideo-title">{video.title || "Untitled Video"}</h3>
                <p className="uservideo-description">{video.description || ""}</p>

                <div className="uservideo-meta">
                  <span>{video.votes || 0} votes</span>
                  <button
                    className="uservideo-vote-btn"
                    onClick={() => upvoteVideo(video._id)}
                    disabled={!user || loading}
                    aria-label="Upvote video"
                  >
                    <ThumbUpIcon fontSize="small" />
                  </button>
                </div>

                {user && (
                  <div className="uservideo-comment-form">
                    <input
                      className="uservideo-comment-input"
                      type="text"
                      placeholder="Add a comment..."
                      value={commentInputs[video._id] || ""}
                      onChange={(e) =>
                        handleCommentChange(video._id, e.target.value)
                      }
                      disabled={loading}
                    />
                    <button
                      className="uservideo-comment-submit"
                      onClick={() => addComment(video._id)}
                      disabled={loading}
                      aria-label="Submit comment"
                    >
                      <AddCommentIcon fontSize="small" />
                    </button>
                  </div>
                )}

                {video.comments?.length > 0 && (
                  <div className="uservideo-comments">
                    <h4>Comments</h4>
                    {video.comments.map((comment, index) => (
                      <p key={index} className="uservideo-comment-text">
                        <strong>{comment.userName || "Anonymous"}:</strong>{" "}
                        {comment.text}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserVideos;

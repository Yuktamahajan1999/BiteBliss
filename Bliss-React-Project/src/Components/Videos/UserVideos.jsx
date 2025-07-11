/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import AddCommentIcon from "@mui/icons-material/AddComment";
import ReplyIcon from "@mui/icons-material/Reply";
import EditIcon from "@mui/icons-material/Edit";
import { UserContext } from "../UserContext";

const UserVideos = () => {
  const { user } = useContext(UserContext);
  const [videos, setVideos] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDesc, setVideoDesc] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDesc, setEditedDesc] = useState("");

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/videos/user", {
        headers: user ? { Authorization: `Bearer ${user.token}` } : {},
        params: {
          uploadedByType: "User",
        },
      });
       const filteredVideos = res.data.filter(video => {
      if (!video.comments) return true;
      return video.comments.every(comment => comment.userType);
    });
    
      setVideos(res.data);
      setErrorMsg("");
    } catch (err) {
      console.error('Error fetching videos:', err);
      setErrorMsg('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('video/')) {
      setErrorMsg('Please select a valid video file.');
      return;
    }
    setVideoFile(file);
    setErrorMsg('');
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
      setLoading(true);
      const response = await axios.post(
        "http://localhost:8000/videos/user/uploadvideo",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setVideoTitle("");
      setVideoDesc("");
      setVideoFile(null);
      document.getElementById('user-video-upload').value = '';
      fetchVideos();
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        'Upload failed';
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      setLoading(true);
      await axios.delete(`http://localhost:8000/videos/user/deletevideo?id=${videoId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchVideos();
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error deleting video');
      console.error('Error deleting video:', err);
    } finally {
      setLoading(false);
    }
  };

  const upvoteVideo = async (videoId) => {
    console.log('Attempting to upvote video:', videoId);

    if (!user?.token) {
      console.log('User not logged in - blocking vote');
      setErrorMsg("Please login to upvote");
      return;
    }

    const STORAGE_KEY = 'votedVideos';

    let votedVideos = {};
    try {
      const storedVotes = localStorage.getItem(STORAGE_KEY);
      console.log('Retrieved from localStorage:', storedVotes);
      votedVideos = storedVotes ? JSON.parse(storedVotes) : {};
      console.log('Parsed votedVideos:', votedVideos);
    } catch (e) {
      console.error('Error parsing votedVideos:', e);
      votedVideos = {};
    }

    if (votedVideos[videoId]) {
      console.log('User already voted for this video - blocking duplicate vote');
      setErrorMsg("You've already voted for this video");
      return;
    }

    try {
      console.log('Sending upvote request to server...');
      setLoading(true);

      const response = await axios.post(
        `http://localhost:8000/videos/upvote?videoId=${videoId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Upvote successful, server response:', response.data);

      votedVideos[videoId] = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(votedVideos));
      console.log('Updated localStorage with new vote');

      setVideos(prevVideos => {
        const updated = prevVideos.map(video =>
          video._id === videoId
            ? { ...video, votes: response.data.votes || (video.votes || 0) + 1 }
            : video
        );
        console.log('Updated videos state:', updated);
        return updated;
      });

      setErrorMsg("");
    } catch (err) {
      console.error('Upvote failed:', err);
      console.log('Error response:', err.response);
      setErrorMsg(err.response?.data?.message || 'Upvote failed');
    } finally {
      console.log('Vote process completed');
      setLoading(false);
    }
  };
  const handleCommentChange = (videoId, text) => {
    setCommentInputs((prev) => ({ ...prev, [videoId]: text }));
  };

  const handleReplyChange = (commentId, text) => {
    setReplyInputs((prev) => ({
      ...prev,
      [commentId]: text,
    }));
  };

  const startReply = (commentId) => {
    setReplyingTo(commentId);
    setReplyInputs((prev) => ({
      ...prev,
      [commentId]: "",
    }));
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const addComment = async (videoId) => {
    const text = commentInputs[videoId]?.trim();
    if (!text || !user?.token) {
      setErrorMsg(!user ? "Please login to comment" : "Comment cannot be empty");
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:8000/videos/comment', {
        videoId,
        text,
        userId: user.id,
        userName: user.name || "User",
        userType: user.role || "User"
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCommentInputs((prev) => ({ ...prev, [videoId]: '' }));
      fetchVideos();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error adding comment');
      console.error('Error adding comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const addReply = async (videoId, commentId) => {
    const replyText = replyInputs[commentId]?.trim();
    if (!replyText || !user?.token) {
      setErrorMsg(!user ? "Please login to reply" : "Reply cannot be empty");
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:8000/videos/addreply', {
        videoId,
        commentId,
        text: replyText,
        userId: user.id,
        userName: user.name || "User",
        userType: user.role || "User"
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
      setReplyingTo(null);
      fetchVideos();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error adding reply');
      console.error('Error adding reply:', err);
    } finally {
      setLoading(false);
    }
  };

  const editVideo = (video) => {
    setEditingVideoId(video._id);
    setEditedTitle(video.title);
    setEditedDesc(video.description || '');
    setVideoFile(null);
  };

  const saveVideoUpdate = async (videoId) => {
    if (!editedTitle.trim()) {
      setErrorMsg('Title cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', editedTitle);
      formData.append('description', editedDesc);
      if (videoFile) {
        formData.append('video', videoFile);
      }

      await axios.put(`http://localhost:8000/videos/user/updatevideo?id=${videoId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      });

      setEditingVideoId(null);
      setVideoFile(null);
      document.getElementById('user-video-upload').value = '';
      setErrorMsg('');
      fetchVideos();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Update failed');
      console.error('Error updating video:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingVideoId(null);
    setVideoFile(null);
    document.getElementById('user-video-upload').value = '';
    setErrorMsg('');
  };

  return (
    <div className="uservideo-container">
      <h1 className="uservideo-header">📹 User Cooking Videos</h1>
      <p className="uservideo-subtext">
        Share your home-cooked meals and personal recipes!
      </p>

      {loading && <div className="loading">Loading...</div>}

      {user && (
        <div className="uservideo-upload-section">
          <div className="rolebadge-section">
            <span className="role-badge">👤 User Mode</span>
          </div>

          {editingVideoId ? (
            <>
              <input
                type="text"
                placeholder="Enter video title..."
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="uservideo-input"
                required
              />

              <textarea
                placeholder="Add a short description..."
                value={editedDesc}
                onChange={(e) => setEditedDesc(e.target.value)}
                className="uservideo-textarea"
                rows={3}
              ></textarea>

              <input
                type="file"
                accept="video/*"
                id="user-video-upload"
                className="uservideo-upload-input"
                onChange={handleFileChange}
              />
              <label htmlFor="user-video-upload" className="uservideo-upload-label">
                {videoFile ? 'Change Video File' : 'Optional: Replace Video'}
              </label>

              {videoFile && (
                <p className="selected-file">Selected: {videoFile.name}</p>
              )}

              <div className="edit-buttons">
                <button
                  className="uservideo-submit-btn"
                  onClick={() => saveVideoUpdate(editingVideoId)}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  className="uservideo-cancel-btn"
                  onClick={cancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter video title..."
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="uservideo-input"
                required
              />

              <textarea
                placeholder="Add a short description..."
                value={videoDesc}
                onChange={(e) => setVideoDesc(e.target.value)}
                className="uservideo-textarea"
                rows={3}
              ></textarea>

              <input
                type="file"
                accept="video/*"
                id="user-video-upload"
                className="uservideo-upload-input"
                onChange={handleFileChange}
                required
              />
              <label htmlFor="user-video-upload" className="uservideo-upload-label">
                Choose Video File
              </label>

              {videoFile && (
                <p className="selected-file">Selected: {videoFile.name}</p>
              )}

              <button
                className="uservideo-submit-btn"
                onClick={uploadVideo}
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Upload Video'}
              </button>
            </>
          )}

          {errorMsg && <p className="uservideo-error">{errorMsg}</p>}
        </div>
      )}

      <div className="uservideo-gallery">
        {videos.length === 0 ? (
          <p className="no-videos">
            {user
              ? 'No videos uploaded yet. Share your first cooking video!'
              : 'Please login to view user videos.'}
          </p>
        ) : (
          videos.map((video) => (
            <div key={video._id} className="uservideo-video-card">
              {user && user.id === video.uploadedBy && (
                <button
                  className="uservideo-delete-btn"
                  onClick={() => deleteVideo(video._id)}
                  disabled={loading}
                >
                  ❌
                </button>
              )}

              <div className="uservideo-video-wrapper">
                <video
                  src={video.src}
                  controls
                  className="uservideo-video"
                />
              </div>

              <div className="uservideo-info">
                {editingVideoId === video._id ? (
                  <>
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="uservideo-input"
                    />
                    <textarea
                      value={editedDesc}
                      onChange={(e) => setEditedDesc(e.target.value)}
                      rows={3}
                      className="uservideo-textarea"
                    ></textarea>
                    <div className="uservideo-edit-buttons">
                      <button
                        className="uservideo-submit-btn"
                        onClick={() => saveVideoUpdate(video._id)}
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button
                        className="uservideo-cancel-btn"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="uservideo-title">{video.title}</h3>
                    <p className="uservideo-description">{video.description}</p>
                    {user && user.id === video.uploadedBy && (
                      <button
                        className="uservideo-edit-btn"
                        onClick={() => editVideo(video)}
                        disabled={loading}
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </>
                )}

                <div className="uservideo-meta">
                  <span>{video.votes || 0} votes</span>
                  {user && (
                    <button
                      className="uservideo-vote-btn"
                      onClick={() => upvoteVideo(video._id)}
                      disabled={loading || editingVideoId}
                    >
                      <ThumbUpIcon fontSize="small" />
                    </button>
                  )}
                </div>

                <div className="uservideo-comment-form">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentInputs[video._id] || ''}
                    onChange={(e) => handleCommentChange(video._id, e.target.value)}
                    disabled={loading || editingVideoId}
                    className="uservideo-comment-input"
                  />
                  {user && (
                    <button
                      className="uservideo-comment-submit"
                      onClick={() => addComment(video._id)}
                      disabled={loading || editingVideoId}
                    >
                      <AddCommentIcon fontSize="small" />
                    </button>
                  )}
                </div>

                {video.comments?.length > 0 && (
                  <div className="uservideo-comments">
                    <h4>Comments</h4>
                    {video.comments.map((comment) => (
                      <div key={comment._id} className="uservideo-comment-item">
                        <p className="uservideo-comment-text">
                          <strong>{comment.userName || "Anonymous"}:</strong> {comment.text}
                        </p>
                        {user && (
                          <button
                            className="uservideo-reply-btn"
                            onClick={() => startReply(comment._id)}
                            disabled={loading || editingVideoId}
                          >
                            <ReplyIcon fontSize="small" /> Reply
                          </button>
                        )}

                        {replyingTo === comment._id && (
                          <div className="uservideo-reply-form">
                            <input
                              type="text"
                              placeholder="Write a reply..."
                              value={replyInputs[comment._id] || ''}
                              onChange={(e) => handleReplyChange(comment._id, e.target.value)}
                              disabled={loading}
                              className="uservideo-reply-input"
                            />
                            <button
                              className="uservideo-reply-submit"
                              onClick={() => addReply(video._id, comment._id)}
                              disabled={loading}
                            >
                              Send
                            </button>
                            <button
                              className="uservideo-reply-cancel"
                              onClick={cancelReply}
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {comment.replies?.length > 0 && (
                          <div className="uservideo-replies">
                            {comment.replies.map((reply, index) => (
                              <p key={index} className="uservideo-reply-text">
                                <strong>↳ {reply.userName || "Anonymous"}:</strong> {reply.text}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserVideos;
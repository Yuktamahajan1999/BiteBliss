/* eslint-disable no-unused-vars */
import React, { useState, useContext } from 'react';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import AddCommentIcon from '@mui/icons-material/AddComment';
import { UserContext } from '../UserContext';

const RestaurantVideos = () => {
  const { user } = useContext(UserContext);
  const [videos, setVideos] = useState([]);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [commentInputs, setCommentInputs] = useState({});

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || (!file.type.startsWith('video/') && !file.type.startsWith('image/'))) {
      setErrorMsg('Please select a valid video or image file.');
      return;
    }
    setSelectedFile(file);
    setErrorMsg('');
  };

  const handleUploadClick = () => {
    if (!selectedFile) {
      setErrorMsg('No video or image file selected.');
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    const fileType = selectedFile.type.startsWith('video/') ? 'video' : 'image';

    const newMedia = {
      id: Date.now(),
      src: url,
      type: fileType,
      title: videoTitle || 'Untitled Recipe',
      description: videoDesc || 'No description provided.',
      comments: [],
      votes: 0,
    };

    setVideos((prev) => [...prev, newMedia]);
    setVideoTitle('');
    setVideoDesc('');
    setSelectedFile(null);
    setErrorMsg('');
    document.getElementById('media-upload').value = '';
  };

  const deleteVideo = (id) => {
    setVideos((prev) => prev.filter((video) => video.id !== id));
  };

  const upvoteVideo = (id) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === id ? { ...video, votes: video.votes + 1 } : video
      )
    );
  };

  const handleCommentChange = (videoId, text) => {
    setCommentInputs((prev) => ({
      ...prev,
      [videoId]: text,
    }));
  };

  const addComment = (videoId) => {
    const commentText = commentInputs[videoId]?.trim();
    if (!commentText) return;

    setVideos((prev) =>
      prev.map((video) =>
        video.id === videoId
          ? { ...video, comments: [...video.comments, commentText] }
          : video
      )
    );

    setCommentInputs((prev) => ({
      ...prev,
      [videoId]: '',
    }));
  };

  return (
    <div className="restaurantvideo-container">
      <h1 className="restaurantvideo-header">🍳 Restaurant Cooking Media</h1>
      <p className="restaurantvideo-subtext">
        Only verified restaurants can share their signature recipes here.
      </p>

      {user?.role === 'restaurant' && (
        <div className="restaurantvideo-upload-section">
          <div className="rolebadge-section">
            <span className="role-badge">🏪 Restaurant Mode</span>
          </div>

          <input
            type="text"
            placeholder="Enter title..."
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            className="restaurantvideo-input"
          />

          <textarea
            placeholder="Add a short description..."
            value={videoDesc}
            onChange={(e) => setVideoDesc(e.target.value)}
            className="restaurantvideo-textarea"
            rows={3}
          ></textarea>

          <input
            type="file"
            accept="video/*,image/*"
            id="media-upload"
            className="restaurantvideo-upload-input"
            onChange={handleFileChange}
          />
          <label htmlFor="media-upload" className="restaurantvideo-upload-label">
            Choose Video or Image File
          </label>

          <button className="restaurantvideo-submit-btn" onClick={handleUploadClick}>
            Upload Now
          </button>

          {errorMsg && <p className="restaurantvideo-error">{errorMsg}</p>}
        </div>
      )}

      <div className="restaurantvideo-gallery">
        {videos.map((video) => (
          <div key={video.id} className="restaurantvideo-video-card">
            {user?.role === 'restaurant' && (
              <button
                className="restaurantvideo-delete-btn"
                onClick={() => deleteVideo(video.id)}
              >
                ❌
              </button>
            )}

            {video.type === 'video' ? (
              <video src={video.src} controls className="restaurantvideo-video" />
            ) : (
              <img src={video.src} alt={video.title} className="restaurantvideo-image" />
            )}

            <h3>{video.title}</h3>
            <p>{video.description}</p>

            <div className="restaurantvideo-meta">
              <span>{video.votes} votes</span>
              <button onClick={() => upvoteVideo(video.id)}>
                <ThumbUpIcon fontSize="small" />
              </button>
            </div>

            <div className="restaurantvideo-comment-form">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentInputs[video.id] || ''}
                onChange={(e) => handleCommentChange(video.id, e.target.value)}
              />
              <button onClick={() => addComment(video.id)}>
                <AddCommentIcon fontSize="small" />
              </button>
            </div>

            {video.comments.length > 0 && (
              <ul className="restaurantvideo-comments">
                {video.comments.map((comment, i) => (
                  <li key={i}>{comment}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantVideos;

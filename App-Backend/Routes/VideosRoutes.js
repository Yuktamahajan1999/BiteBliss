import express from "express";
import { uploadMedia } from "../Middlewares/UploadMiddleware.js";
import checkLogin from "../Middlewares/CheckLogin.js";
import {
  getVideos,
  uploadVideo,
  addComment,
  deleteVideo,
  updateVideo,
  upvoteVideo,
  addReply,
} from "../Controllers/VideoController.js";
import checkRole from "../Middlewares/CheckRole.js";

const Videorouter = express.Router();

// Get all user videos
Videorouter.get("/user", (req, res) => {
  req.query.uploadedByType = "User";
  getVideos(req, res);
});

// Get all restaurant videos
Videorouter.get("/restaurant", (req, res) => {
  req.query.uploadedByType = "Restaurant";
  getVideos(req, res);
});

// Upload video by user
Videorouter.post("/user/uploadvideo", checkLogin, uploadMedia.single("video"), (req, res) => {
  req.body.uploadedByType = "User";
  uploadVideo(req, res);
});

// Upload video by restaurant
Videorouter.post("/restaurant/uploadvideo", checkLogin, uploadMedia.single("video"), (req, res) => {
  req.body.uploadedByType = "Restaurant";
  uploadVideo(req, res);
});

// Delete video by user
Videorouter.delete("/user/deletevideo", checkLogin, (req, res) => {
  req.query.uploadedByType = "User";
  deleteVideo(req, res);
});

// Delete video by restaurant
Videorouter.delete("/restaurant/deletevideo", checkLogin, (req, res) => {
  req.query.uploadedByType = "Restaurant";
  deleteVideo(req, res);
});

// Update video by user
Videorouter.put("/user/updatevideo", checkLogin, uploadMedia.single("video"), (req, res) => {
  req.body.uploadedByType = "User";
  updateVideo(req, res);
});

// Update video by restaurant
Videorouter.put("/restaurant/updatevideo", checkLogin, checkRole(["restaurantowner"]), uploadMedia.single("video"), (req, res) => {
  req.body.uploadedByType = "Restaurant";
  updateVideo(req, res);
});

// Add comment 
Videorouter.post("/comment", checkLogin, addComment);

// Reply comment 
Videorouter.post("/addreply", checkLogin, addReply);

// vote for video
Videorouter.post("/upvote", checkLogin, upvoteVideo);


export default Videorouter;

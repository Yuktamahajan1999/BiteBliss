import express from 'express';
import { uploadMedia } from '../Middlewares/UploadMiddleware.js'; 
import checkLogin from '../Middlewares/CheckLogin.js';
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from '../Controllers/UserProfileController.js';

const Profilerouter = express.Router();

// Create Profile
Profilerouter.post('/', checkLogin, uploadMedia.single('profileImage'), createUserProfile);

// Get user Profile
Profilerouter.get('/getUserProfile', checkLogin, getUserProfile);

// Update Profile
Profilerouter.put('/updateProfile', checkLogin, uploadMedia.single('profileImage'), updateUserProfile);

// Delete Profile
Profilerouter.delete('/deleteProfile', checkLogin, deleteUserProfile);



export default Profilerouter;

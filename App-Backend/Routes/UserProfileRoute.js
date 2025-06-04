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

Profilerouter.post('/', checkLogin, uploadMedia.single('profileImage'), createUserProfile);

Profilerouter.get('/getUserProfile', checkLogin, getUserProfile);

Profilerouter.put('/updateProfile', checkLogin, uploadMedia.single('profileImage'), updateUserProfile);

Profilerouter.delete('/deleteProfile', checkLogin, deleteUserProfile);

export default Profilerouter;

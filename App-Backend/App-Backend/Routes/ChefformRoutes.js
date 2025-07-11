import express from 'express';
import {
  createChefProfile,
  getChefProfiles,
  updateChefProfile,
  deleteChefProfile,
  getmychefprofile
} from '../Controllers/ChefProfileController.js';
import checkLogin from '../Middlewares/CheckLogin.js';
import checkRole from '../Middlewares/CheckRole.js';

const chefFormrouter = express.Router();

// Create new profile
chefFormrouter.post('/', checkLogin, checkRole(['chef']), createChefProfile);

// Get all profiles
chefFormrouter.get('/getChefProfile', checkLogin, checkRole(['chef']), getChefProfiles);

// Get single profile
chefFormrouter.get('/getmyProfile', checkLogin, checkRole(['chef']), getmychefprofile);

// Update profile 
chefFormrouter.put('/updateChefprofile', checkLogin, checkRole(['chef']), updateChefProfile);

// Delete profile 
chefFormrouter.delete('/deleteChefprofile', checkLogin, checkRole(['chef']), deleteChefProfile);



export default chefFormrouter;

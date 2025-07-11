import express from 'express';
import {
  createRecommendation,
  getRecommendations,
  getRecommendationById,
  updateRecommendation,
  deleteRecommendation,
  getFriendRecommendations
} from '../Controllers/RecommendationController.js';
import checkLogin from '../Middlewares/CheckLogin.js';

const Recommendrouter = express.Router();

// Create a new recommendation
Recommendrouter.post('/create', checkLogin, createRecommendation);

// Get all recommendations
Recommendrouter.get('/', getRecommendations);

// Get a specific recommendation by ID
Recommendrouter.get('/recommendById', getRecommendationById);

// Update an existing recommendation
Recommendrouter.put('/updateRecommend', checkLogin, updateRecommendation);

// Delete a recommendation
Recommendrouter.delete('/deleteRecommend', checkLogin, deleteRecommendation);

// Get friend recommendations
Recommendrouter.get('/friends', getFriendRecommendations);

export default Recommendrouter;
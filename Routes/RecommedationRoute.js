import express from 'express';
import {
  createRecommendation,
  getRecommendations,
  getRecommendationById,
  updateRecommendation,
  deleteRecommendation,
  getFrequentOrders
} from '../Controllers/RecommendationController.js';
import checkLogin from '../Middlewares/CheckLogin.js';

const Recommendrouter = express.Router();

// Create a new recommendation
Recommendrouter.post('/create', checkLogin, createRecommendation);

// Get all recommendations of logged-in user
Recommendrouter.get('/', checkLogin, getRecommendations);

// Get a specific recommendation by ID
Recommendrouter.get('/recommendById', checkLogin, getRecommendationById);

// Update an existing recommendation
Recommendrouter.put('/updateRecommend', checkLogin, updateRecommendation);

// Delete a recommendation
Recommendrouter.delete('/deleteRecommend', checkLogin, deleteRecommendation);

//Frequent Orders Restaurant
Recommendrouter.get('/frequent', checkLogin, getFrequentOrders);

export default Recommendrouter;

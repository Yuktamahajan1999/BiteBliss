import express from 'express';
import { createFeedback, getAllFeedback, updateFeedback, deleteFeedback, getFeedbackById } from '../Controllers/FeedbackPageController.js';
import checkLogin from '../Middlewares/CheckLogin.js';
const feedbackpagerouter = express.Router();

// Create feedback
feedbackpagerouter.post('/',checkLogin, createFeedback);

// Get all feedback
feedbackpagerouter.get('/getallFeedback',checkLogin, getAllFeedback);

// Update feedback 
feedbackpagerouter.put('/UpdateFeed',checkLogin, updateFeedback);

// Delete feedback 
feedbackpagerouter.delete('/deleteFeed',checkLogin, deleteFeedback);

// Get feedback by ID
feedbackpagerouter.get('/getFeedbackById', checkLogin, getFeedbackById); 

export default feedbackpagerouter;

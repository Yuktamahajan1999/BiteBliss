import express from 'express';
import {
  createFeedback,
  getAllFeedback,
  getFeedbackByUser,
  getFeedbackByRestaurant,
  updateFeedbackStatus,
  respondToFeedback,
  deleteFeedback
} from '../Controllers/FeedbackController.js';

export function validateQueryParam(paramName) {
  return (req, res, next) => {
    if (!req.query[paramName]) {
      return res.status(400).json({ success: false, message: `Missing required parameter: ${paramName}` });
    }
    next();
  };
}


const feedbackrouter = express.Router();

feedbackrouter.post('/', createFeedback);
feedbackrouter.get('/getallfeedback', getAllFeedback);
feedbackrouter.get('/by-user', validateQueryParam('userId'), getFeedbackByUser);
feedbackrouter.get('/by-restaurant', validateQueryParam('restaurantId'), getFeedbackByRestaurant);
feedbackrouter.put('/update-status', updateFeedbackStatus);
feedbackrouter.put('/respond', respondToFeedback);
feedbackrouter.delete('/delete', validateQueryParam('feedbackId'), deleteFeedback);

export default feedbackrouter;
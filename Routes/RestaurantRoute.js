import express from 'express';
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  addReview,
  addMenuItem,
  updateRestaurantStatus,
  updateOrderStatus,
  updateBookingStatus,
  getTopRestaurants,
  assignDeliveryPartner
} from '../Controllers/RestaurantController.js';

import checkLogin from '../Middlewares/CheckLogin.js';
import checkRole from '../Middlewares/CheckRole.js';
import { validationResult } from 'express-validator';
import { restaurantCreateValidation, restaurantUpdateValidation } from '../Middlewares/Validation.js';
import { uploadMedia } from '../Middlewares/UploadMiddleware.js';

const restaurantRouter = express.Router();

// Middleware to handle validation errors
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// Create a restaurant
restaurantRouter.post(
  '/',
  checkLogin,
  checkRole(['restaurantowner']),
  uploadMedia.fields([
    { name: 'image', maxCount: 1 },
    { name: 'photos', maxCount: 10 }
  ]),
  restaurantCreateValidation,
  validateRequest,
  createRestaurant
);

// Get all restaurants
restaurantRouter.get('/getAllrestaurant', getAllRestaurants);

// Get a restaurant by ID
restaurantRouter.get('/getRestaurantById', getRestaurantById);

// Update restaurant
restaurantRouter.put(
  '/updaterestaurant',
  checkLogin,
  checkRole(['restaurantowner']),
  uploadMedia.fields([
    { name: 'image', maxCount: 1 },
    { name: 'photos', maxCount: 10 }
  ]),
  restaurantUpdateValidation,
  validateRequest,
  updateRestaurant
);

// Delete a restaurant
restaurantRouter.delete(
  '/deleterestaurant',
  checkLogin,
  checkRole(['restaurantowner']),
  deleteRestaurant
);

// Add review
restaurantRouter.post(
  '/addreview',
  checkLogin,
  checkRole(['user']),
  addReview
);

// Add menu item
restaurantRouter.post(
  '/addmenuitem',
  checkLogin,
  checkRole(['restaurantowner']),
  addMenuItem
);

// Update restaurant status (admin only)
restaurantRouter.put(
  '/updateRestaurantStatus',
  checkLogin,
  checkRole(['admin']),
  updateRestaurantStatus
);

// Update order status (restaurant owner)
restaurantRouter.put(
  '/updateOrderStatus',
  checkLogin,
  checkRole(['restaurantowner']),
  (req, res) => {
    const io = req.app.get("io");
    req.io = io;                  
    updateOrderStatus(req, res, io);
  }
);

// Update booking status (restaurant owner)
restaurantRouter.put(
  '/updateBookingStatus',
  checkLogin,
  checkRole(['restaurantowner']),
  updateBookingStatus
);

// Get Top Restaurants
restaurantRouter.get('/toprestaurants', getTopRestaurants);


// Assign delivery Partner 
restaurantRouter.put('/assignpartner', assignDeliveryPartner)

export default restaurantRouter;

import express from 'express';
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant
} from '../Controllers/RestaurantController.js';

import checkLogin from '../Middlewares/CheckLogin.js';
import checkRole from '../Middlewares/CheckRole.js';
import { validationResult } from 'express-validator';  
import { restaurantCreateValidation, restaurantUpdateValidation } from '../Middlewares/Validation.js';

const restaurantRouter = express.Router();

// Middleware to handle validation errors after running validation rules
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
  restaurantCreateValidation,
  validateRequest,
  createRestaurant
);

// Get all restaurants
restaurantRouter.get('/getAllrestaurant', getAllRestaurants);

// Get a restaurant 
restaurantRouter.get('/getRestaurantById', getRestaurantById);

// Update restaurant 
restaurantRouter.put(
  '/updaterestaurant',
  checkLogin,
  checkRole(['restaurantowner']),
  restaurantUpdateValidation,
  validateRequest,
  updateRestaurant
);

// Delete a Restaurant
restaurantRouter.delete(
  '/deleterestaurant',
  checkLogin,
  checkRole(['restaurantowner']),
  deleteRestaurant
);

export default restaurantRouter;

import express from "express";
import checkLogin from "../Middlewares/CheckLogin.js";
import checkRole from "../Middlewares/CheckRole.js";
import { validationResult } from 'express-validator';
import {
  bookCatering,
  getAllBookings,
  getAvailableChefs,
  updateChefStatus,
  addChefRating,
  updateUserBooking,
  acceptBooking,
  cancelBooking,
  completeBooking,
} from "../Controllers/CorporateCateringController.js";

import { cateringBookingValidation } from "../Middlewares/Validation.js"; 

const ChefRouter = express.Router();

// Middleware to handle validation errors
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Book a catering service 
ChefRouter.post(
  "/book",
  checkLogin,
  checkRole(["user"]),
  cateringBookingValidation,
  validateRequest,          
  bookCatering
);

// Get all bookings
ChefRouter.get("/allbookings", checkLogin, checkRole(["chef", "user"]), getAllBookings);

// Get list of available chefs
ChefRouter.get("/availablechef", getAvailableChefs);

// Update chef availability
ChefRouter.put("/statusupdate", checkLogin, checkRole(["chef"]), updateChefStatus);

// Add a rating for a chef
ChefRouter.post("/ratingchef", checkLogin, checkRole(["user"]), addChefRating);

// Update Booking
ChefRouter.put(
  "/updatebooking",
  checkLogin,
  checkRole(["user"]),
  validateRequest,
  updateUserBooking
);

// Accept Booking
ChefRouter.put('/acceptbooking', checkLogin, checkRole(['user']), acceptBooking);

// Cancel Booking
ChefRouter.put('/cancelbooking', checkLogin, checkRole(['user']), cancelBooking);

// Complete Chef Booking
ChefRouter.put('/completechefbooking', checkLogin, checkRole(['user']), completeBooking);

export default ChefRouter;

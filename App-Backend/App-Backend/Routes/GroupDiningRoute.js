import express from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingByEmail,
  updateBooking,
  deleteBooking
} from '../Controllers/GroupDiningController.js';
import { bookingValidation } from '../Middlewares/Validation.js';
import checkRole from '../Middlewares/CheckRole.js';
import checkLogin from '../Middlewares/CheckLogin.js';
import handleValidationErrors from '../Middlewares/ErrorValidation.js';

const GroupDiningrouter = express.Router();

// Create a group dining booking
GroupDiningrouter.post(
  '/',
  checkLogin,
  checkRole(['user', 'restaurantowner']),
  bookingValidation,
  handleValidationErrors,
  createBooking
);

// Get all group dining bookings
GroupDiningrouter.get(
  '/allbookings',
  checkLogin,
  checkRole(['Restaurant']),
  getAllBookings
);

// Get all group dining bookings - only restaurant owners can see all bookings
GroupDiningrouter.get(
  '/allbookings',
  checkLogin,
  checkRole(['restaurantowner']),
  getAllBookings
);

// Update a group dining booking 
GroupDiningrouter.put(
  '/updatebooking',
  checkLogin,
  checkRole(['restaurantowner']),
  updateBooking
);

// Delete a group dining booking 
GroupDiningrouter.delete(
  '/deletebooking',
  checkLogin,
  checkRole(['restaurantowner']),
  deleteBooking
);

export default GroupDiningrouter;
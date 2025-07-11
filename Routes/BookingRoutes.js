import express from 'express';
import {
  createTableBooking,
  getAllTableBookings,
  updateTableBooking,
  deleteTableBooking,
  addExperience,
  getBookingsByUser,
  getBookingsByRestaurant,
  getExperienceByBooking
} from '../Controllers/TableBookingController.js';
import checkLogin from '../Middlewares/CheckLogin.js';
import { bookingValidation } from '../Middlewares/Validation.js';
import { uploadMedia } from '../Middlewares/UploadMiddleware.js';
import handleValidationErrors from '../Middlewares/ErrorValidation.js';
import checkRole from '../Middlewares/CheckRole.js';

const Bookingrouter = express.Router();

// Create a table booking
Bookingrouter.post('/', checkLogin, bookingValidation, handleValidationErrors, createTableBooking);

// Get all table bookings
Bookingrouter.get('/getAllBookings', checkLogin, getAllTableBookings);

// Get Booking By user
Bookingrouter.get('/getBookingsByUser', checkLogin,checkRole(['user']), getBookingsByUser);

// Update a table booking
Bookingrouter.put('/updateBooking', checkLogin,checkRole('restaurantowner'), updateTableBooking);

// Delete a table booking
Bookingrouter.delete('/deletebooking', checkLogin,checkRole(['user']), deleteTableBooking);

// Booking by Restauarant
Bookingrouter.get('/getBookingsByRestaurant', checkLogin, checkRole('restaurantowner'), getBookingsByRestaurant);

// Add an experience with media uploads
Bookingrouter.post('/experience', checkLogin, uploadMedia.array('media', 5), addExperience);

// Get experiences by bookingId
Bookingrouter.get('/getExperience', checkLogin, getExperienceByBooking);



export default Bookingrouter;
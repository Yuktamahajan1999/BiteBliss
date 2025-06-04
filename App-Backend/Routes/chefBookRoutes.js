import express from 'express';
import {
  createChefBooking,
  updateChefBooking,
  deleteChefBooking,
  getAllChefBookings,
  getBookingsByChef,
  acceptChefBooking,
  completeChefBooking,
  cancelChefBooking,
  chefArrived
} from '../Controllers/ChefBookingController.js';
import checkLogin from '../Middlewares/CheckLogin.js';
import checkRole from '../Middlewares/CheckRole.js';

const ChefBookrouter = express.Router();

// Create a booking
ChefBookrouter.post('/', checkLogin, checkRole(['chef']), createChefBooking);

// Get all bookings
ChefBookrouter.get('/getChefBookingsAll', checkLogin,checkRole(['chef']), getAllChefBookings);

// Get bookings 
ChefBookrouter.get('/getBookingbyChef', checkLogin, checkRole(['chef']), getBookingsByChef);

// Update booking 
ChefBookrouter.put('/UpdateBooking', checkLogin, checkRole(['chef']), updateChefBooking);

// Delete booking 
ChefBookrouter.delete('/deleteBooking', checkLogin, checkRole(['chef']), deleteChefBooking);

// Accept Booking
ChefBookrouter.put('/acceptbooking', checkLogin, checkRole(['chef']), acceptChefBooking);

// Cancel Booking
ChefBookrouter.put('/cancelbooking', checkLogin, checkRole(['chef']), cancelChefBooking);

// Complete Chef Booking
ChefBookrouter.put('/completechefbooking', checkLogin, checkRole(['chef']), completeChefBooking);

// Chef Arrived
ChefBookrouter.put('/arrived', checkLogin, checkRole(['chef']), chefArrived);


export default ChefBookrouter;

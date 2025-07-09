import express from 'express';
import { donationValidation } from '../Middlewares/Validation.js';
import handleValidationErrors from '../Middlewares/ErrorValidation.js';
import checkLogin from '../Middlewares/CheckLogin.js';
import {
  createDonation,
  getAllDonations,
  getDonationsByUser,
  updateDonation,
} from '../Controllers/DonationController.js';

const donationRouter = express.Router();

// Create a new donation
donationRouter.post('/', checkLogin, donationValidation, handleValidationErrors, createDonation);

// Get all donations
donationRouter.get('/getAllDonations', checkLogin, getAllDonations);

// Get donations by user
donationRouter.get('/donationbyuser', checkLogin, getDonationsByUser);

// Update donation status
donationRouter.put('/donationstatus', checkLogin, handleValidationErrors, updateDonation);

export default donationRouter;

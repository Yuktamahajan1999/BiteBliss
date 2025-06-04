import express from 'express'; 

import {  
  createPayment,  
  getPayments,  
  getPaymentById,  
  updatePaymentStatus,
  updateDonationStatus, 
} from '../Controllers/PaymentController.js';

import CheckLogin from "../Middlewares/CheckLogin.js"; 
import CheckRole from "../Middlewares/CheckRole.js"; 

const Paymentrouter = express.Router(); 

// Create a new payment
Paymentrouter.post('/', CheckLogin, CheckRole(["user"]), createPayment); 

// get all payments 
Paymentrouter.get('/getAllPayments', CheckLogin, getPayments); 

// get payment details by ID 
Paymentrouter.get('/detailByid', CheckLogin, CheckRole(["user", "restaurantowner"]), getPaymentById); 

// update payment status 
Paymentrouter.put('/statusUpdate', CheckLogin, CheckRole(["restaurantowner"]), updatePaymentStatus); 

// update Donation status 
Paymentrouter.put('/statusUpdate', CheckLogin, updateDonationStatus); 
export default Paymentrouter; 
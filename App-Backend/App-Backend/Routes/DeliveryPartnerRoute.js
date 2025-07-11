import express from 'express';
import {
  getAllDeliveryPartners,
  getDeliveryPartnerById,
  createDeliveryPartner,
  updateDeliveryPartner,
  deleteDeliveryPartner
} from '../Controllers/DeliveryPartnerController.js';

import { deliveryPartnerValidation } from '../Middlewares/Validation.js';
import checkLogin from '../Middlewares/CheckLogin.js';
import handleValidationErrors from '../Middlewares/ErrorValidation.js';

export function validateIdQuery(req, res, next) {
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Delivery partner ID is required",
    });
  }
  next();
}

const deliveryrouter = express.Router();

// Get all delivery partners
deliveryrouter.get('/getAllpartners', checkLogin, getAllDeliveryPartners);

// Get a specific delivery partner 
deliveryrouter.get('/getdeliveryPartner', checkLogin, validateIdQuery, getDeliveryPartnerById);

// Create a new delivery partner
deliveryrouter.post('/', checkLogin, deliveryPartnerValidation, handleValidationErrors, createDeliveryPartner);

// Update a delivery partner
deliveryrouter.put('/updatePartner', checkLogin, validateIdQuery, deliveryPartnerValidation, handleValidationErrors, updateDeliveryPartner);

// Delete a delivery partner
deliveryrouter.delete('/deletepartner', checkLogin, validateIdQuery, deleteDeliveryPartner);

export default deliveryrouter;
import express from 'express';
import {
  getAllDeliveryPartners,
  getDeliveryPartnerById,
  updateDeliveryPartner,
  deleteDeliveryPartner,
  getPartnerOrders,
  acceptOrder,
  markOrderDelivered,
  createPartnerFromApplication,
  getAvailableOrders,
  rejectOrder,
  markOrderArrived,
  getRealDeliveryPartners,
  rateDeliveryPartner,
  markOrderPickedUp
} from '../Controllers/DeliveryPartnerController.js';

import { deliveryPartnerValidation } from '../Middlewares/Validation.js';
import checkLogin from '../Middlewares/CheckLogin.js';
import handleValidationErrors from '../Middlewares/ErrorValidation.js';
import checkRole from '../Middlewares/CheckRole.js';

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
deliveryrouter.get('/getdeliveryPartner', checkLogin, getDeliveryPartnerById);

// Update a delivery partner
deliveryrouter.put('/updatePartner', checkLogin, validateIdQuery, deliveryPartnerValidation, handleValidationErrors, updateDeliveryPartner);

// Delete a delivery partner
deliveryrouter.delete('/deletepartner', checkLogin, checkRole(['deliverypartner']), validateIdQuery, deleteDeliveryPartner);

// Get orders assigned to delivery partner
deliveryrouter.get('/deliveryorder', checkLogin, checkRole(['deliverypartner']), getPartnerOrders);

// Accept order
deliveryrouter.put('/acceptorder', checkLogin, checkRole(['deliverypartner']), acceptOrder);

// Reject order
deliveryrouter.put('/rejectorder', checkLogin, checkRole(['deliverypartner']), rejectOrder);

// Mark as arrived at delivery location
deliveryrouter.put('/arrivedorder', checkLogin, checkRole(['deliverypartner']), markOrderArrived);

// Mark order as delivered
deliveryrouter.put('/deliverorder', checkLogin, checkRole(['deliverypartner']), markOrderDelivered);

// Create delivery partner from application
deliveryrouter.post('/createformapplication', checkLogin, checkRole(['deliverypartner']), createPartnerFromApplication);

// Get available (unassigned) orders
deliveryrouter.get('/availableorders', checkLogin, checkRole(['deliverypartner']), getAvailableOrders);

//get real partners
deliveryrouter.get('/deliveryboy', getRealDeliveryPartners);

//rate partner 
deliveryrouter.post('/rate', checkLogin, rateDeliveryPartner)

//order picked up
deliveryrouter.put('/pickuporder', checkLogin, checkRole(['deliverypartner']), markOrderPickedUp);  

export default deliveryrouter;
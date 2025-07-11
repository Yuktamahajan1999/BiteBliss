import express from 'express';
import {
  createPartnerApplication,
  getAllPartnerApplications,
  updatePartnerApplication,
  deletepartnerApplication,
  getSingleApplication,
  getApprovedApplication,
  updatePartnerAppDetails,
} from '../Controllers/PartnerController.js';

import checkLogin from '../Middlewares/CheckLogin.js';
import checkRole from '../Middlewares/CheckRole.js';

const partnerAppRouter = express.Router();


// Create a new application
partnerAppRouter.post(
  '/',
  checkLogin,
  checkRole(['restaurantowner']),
  createPartnerApplication
);

// Get all applications
partnerAppRouter.get(
  '/getpartnerapp',
  checkLogin,
  checkRole(['admin','restaurantowner']),
  getAllPartnerApplications
);

// Get single application
partnerAppRouter.get(
  '/singleapp',
  checkLogin,
  checkRole(['admin', 'restaurantowner']),
  getSingleApplication
);

// Update application status 
partnerAppRouter.put(
  '/updatepartnerApp',
  checkLogin,
  checkRole(['admin']),
  updatePartnerApplication
);

// Delete application 
partnerAppRouter.delete(
  '/deletepartnerApp',
  checkLogin,
  checkRole(['admin']),
  deletepartnerApplication
);

// Approved Application
partnerAppRouter.get('/getApproveApp',checkLogin,checkRole(['restaurantowner']),getApprovedApplication)

// Update application
partnerAppRouter.put(
  '/updatepartnerappdetails',
  checkLogin,
  checkRole(['restaurantowner']),
  updatePartnerAppDetails
);

export default partnerAppRouter;

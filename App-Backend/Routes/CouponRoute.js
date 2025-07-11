import express from 'express';
import {
  getCoupons,
  applyCoupon,
  removeCoupon,
  getAllCoupons
} from '../Controllers/CouponController.js'; 

import checkLogin from '../Middlewares/CheckLogin.js';
import checkRole from '../Middlewares/CheckRole.js';

const couponRouter = express.Router();


// Get All coupons
couponRouter.get('/allCoupons', getAllCoupons);

// Get all applied coupons for a user 
couponRouter.get('/getCoupons', checkLogin, getCoupons);

// Apply a new coupon
couponRouter.post('/applyCoupon', checkLogin, checkRole(['user']), applyCoupon);

// Remove a coupon 
couponRouter.delete('/removeCoupon', checkLogin, checkRole(['user']), removeCoupon);

export default couponRouter;

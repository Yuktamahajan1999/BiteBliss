import express from 'express';
import {
  createGroupOrder,
  getGroupOrders,
  getGroupOrderById,
  joinGroupOrder,
  addItemToGroupOrder,
  setPaymentBy,
  updateGroupOrderStatus,
  checkoutGroupOrder,
  getActiveGroupOrdersByRestaurant
} from '../Controllers/GroupOrderController.js';
import checkLogin from '../Middlewares/CheckLogin.js';

const groupRouter = express.Router();

groupRouter.post('/create', checkLogin, createGroupOrder);
groupRouter.get('/mygrouporders', checkLogin, getGroupOrders);
groupRouter.get('/singleorderbyid', checkLogin, getGroupOrderById);
groupRouter.post('/join', checkLogin, joinGroupOrder);
groupRouter.post('/additem', checkLogin, addItemToGroupOrder);
groupRouter.post('/setpayment', checkLogin, setPaymentBy);
groupRouter.post('/update-status', checkLogin, updateGroupOrderStatus);
groupRouter.post('/checkout', checkLogin, checkoutGroupOrder);
groupRouter.get('/active-by-restaurant', checkLogin, getActiveGroupOrdersByRestaurant);

export default groupRouter;
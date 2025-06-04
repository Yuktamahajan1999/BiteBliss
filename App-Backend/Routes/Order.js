import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
} from "../Controllers/OrderController.js";
import checkRole from "../Middlewares/CheckRole.js";
import checkLogin from "../Middlewares/CheckLogin.js";

const OrderRouter = express.Router();

// Create a new order 
OrderRouter.post('/', checkLogin, checkRole(["user"]), createOrder);

// Get order details
OrderRouter.get('/OrderById', checkLogin, checkRole(["user", "restaurantowner"]), getOrderById);

// Update order status 
OrderRouter.put('/updateOrder', checkLogin, checkRole(["restaurantowner"]), updateOrderStatus);

// Delete an order 
OrderRouter.delete('/deleteOrder', checkLogin, checkRole(["user"]), deleteOrder);

// Get all orders 
OrderRouter.get('/getOrders', checkLogin, checkRole(["restaurantowner"]), getAllOrders);

export default OrderRouter;
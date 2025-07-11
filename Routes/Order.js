import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrdersByRestaurant
} from "../Controllers/OrderController.js";
import checkRole from "../Middlewares/CheckRole.js";
import checkLogin from "../Middlewares/CheckLogin.js";

const OrderRouter = express.Router();

// Create a new order 
OrderRouter.post('/', checkLogin, checkRole(["user"]), createOrder);

// Get order details
OrderRouter.get('/getOrderById', checkLogin, checkRole(["user", "restaurantowner", "deliverypartner"]), getOrderById);

// Update order status 
OrderRouter.put('/updateOrder', checkLogin, checkRole(["restaurantowner"]), updateOrderStatus);

// Delete an order 
OrderRouter.delete('/deleteOrder', checkLogin, checkRole(["user"]), deleteOrder);

// Get all orders 
OrderRouter.get('/getOrders', checkLogin, checkRole(["restaurantowner"]), getAllOrders);

// Get orders by restaurant ID
OrderRouter.get('/getByRestaurant', checkLogin, checkRole(["restaurantowner"]), getOrdersByRestaurant);

export default OrderRouter;

import express from "express";
import {
  createOrderOnTrain,
  getOrdersByUser,
  getOrdersByTrainNumber,
  updateOrderStatus,
  deleteTrainOrder,
  getTrainOrdersByRestaurant,
  assignTrainDeliveryPartner,
} from "../Controllers/OrderOnTrainController.js";
import CheckLogin from "../Middlewares/CheckLogin.js";
import CheckRole from "../Middlewares/CheckRole.js";

const TrainOrderrouter = express.Router();

// Create a new train order
TrainOrderrouter.post("/", CheckLogin, CheckRole(["user"]), createOrderOnTrain);

// Get orders placed by a specific user
TrainOrderrouter.get("/userOrders", CheckLogin, CheckRole(["user"]), getOrdersByUser);

// Get train orders using train number
TrainOrderrouter.get("/trainnumber", CheckLogin, CheckRole(["restaurantowner"]), getOrdersByTrainNumber);

// Get train orders for a specific restaurant
TrainOrderrouter.get("/getByRestaurant", CheckLogin, CheckRole(["restaurantowner"]), getTrainOrdersByRestaurant);

// Update the status of a train order
TrainOrderrouter.put("/statusupdate", CheckLogin, CheckRole(["restaurantowner"]), updateOrderStatus);

// Delete a train order
TrainOrderrouter.delete("/deleteorder", CheckLogin, CheckRole(["user"]), deleteTrainOrder);

// Assign delivery partner to a train order
TrainOrderrouter.put("/assignorderpartner", CheckLogin, CheckRole(["restaurantowner"]), assignTrainDeliveryPartner);

export default TrainOrderrouter;

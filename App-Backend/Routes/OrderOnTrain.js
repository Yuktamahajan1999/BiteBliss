import express from "express";
import {
    createOrderOnTrain,
    getOrdersByUser,
    getOrdersByTrainNumber,
    updateOrderStatus,
    deleteTrainOrder
} from "../Controllers/OrderOnTrainController.js";
import CheckLogin from "../Middlewares/CheckLogin.js";
import CheckRole from "../Middlewares/CheckRole.js";

const TrainOrderrouter = express.Router();

// Create a train order 
TrainOrderrouter.post("/", CheckLogin, CheckRole(["user"]), createOrderOnTrain);

// Get train orders by user 
TrainOrderrouter.get("/userOrders", CheckLogin, CheckRole(["user"]), getOrdersByUser);

// Get train orders by train number
TrainOrderrouter.get("/trainnumber", CheckLogin, CheckRole(["restaurantowner"]), getOrdersByTrainNumber);

// Update train order status 
TrainOrderrouter.put("/statusupdate", CheckLogin, CheckRole(["restaurantowner"]), updateOrderStatus);

// Delete a train order 
TrainOrderrouter.delete("/deleteorder", CheckLogin, CheckRole(["user"]), deleteTrainOrder);

export default TrainOrderrouter;
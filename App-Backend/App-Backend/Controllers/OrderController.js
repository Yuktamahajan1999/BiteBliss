import Order from "../Models/Order.js";
import { v4 as uuidv4 } from "uuid";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { restaurantName, restaurantLocation, items, paymentMethod, totalAmount } = req.body;
    const userId = req.userId;

    if (!userId || !restaurantName || !paymentMethod || !totalAmount || !items || items.length === 0) {
      return res.status(400).json({ error: "All fields are required and items must be provided" });
    }

    const orderId = uuidv4();

    const order = new Order({
      orderId,
      userId,
      restaurantName,
      restaurantLocation,
      items,
      paymentMethod,
      totalAmount,
      status: "Preparing",
      paymentStatus: "Pending",
    });

    await order.save();

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all orders 
export const getAllOrders = async (req, res) => {
  try {
    let orders;
    if (req.userRole === "restaurant") {
      orders = await Order.find({ restaurantName: req.userName });
    } else {
      orders = await Order.find();
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("GET ALL ORDERS - Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get order by ID 
export const getOrderById = async (req, res) => {
  try {
    const orderId = req.query.id;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required in query" });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (req.userRole === "user" && order.userId !== req.userId) {
      return res.status(403).json({ error: "Access denied: not your order" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const orderId = req.query.id;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required in query" });
    }

    const validStatuses = ["Preparing", "Out for delivery", "Delivered"];
    const validPayments = ["Pending", "Successful"];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    if (paymentStatus && !validPayments.includes(paymentStatus)) {
      return res.status(400).json({ error: "Invalid payment status" });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    const order = await Order.findOneAndUpdate({ orderId }, updateFields, { new: true });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ message: "Order updated", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an order 
export const deleteOrder = async (req, res) => {
  try {
    const orderId = req.query.id;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required in query" });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (req.userRole !== "user" || order.userId !== req.userId) {
      return res.status(403).json({ error: "Access denied: not your order" });
    }

    await Order.deleteOne({ orderId });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

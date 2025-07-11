import Order from "../Models/Order.js";
import OrderOnTrain from "../Models/OrderTrain.js";
import DeliveryPartner from "../Models/DeliveryPartner.js";
import Restaurant from "../Models/Restaurant.js";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

const STATUS_MAPPING = {
  'pending': 'Pending',
  'restaurant_accepted': 'Preparing',
  'preparing': 'Preparing',
  'ready_for_pickup': 'Ready',
  'out_for_delivery': 'Out for delivery',
  'delivered': 'Delivered',
  'cancelled': 'Cancelled'
};

// Create a new train order
export const createOrderOnTrain = async (req, res) => {
  try {
    const {
      userId,
      restaurantId,
      pnrNumber,
      trainNumber,
      stationName,
      mealType,
      specialRequest,
      items,
      totalAmount,
      addressId,
      gst,
      deliveryFee,
      payment
    } = req.body;

    const requiredFields = [
      userId, restaurantId, pnrNumber, 
      trainNumber, stationName, mealType,
      items, totalAmount, addressId
    ];
    
    if (requiredFields.some(field => !field)) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const orderId = uuidv4();
      const restaurant = await Restaurant.findById(restaurantId).session(session);
      
      const mainOrder = new Order({
        orderId,
        userId,
        restaurantId,
        restaurantName: restaurant.name,
        restaurantLocation: restaurant.location,
        items,
        payment,
        totalAmount,
        address: addressId,
        gst,
        deliveryFee,
        isTrainOrder: true,
        status: "pending"
      });

      await mainOrder.save({ session });

      const orderNumber = `TRN-${Date.now()}`;
      const trainOrder = new OrderOnTrain({
        orderNumber,
        orderId: mainOrder._id,
        userId,
        restaurantId,
        pnrNumber,
        trainNumber,
        stationName,
        mealType,
        specialRequest,
        status: "Pending"
      });

      await trainOrder.save({ session });

      mainOrder.trainOrderRef = trainOrder._id;
      await mainOrder.save({ session });

      await session.commitTransaction();

      res.status(201).json({ 
        message: "Train order created successfully",
        order: mainOrder,
        trainOrder
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get orders by user ID
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const orders = await OrderOnTrain.find({ userId })
      .populate({
        path: 'orderId',
        select: 'items totalAmount status payment'
      })
      .populate('restaurantId', 'name image');

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get orders by train number
export const getOrdersByTrainNumber = async (req, res) => {
  try {
    const { trainNumber } = req.query;
    if (!trainNumber) return res.status(400).json({ error: "Train number is required" });

    const orders = await OrderOnTrain.find({ trainNumber })
      .populate({
        path: 'orderId',
        select: 'status deliveryPartner'
      })
      .populate('restaurantId', 'name');

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update status of a train order
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.query;
    const { status, cancellationReason } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ error: "Order ID and status are required" });
    }

    const validTransitions = {
      'Pending': ['Preparing', 'Cancelled'],
      'Preparing': ['Ready', 'Cancelled'],
      'Ready': ['Out for delivery', 'Cancelled'],
      'Out for delivery': ['Delivered']
    };

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const trainOrder = await OrderOnTrain.findOne({ orderId }).session(session);
      if (!trainOrder) {
        throw new Error("Train order not found");
      }

      if (!validTransitions[trainOrder.status]?.includes(status)) {
        throw new Error(`Invalid status transition from ${trainOrder.status} to ${status}`);
      }

      if (status === 'Cancelled' && !cancellationReason) {
        throw new Error("Cancellation reason is required");
      }

      trainOrder.status = status;
      if (status === 'Cancelled') trainOrder.cancellationReason = cancellationReason;
      await trainOrder.save({ session });

      const mainOrderStatus = Object.keys(STATUS_MAPPING).find(
        key => STATUS_MAPPING[key] === status
      );

      const updateData = {
        status: mainOrderStatus || 'pending'
      };

      if (status === 'Cancelled') {
        updateData.rejectedByOwners = true;
        updateData.rejectionReason = cancellationReason;
      }

      await Order.findByIdAndUpdate(
        orderId,
        updateData,
        { new: true, session }
      );

      await session.commitTransaction();

      res.status(200).json({
        message: "Order status updated successfully",
        order: trainOrder
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a train order and its main order
export const deleteTrainOrder = async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId) return res.status(400).json({ error: "Order ID is required" });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const deletedTrainOrder = await OrderOnTrain.findOneAndDelete({ orderId }).session(session);
      if (!deletedTrainOrder) {
        throw new Error("Train order not found");
      }

      await Order.findByIdAndDelete(orderId).session(session);

      await session.commitTransaction();

      res.status(200).json({ 
        message: "Order deleted successfully",
        order: deletedTrainOrder
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get train orders for a restaurant
export const getTrainOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurantId, status } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }

    const query = { restaurantId };
    if (status) query.status = status;

    const orders = await OrderOnTrain.find(query)
      .populate({
        path: 'orderId',
        select: 'items totalAmount status'
      })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assign delivery partner to a ready train order
export const assignTrainDeliveryPartner = async (req, res) => {
  try {
    const { orderId } = req.query;
    const { deliveryPartnerId } = req.body;

    if (!orderId || !deliveryPartnerId) {
      return res.status(400).json({ 
        error: "Order ID and delivery partner ID are required" 
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const trainOrder = await OrderOnTrain.findOne({
        orderId,
        status: 'Ready'
      }).session(session);

      if (!trainOrder) {
        throw new Error("Train order not found or not in Ready status");
      }

      const deliveryPartner = await DeliveryPartner.findById(deliveryPartnerId).session(session);
      if (!deliveryPartner) {
        throw new Error("Delivery partner not found");
      }

      trainOrder.deliveryPartner = deliveryPartnerId;
      trainOrder.status = 'Out for delivery';
      await trainOrder.save({ session });

      await Order.findByIdAndUpdate(
        orderId,
        {
          deliveryPartner: deliveryPartnerId,
          status: 'out_for_delivery',
          deliveryStage: 5
        },
        { session }
      );

      deliveryPartner.status = 'busy';
      deliveryPartner.assignedOrderId = orderId;
      await deliveryPartner.save({ session });

      await session.commitTransaction();

      const populatedOrder = await OrderOnTrain.findById(trainOrder._id)
        .populate('deliveryPartner')
        .populate('orderId');

      res.status(200).json({
        message: "Delivery partner assigned successfully",
        order: populatedOrder
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

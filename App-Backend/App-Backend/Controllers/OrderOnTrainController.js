import OrderOnTrain from "../Models/OrderTrain.js";

// Create new Order
export const createOrderOnTrain = async (req, res) => {
  try {
    const { userId, restaurantId, pnrNumber, trainNumber, stationName, mealType, specialRequest, orderId } = req.body;

    if (!userId || !restaurantId || !pnrNumber || !trainNumber || !stationName || !mealType || !orderId) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    const orderNumber = "ORD" + Date.now(); 

    const newOrder = new OrderOnTrain({
      orderNumber,
      orderId,
      userId,
      restaurantId,
      pnrNumber,
      trainNumber,
      stationName,
      mealType,
      specialRequest,
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get orders by user
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const orders = await OrderOnTrain.find({ userId });
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

    const orders = await OrderOnTrain.find({ trainNumber });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ error: "Order ID and status are required" });
    }

    if (!["pending", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedOrder = await OrderOnTrain.findOneAndUpdate(
      { orderId },
      { orderStatus: status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete order by orderId
export const deleteTrainOrder = async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId) return res.status(400).json({ error: "Order ID is required" });

    const deletedOrder = await OrderOnTrain.findOneAndDelete({ orderId });

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

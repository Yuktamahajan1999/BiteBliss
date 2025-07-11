import GroupOrder from '../Models/GroupOrder.js';
import Restaurant from '../Models/Restaurant.js';

export const createGroupOrder = async (req, res) => {
  try {
    const { restaurantId, address } = req.body;
    const hostUser = req.user.id;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const joinCode = Math.floor(1000 + Math.random() * 9000).toString();

    const groupOrder = new GroupOrder({
      hostUser,
      restaurantId,
      joinCode,
      participants: [{
        user: hostUser,
        address,
        items: []
      }],
      address,
      status: 'pending',
      expiresAt: new Date(Date.now() + 20 * 60 * 1000)
    });

    await groupOrder.save();
    res.status(201).json(groupOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating group order" });
  }
};

export const getGroupOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const groupOrders = await GroupOrder.find({
      $or: [
        { hostUser: userId },
        { "participants.user": userId }
      ]
    })
      .populate('hostUser', 'name email')
      .populate('restaurantId', 'name location')
      .populate('participants.user', 'name email')
      .populate('address');
    res.json(groupOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching group orders" });
  }
};

export const getGroupOrderById = async (req, res) => {
  try {
    const { id } = req.query;
    const groupOrder = await GroupOrder.findById(id)
      .populate('hostUser', 'name email')
      .populate('restaurantId', 'name location menu')
      .populate('participants.user', 'name email')
      .populate('address');

    if (!groupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    res.json(groupOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching group order" });
  }
};

export const joinGroupOrder = async (req, res) => {
  try {
    const { code, address } = req.body;
    const userId = req.user.id;

    const groupOrder = await GroupOrder.findOne({
      joinCode: code,
      status: 'pending'
    }).populate('restaurantId', 'name');

    if (!groupOrder) {
      return res.status(404).json({ message: "Invalid or expired group code" });
    }

    if (groupOrder.participants.some(p => p.user.toString() === userId)) {
      return res.status(400).json({ message: "Already joined this group order" });
    }

    if (new Date() > new Date(groupOrder.expiresAt)) {
      groupOrder.status = 'cancelled';
      await groupOrder.save();
      return res.status(400).json({ message: "This group order has expired" });
    }

    groupOrder.participants.push({
      user: userId,
      address,
      items: []
    });

    await groupOrder.save();
    res.json(groupOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error joining group order" });
  }
};

export const addItemToGroupOrder = async (req, res) => {
  try {
    const { groupOrderId, item } = req.body;
    const userId = req.user.id;

    if (!item?.name || !item?.price) {
      return res.status(400).json({ message: "Item name and price are required" });
    }

    const groupOrder = await GroupOrder.findById(groupOrderId);
    if (!groupOrder || groupOrder.status !== 'pending') {
      return res.status(404).json({ message: "Active group order not found" });
    }

    const participant = groupOrder.participants.find(
      p => p.user.toString() === userId
    );

    if (!participant) {
      return res.status(403).json({ message: "Not part of this group order" });
    }

    participant.items.push({
      name: item.name,
      price: parseFloat(item.price),
      quantity: parseInt(item.quantity) || 1
    });

    await groupOrder.save();
    res.json(groupOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding item to group order" });
  }
};

export const setPaymentBy = async (req, res) => {
  try {
    const { groupOrderId, paymentId } = req.body;
    const groupOrder = await GroupOrder.findById(groupOrderId);

    if (!groupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    groupOrder.payment = paymentId;
    await groupOrder.save();
    res.json({ message: "Payment set", groupOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error setting payment" });
  }
};

export const updateGroupOrderStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const { status } = req.body;

    const allowedStatuses = ["pending", "accepted", "preparing", "ready", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const groupOrder = await GroupOrder.findById(id);
    if (!groupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    groupOrder.status = status;
    await groupOrder.save();

    res.json({ message: `Group order status updated to ${status}`, groupOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating group order status" });
  }
};

export const checkoutGroupOrder = async (req, res) => {
  try {
    const { groupOrderId, totalAmount, gst, deliveryFee, isFreeDelivery } = req.body;
    const userId = req.user.id;

    const groupOrder = await GroupOrder.findById(groupOrderId)
      .populate('restaurantId')
      .populate('participants.user', 'name');

    if (!groupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    if (groupOrder.hostUser.toString() !== userId) {
      return res.status(403).json({ message: "Only host can checkout" });
    }

    if (groupOrder.status !== 'pending') {
      return res.status(400).json({ message: "Order is not active" });
    }

    const totalItems = groupOrder.participants.reduce(
      (sum, p) => sum + p.items.length, 0
    );
    if (totalItems === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    groupOrder.status = 'accepted';
    groupOrder.totalAmount = totalAmount;
    groupOrder.gst = gst;
    groupOrder.deliveryFee = deliveryFee;
    groupOrder.isFreeDelivery = isFreeDelivery;
    groupOrder.orderPlacedTime = new Date();

    await groupOrder.save();
    res.json({
      message: "Group order submitted successfully",
      groupOrder
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error during checkout" });
  }
};

export const getActiveGroupOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const activeOrders = await GroupOrder.find({
      restaurantId,
      status: 'pending'
    })
    .populate('hostUser', 'name')
    .populate('participants.user', 'name');

    res.json(activeOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching active group orders" });
  }
};
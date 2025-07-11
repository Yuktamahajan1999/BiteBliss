import mongoose from 'mongoose';
import DeliveryPartner from '../Models/DeliveryPartner.js';
import Application from '../Models/Application.js';
import Order from '../Models/Order.js';

// Get all delivery partners
export const getAllDeliveryPartners = async (req, res) => {
  try {
    const deliveryApplications = await Application.find({
      position: "Delivery Partner",
      status: "accepted"
    }).select("name phone email");

    res.status(200).json({
      success: true,
      message: "Fetched all delivery partners from applications",
      data: deliveryApplications
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching delivery partners",
      error: err.message
    });
  }
};

// Get real delivery partners
export const getRealDeliveryPartners = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find().select("name phone email status");
    res.status(200).json({
      success: true,
      data: partners
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching partners",
      error: err.message
    });
  }
};

// Update delivery partner
export const updateDeliveryPartner = async (req, res) => {
  try {
    const id = req.query.id;
    const data = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid partner ID" });
    }

    const updatedPartner = await DeliveryPartner.findByIdAndUpdate(id, data, { new: true });

    if (!updatedPartner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found to update"
      });
    }

    res.status(200).json({
      success: true,
      message: "Partner updated",
      data: updatedPartner
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating partner",
      error: err.message
    });
  }
};

// Delete delivery partner
export const deleteDeliveryPartner = async (req, res) => {
  try {
    const id = req.query.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid partner ID" });
    }

    const deleted = await DeliveryPartner.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Partner not found to delete"
      });
    }

    res.status(200).json({
      success: true,
      message: "Partner deleted"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting partner",
      error: err.message
    });
  }
};

// Create partner from accepted application
export const createPartnerFromApplication = async (req, res) => {
  try {
    const { applicationId, userId } = req.query;

    if (!mongoose.isValidObjectId(applicationId) || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const application = await Application.findById(applicationId);
    if (!application || application.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Invalid application"
      });
    }

    if (application.user.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: "User mismatch"
      });
    }

    const exists = await DeliveryPartner.findOne({
      $or: [{ user: userId }, { email: application.email }]
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Partner already exists"
      });
    }

    const newPartner = await DeliveryPartner.create({
      name: application.name,
      phone: application.phone,
      email: application.email,
      user: userId,
      status: 'available'
    });

    res.status(201).json({
      success: true,
      data: newPartner
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// Get delivery partner by user ID
export const getDeliveryPartnerById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid partner ID is required"
      });
    }

    const partner = await DeliveryPartner.findById(id)
      .select('name phone email status vehicleId averageRating ratings');

    if (!partner) {
      const application = await Application.findOne({
        user: req.user.id,
        position: "Delivery Partner",
        status: "accepted"
      });

      if (application) {
        partner = await DeliveryPartner.findOne({
          $or: [{ user: application.user }, { email: application.email }]
        });

        if (partner && !partner.user.equals(req.user.id)) {
          partner.user = req.user.id;
          await partner.save();
        }
      }
    }

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found"
      });
    }

    res.status(200).json({
      success: true,
      data: partner
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// Get all orders assigned 
export const getPartnerOrders = async (req, res) => {
  try {
    console.log('📦 getPartnerOrders called');
    console.log('🔐 Authenticated User:', req.user);

    const partner = await DeliveryPartner.findOne({ user: req.user.id });

    if (!partner) {
      console.warn('⚠️ Delivery Partner not found for user:', req.user.id);
      return res.status(404).json({
        success: false,
        message: "Delivery Partner not found"
      });
    }

    console.log('✅ Delivery Partner found:', partner._id);

    const orders = await Order.find({ deliveryPartner: partner._id })
      .populate({
        path: 'userId',
        select: 'name email',
      })
      .populate('restaurantId', 'name')
      .populate('deliveryPartner', 'name phone email status')
      .populate({
        path: 'address',
        select: 'address'
      });

    console.log(`📦 Total Orders Found: ${orders.length}`);

    const processedOrders = orders.map(order => {
      const orderObj = order.toObject();
      return {
        ...orderObj,
        address: order.address || { address: 'Address not specified' },
        userId: order.userId || { name: 'N/A', email: 'N/A' },
        restaurantId: order.restaurantId || { name: 'N/A' }
      };
    });

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: processedOrders
    });
  } catch (error) {
    console.error('❌ Error fetching partner orders:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch partner orders",
      error: error.message
    });
  }
};

// Get available orders
export const getAvailableOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { status: 'ready_for_pickup', deliveryPartner: null },
        { status: 'out_for_delivery', deliveryPartner: null }
      ]
    })
      .populate('restaurantId', 'name location')
      .populate('userId', 'name phone')
      .populate('address', 'address');

    res.status(200).json({
      success: true,
      data: orders.map(order => ({
        ...order.toObject(),
        displayStatus: order.status === 'ready_for_pickup'
          ? 'Ready for pickup'
          : 'Needs delivery'
      }))
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Accept Order
export const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.query;
    const userId = req.user.id;

    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ success: false, message: "Valid order ID is required" });
    }

    const partner = await DeliveryPartner.findOne({ user: userId });
    if (!partner) {
      return res.status(404).json({ success: false, message: "Delivery partner not found" });
    }

    const order = await Order.findOne({
      _id: orderId,
      status: 'ready_for_pickup',
      deliveryPartner: null
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order not available for acceptance"
      });
    }

    order.deliveryPartner = partner._id;
    order.status = 'out_for_delivery';
    order.deliveryStatus = 'assigned';
    order.dispatchedAt = new Date();
    await order.save();

    partner.status = 'assigned';
    partner.assignedOrderId = order._id;
    await partner.save();

    res.status(200).json({
      success: true,
      message: "Order accepted and marked as out for delivery",
      data: order
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to accept order",
      error: err.message
    });
  }
};

// Reject Order 
export const rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.query;
    const userId = req.user.id;

    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ success: false, message: "Valid order ID is required" });
    }

    const partner = await DeliveryPartner.findOne({ user: userId });
    if (!partner) {
      return res.status(404).json({ success: false, message: "Delivery partner not found" });
    }

    const order = await Order.findOne({
      _id: orderId,
      deliveryPartner: partner._id,
      deliveryStatus: 'assigned'
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Cannot reject order that isn't assigned to you"
      });
    }

    order.deliveryPartner = null;
    order.status = 'ready_for_pickup';
    order.deliveryStatus = 'unassigned';
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order rejected successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to reject order",
      error: err.message
    });
  }
};

// Mark as Picked Up 
export const markOrderPickedUp = async (req, res) => {
  try {
    const { orderId } = req.query;
    const userId = req.user.id;

    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ success: false, message: "Valid order ID is required" });
    }

    const partner = await DeliveryPartner.findOne({ user: userId });
    if (!partner) {
      return res.status(404).json({ success: false, message: "Delivery partner not found" });
    }

    const order = await Order.findOne({
      _id: orderId,
      deliveryPartner: partner._id,
      status: 'out_for_delivery',
      deliveryStatus: 'assigned'
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Cannot pick up order - either not assigned to you or not in correct state"
      });
    }

    order.deliveryStatus = 'picked_up';
    order.pickedUpAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order picked up successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to mark as picked up",
      error: err.message
    });
  }
};

// Mark as Arrived
export const markOrderArrived = async (req, res) => {
  try {
    const { orderId } = req.query;
    const userId = req.user.id;

    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ success: false, message: "Valid order ID is required" });
    }

    const partner = await DeliveryPartner.findOne({ user: userId });
    if (!partner) {
      return res.status(404).json({ success: false, message: "Delivery partner not found" });
    }

    const order = await Order.findOne({
      _id: orderId,
      deliveryPartner: partner._id,
      deliveryStatus: 'picked_up'
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Cannot mark as arrived - order not picked up or not assigned to you"
      });
    }

    order.deliveryStatus = 'arrived';
    order.arrivedAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Delivery partner arrived at destination"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to mark as arrived",
      error: err.message
    });
  }
};

// Mark as Delivered 
export const markOrderDelivered = async (req, res) => {
  try {
    const { orderId } = req.query;
    const userId = req.user.id;

    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ success: false, message: "Valid order ID is required" });
    }

    const partner = await DeliveryPartner.findOne({ user: userId });
    if (!partner) {
      return res.status(404).json({ success: false, message: "Delivery partner not found" });
    }

    const order = await Order.findOne({
      _id: orderId,
      deliveryPartner: partner._id,
      deliveryStatus: 'arrived'
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Cannot mark as delivered - order not arrived or not assigned to you"
      });
    }

    order.status = 'delivered';
    order.deliveryStatus = 'delivered';
    order.deliveredAt = new Date();
    await order.save();

    partner.status = 'available';
    partner.assignedOrderId = null;
    await partner.save();

    res.status(200).json({
      success: true,
      message: "Order delivered successfully",
      data: order
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to mark as delivered",
      error: err.message
    });
  }
};

// Rate a delivery partner 
export const rateDeliveryPartner = async (req, res) => {
  try {
    const { orderId, rating, feedback } = req.body;
    const userId = req.user.id;

    if (!orderId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Order ID and rating are required"
      });
    }

    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5"
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId
    }).populate("deliveryPartner");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not authorized"
      });
    }

    const partner = await DeliveryPartner.findById(order.deliveryPartner?._id);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery Partner not found"
      });
    }

    const alreadyRated = partner.ratings.some(r =>
      r.orderId.toString() === order._id.toString()
    );

    if (alreadyRated) {
      return res.status(409).json({
        success: false,
        message: "Order already rated"
      });
    }

    partner.ratings.push({
      orderId: order._id,
      rating: parsedRating,
      feedback: feedback || ""
    });

    const totalRating = partner.ratings.reduce((sum, r) => sum + r.rating, 0);
    partner.averageRating = totalRating / partner.ratings.length;

    await partner.save();

    res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        averageRating: partner.averageRating.toFixed(2),
        totalRatings: partner.ratings.length
      }
    });
  } catch (err) {
    console.error('Error in rateDeliveryPartner:', {
      error: err.message,
      stack: err.stack,
      body: req.body,
      user: req.user
    });
    res.status(500).json({
      success: false,
      message: "Failed to rate delivery partner",
      error: err.message
    });
  }
};
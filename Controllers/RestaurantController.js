import mongoose from "mongoose";
import Restaurant from "../Models/Restaurant.js";
import { uploadToCloudinary } from "../Middlewares/UploadMiddleware.js";
import Order from "../Models/Order.js";
import TableBooking from "../Models/Booking.js";
import DeliveryPartner from "../Models/DeliveryPartner.js";
import User from "../Models/User.js";

// Create restaurant
export const createRestaurant = async (req, res) => {
  try {
    const data = req.body;

    if (req.files?.image?.[0]) {
      const uploadedImage = await uploadToCloudinary(req.files.image[0].buffer, "restaurants");
      data.image = uploadedImage.secure_url;
    }

    if (req.files?.photos?.length) {
      const photoUrls = [];
      for (const file of req.files.photos) {
        const uploaded = await uploadToCloudinary(file.buffer, "restaurants/photos");
        photoUrls.push(uploaded.secure_url);
      }
      data.photos = photoUrls;
    }

    const requiredFields = [
      "name",
      "image",
      "time",
      "distance",
      "contact",
      "gstNumber",
      "legalName",
      "fssaiNumber",
      "cuisine",
      "address",
      "restaurantowner",
      "openHours",
      "menu",
      "isOpen"
    ];

    for (let field of requiredFields) {
      if (!data[field]) return res.status(400).json({ error: `${field} is required` });
    }

    data.deliveryAvailable = Boolean(data.deliveryAvailable);

    if (!mongoose.Types.ObjectId.isValid(data.restaurantowner)) {
      return res.status(400).json({ error: "Invalid restaurantowner ID" });
    }

    if (typeof data.menu === "string") {
      data.menu = JSON.parse(data.menu);
    }

    if (!Array.isArray(data.menu) || data.menu.length === 0) {
      return res.status(400).json({ error: "menu must be a non-empty array" });
    }

    if (typeof data.openHours === "string") {
      data.openHours = JSON.parse(data.openHours);
    }

    const newRestaurant = new Restaurant(data);
    await newRestaurant.save();

    res.status(201).json({ success: true, data: newRestaurant });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json({ success: true, data: restaurants });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get restaurant by ID
export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid restaurant ID" });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update restaurant
export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid restaurant ID" });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    if (!restaurant.menu) {
      restaurant.menu = [];
    }

    if (typeof req.body.menu === "string") {
      try {
        req.body.menu = JSON.parse(req.body.menu);
      } catch {
        return res.status(400).json({ error: "Invalid menu format" });
      }
    }

    if (typeof req.body.openHours === "string") {
      try {
        req.body.openHours = JSON.parse(req.body.openHours);
      } catch {
        return res.status(400).json({ error: "Invalid openHours format" });
      }
    }

    if (req.body.menu) {
      const updateMenu = Array.isArray(req.body.menu) ? req.body.menu : [req.body.menu];

      updateMenu.forEach((updateCategory) => {
        if (!updateCategory || typeof updateCategory !== 'object') return;
        if (!updateCategory.name || !updateCategory.items) return;

        const existingCategory = restaurant.menu.find(
          cat => cat.name.toLowerCase() === updateCategory.name.toLowerCase()
        );

        if (existingCategory) {
          const updateItems = Array.isArray(updateCategory.items) ? updateCategory.items : [updateCategory.items];
          existingCategory.items = updateItems
            .map(updateItem => {
              if (!updateItem || typeof updateItem !== 'object' || !updateItem.name) return null;
              const existingItem = existingCategory.items.find(
                item => item.name.toLowerCase() === updateItem.name.toLowerCase()
              );
              return existingItem ? { ...existingItem, ...updateItem } : updateItem;
            })
            .filter(Boolean);
        } else {
          restaurant.menu.push(updateCategory);
        }
      });

      restaurant.markModified("menu");
      await restaurant.save();
    }

    if (req.body.isOpen !== undefined) {
      if (req.body.isOpen === false && !req.body.closureReason) {
        return res.status(400).json({ error: "Closure reason is required when closing the restaurant" });
      }
      if (req.body.isOpen === true) {
        req.body.closureReason = null;
      }
    }
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: "Restaurant updated successfully",
      data: updatedRestaurant
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete restaurant
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid restaurant ID" });
    }

    const restaurant = await Restaurant.findByIdAndDelete(id);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.status(200).json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add review
export const addReview = async (req, res) => {
  try {
    const { id } = req.query;
    const { rating, text } = req.body;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid restaurant ID" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await User.findById(userId).select('name role');
    if (!user || user.role !== 'user') {
      return res.status(403).json({ error: "Only regular users can submit reviews" });
    }

    if (!rating || !text) {
      return res.status(400).json({ error: "Rating and text are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const existingReview = restaurant.reviews.find(r => r.user?.toString() === userId);
    if (existingReview) {
      return res.status(400).json({ error: "You've already reviewed this restaurant" });
    }

    const newReview = {
      user: userId,
      userName: user.name,
      rating,
      text,
      date: new Date()
    };

    restaurant.reviews.push(newReview);
    
    const totalRatings = restaurant.reviews.reduce((sum, review) => sum + review.rating, 0);
    restaurant.rating = totalRatings / restaurant.reviews.length;
    restaurant.ratingCount = restaurant.reviews.length;

    await restaurant.save();

    res.status(201).json({ 
      success: true,
      message: "Review added successfully",
      review: newReview,
      newAverageRating: restaurant.rating
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add menu item
export const addMenuItem = async (req, res) => {
  try {
    const { id } = req.query;
    const newCategory = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid restaurant ID" });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const categoryExists = restaurant.menu.find(cat => cat.name === newCategory.name);

    if (categoryExists) {
      categoryExists.items = [...categoryExists.items, ...newCategory.items];
    } else {
      restaurant.menu.push(newCategory);
    }

    await restaurant.save();
    res.status(200).json({ message: "Menu updated", menu: restaurant.menu });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update restaurant status (admin only)
export const updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const { status } = req.body;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid restaurant ID" });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(id, { status }, { new: true });
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.status(200).json({ message: "Restaurant status updated", data: restaurant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.query;
    const { status, cancellationReason, updatedBy } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const statusMappings = {
      pending: { stage: 1, next: ['restaurant_accepted', 'cancelled'] },
      restaurant_accepted: { stage: 2, next: ['preparing', 'cancelled'] },
      preparing: { stage: 3, next: ['ready_for_pickup', 'cancelled'] },
      ready_for_pickup: { stage: 4, next: ['out_for_delivery', 'cancelled'] },
      out_for_delivery: { stage: 5, next: ['delivered'] },
      delivered: { stage: 6, next: [] },
      cancelled: { stage: 0, next: [] }
    };

    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_');

    if (!statusMappings[normalizedStatus]) {
      return res.status(400).json({ 
        error: "Invalid status",
        validStatuses: Object.keys(statusMappings)
      });
    }

    let order = await Order.findOne({ orderId })
      .populate('userId', 'name email phone')
      .populate('deliveryPartner', 'name phone vehicleId status')
      .populate('address');

    if (!order && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId)
        .populate('userId', 'name email phone')
        .populate('deliveryPartner', 'name phone vehicleId status')
        .populate('address');
    }

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const currentStatus = order.status?.toLowerCase().replace(/\s+/g, '_');

    if (!statusMappings[currentStatus]?.next.includes(normalizedStatus)) {
      return res.status(400).json({
        error: `Invalid status transition from ${currentStatus} to ${normalizedStatus}`,
        allowedTransitions: statusMappings[currentStatus]?.next || []
      });
    }

    const updateData = {
      status: normalizedStatus,
      deliveryStage: statusMappings[normalizedStatus].stage,
      updatedBy
    };

    const statusTimestamps = {
      restaurant_accepted: { acceptedAt: new Date() },
      preparing: { startedPreparingAt: new Date() },
      ready_for_pickup: { readyAt: new Date() },
      out_for_delivery: { dispatchedAt: new Date() },
      delivered: { deliveredAt: new Date() },
      cancelled: { 
        cancelledAt: new Date(),
        cancellationReason: cancellationReason || "No reason provided"
      }
    };

    if (statusTimestamps[normalizedStatus]) {
      Object.assign(updateData, statusTimestamps[normalizedStatus]);
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      updateData,
      { new: true }
    )
      .populate('userId', 'name email phone')
      .populate('deliveryPartner', 'name phone vehicleId status')
      .populate('address');

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder
    });

  } catch (error) {
    res.status(500).json({ 
      error: "Failed to update order status",
      details: error.message
    });
  }
};

// Accept or Reject a Booking
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const { status, respondedBy, cancellationReason } = req.body;

    if (!['accepted', 'confirmed', 'cancelled', 'waitlisted'].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const booking = await TableBooking.findByIdAndUpdate(
      id,
      { status, respondedBy, ...(status === 'cancelled' && { cancellationReason }) },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json({ message: "Booking status updated", data: booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get top restaurants
export const getTopRestaurants = async (req, res) => {
  try {
    const topRestaurants = await Restaurant.find({})
      .sort({ averageRating: -1 })
      .limit(8);

    res.status(200).json({ success: true, data: topRestaurants });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Assign Delivery Partner 
export const assignDeliveryPartner = async (req, res) => {
  try {
    const { orderId } = req.query;  
    const { deliveryPartnerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(deliveryPartnerId)) {
      return res.status(400).json({ error: "Invalid delivery partner ID" });
    }

    const deliveryPartner = await DeliveryPartner.findById(deliveryPartnerId);
    if (!deliveryPartner) {
      return res.status(404).json({ error: "Delivery partner not found" });
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      {
        deliveryPartner: deliveryPartnerId,
        status: 'out for delivery',
        deliveryStage: 4
      },
      { new: true }
    ).populate('deliveryPartner');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    deliveryPartner.assignedOrderId = orderId;
    await deliveryPartner.save();

    res.status(200).json({
      message: "Delivery partner assigned successfully",
      order
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
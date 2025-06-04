import mongoose from 'mongoose';
import Restaurant from "../Models/Restaurant.js";

// Create restaurant
export const createRestaurant = async (req, res) => {
  try {
    const data = req.body;

    const requiredFields = ['name', 'image', 'time', 'distance', 'contact', 'gstNumber', 'legalName', 'fssaiNumber', 'cuisine', 'address', 'restaurantowner', 'openHours'];
    for (let field of requiredFields) {
      if (!data[field]) return res.status(400).json({ error: `${field} is required` });
    }

    if (typeof data.deliveryAvailable === "string") {
      data.deliveryAvailable = data.deliveryAvailable.toLowerCase() === "true";
    } else {
      data.deliveryAvailable = Boolean(data.deliveryAvailable);
    }

    if (!mongoose.Types.ObjectId.isValid(data.restaurantowner)) {
      return res.status(400).json({ error: "Invalid restaurantowner ID" });
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

    const restaurant = await Restaurant.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

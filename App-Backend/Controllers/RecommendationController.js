import Recommendation from '../Models/Recommedations.js';
import Order from "../Models/Order.js";
import Restaurant from "../Models/Restaurant.js";

//Frequentorders
export const getFrequentOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId });

    const restaurantCount = {};
    orders.forEach(order => {
      const rid = order.restaurantId.toString(); 
      restaurantCount[rid] = (restaurantCount[rid] || 0) + 1;
    });

    const frequentRestaurantIds = Object.keys(restaurantCount);

    const restaurants = await Restaurant.find({ _id: { $in: frequentRestaurantIds } });

    const response = restaurants.map(r => ({
      id: r._id.toString(), 
      name: r.name,
      image: r.image,
      cuisine: r.cuisine,
      address: r.address,
      time: r.time,
      totalOrders: restaurantCount[r._id.toString()] || 0 
    }));

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching frequent orders:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Create a recommendation
export const createRecommendation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { restaurantId, rating, liked } = req.body;

    if (!restaurantId || !rating) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const newRecommendation = new Recommendation({
      userId,
      restaurantId,
      rating,
      liked,
      recommendedBy: userId
    });

    await newRecommendation.save();
    res.status(201).json({ message: 'Recommendation created.', recommendation: newRecommendation });
  } catch (error) {
    console.error('Error creating recommendation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all recommendations (for logged-in user)
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    const recommendations = await Recommendation.find({ userId })
      .populate('restaurantId')
      .populate('recommendedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single recommendation by ID
export const getRecommendationById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'Recommendation ID is required.' });

    const recommendation = await Recommendation.findById(id);
    if (!recommendation) return res.status(404).json({ message: 'Recommendation not found.' });

    res.json(recommendation);
  } catch (error) {
    console.error('Error fetching recommendation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update recommendation
export const updateRecommendation = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'Recommendation ID is required.' });

    const updated = await Recommendation.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Recommendation not found.' });

    res.json({ message: 'Recommendation updated.', recommendation: updated });
  } catch (error) {
    console.error('Error updating recommendation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete recommendation
export const deleteRecommendation = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'Recommendation ID is required.' });

    const deleted = await Recommendation.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Recommendation not found.' });

    res.json({ message: 'Recommendation deleted successfully.' });
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

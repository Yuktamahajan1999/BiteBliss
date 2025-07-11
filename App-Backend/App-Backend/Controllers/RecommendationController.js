import Recommendation from '../Models/Recommedations.js';
import mongoose from 'mongoose';

// Create a recommendation
export const createRecommendation = async (req, res) => {
  try {
    const { userId, restaurantId, rating, liked, recommendedBy, sharedWith } = req.body;

    if (!userId || !restaurantId || !rating) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const newRecommendation = new Recommendation({
      userId,
      restaurantId,
      rating,
      liked,
      recommendedBy: recommendedBy || userId,
      sharedWith
    });

    await newRecommendation.save();
    res.status(201).json({ message: 'Recommendation created.', recommendation: newRecommendation });
  } catch (error) {
    console.error('Error creating recommendation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all recommendations 
export const getRecommendations = async (req, res) => {
  try {
    const { userId, restaurantId } = req.query;
    const filter = {};

    if (userId) filter.userId = userId;
    if (restaurantId) filter.restaurantId = restaurantId;

    const recommendations = await Recommendation.find(filter).sort({ createdAt: -1 });
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single recommendation 
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

// Friend Recommedations
export const getFriendRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ message: 'User ID is required.' });

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const friendRecs = await Recommendation.find({
      sharedWith: userObjectId,
      recommendedBy: { $ne: userObjectId }
    })
      .populate('restaurantId')
      .populate('recommendedBy', 'name');

    res.json(friendRecs);
  } catch (error) {
    console.error('Error fetching friend recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
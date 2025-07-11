import Rating from '../Models/Ratings.js';
import { UserPreference } from "../Models/UserModal.js"; 

// Create a new rating

export const createRating = async (req, res) => {
  try {
    const { userId, targetId, targetType, rating, feedback, orderId } = req.body;

    if (!userId || !targetId || !targetType || !rating) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const newRating = new Rating({ userId, targetId, targetType, rating, feedback, orderId });
    await newRating.save();

    const totalRatings = await Rating.countDocuments({ 
      userId,
      targetType: { $in: ['DeliveryPartner', 'Restaurant'] } 
    });

    let rewardGranted = false;
    let reward = null;

    if (totalRatings === 2) {
      const userPref = await UserPreference.findOneAndUpdate(
        { user: userId, ratingRewardGiven: { $ne: true } }, 
        { 
          $inc: { rewardPoints: 50 },
          $set: { ratingRewardGiven: true }
        },
        { new: true, upsert: true }
      );

      if (userPref.modifiedCount > 0) { 
        rewardGranted = true;
        reward = {
          name: "Rating Milestone",
          points: 50,
          description: "Thanks for rating 2 services! You earned 50 reward points.",
          tag: "Rating Milestone"
        };
      }
    }

    return res.status(201).json({
      success: true,
      message: rewardGranted
        ? "Rating submitted! 🎉 Milestone reward granted."
        : "Rating submitted successfully.",
      data: newRating,
      rewardGranted,
      reward
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create rating.",
      error: error.message
    });
  }
};

// Get ratings
export const getRatings = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized. User not found." 
      });
    }

    const ratings = await Rating.find({ userId }).sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      data: ratings 
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve ratings.",
      error: error.message 
    });
  }
};

// Update rating
export const updateRating = async (req, res) => {
  try {
    const { ratingId } = req.query;
    const { ratingValue, comment } = req.body;

    if (!ratingId) return res.status(400).json({ message: "Missing ratingId in query." });

    const updated = await Rating.findByIdAndUpdate(
      ratingId,
      { ratingValue, comment },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Rating not found." });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update rating.", error: error.message });
  }
};

// Delete rating
export const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.query;
    if (!ratingId) return res.status(400).json({ message: "Missing ratingId in query." });

    const deleted = await Rating.findByIdAndDelete(ratingId);
    if (!deleted) return res.status(404).json({ message: "Rating not found." });

    res.status(200).json({ success: true, message: "Rating deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete rating.", error: error.message });
  }
};

import Rating from '../Models/Ratings.js';

// Create a new rating
export const createRating = async (req, res) => {
  try {
    const { userId, targetId, ratingValue, comment } = req.body;

    if (!userId || !targetId || !ratingValue) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const newRating = new Rating({ userId, targetId, ratingValue, comment });
    await newRating.save();

    res.status(201).json({ success: true, data: newRating });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create rating.", error: error.message });
  }
};

// Get ratings
export const getRatings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.targetId) filter.targetId = req.query.targetId;

    const ratings = await Rating.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to retrieve ratings.", error: error.message });
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

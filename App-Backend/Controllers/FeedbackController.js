import Feedback from '../Models/Feedback.js';

// Create new feedback
export const createFeedback = async (req, res) => {
  try {
    const { feedbackText, feedbackType, rating, email, mobile, helpRequested, videoUrl, imageUrl, restaurantId } = req.body;

    const feedback = new Feedback({
      userId: req.user.id,
      restaurantId,
      feedbackText,
      feedbackType,
      rating,
      email,
      mobile,
      helpRequested,
      videoUrl,
      imageUrl,
    });

    await feedback.save();
    res.status(201).json({ success: true, message: "Feedback submitted", data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error submitting feedback", error: error.message });
  }
};

// Get all feedback
export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json({ success: true, data: feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching feedback", error: error.message });
  }
};

// Get feedback by user ID
export const getFeedbackByUser = async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  try {
    const feedbacks = await Feedback.find({ userId });
    res.status(200).json({ success: true, data: feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get feedback by restaurant ID
export const getFeedbackByRestaurant = async (req, res) => {
  const { restaurantId } = req.query;
  if (!restaurantId) return res.status(400).json({ error: "restaurantId is required" });
  try {
    const feedbacks = await Feedback.find({ restaurantId });
    res.status(200).json({ success: true, data: feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update feedback status
export const updateFeedbackStatus = async (req, res) => {
  const { feedbackId, status } = req.body;
  if (!feedbackId || !status) return res.status(400).json({ error: "feedbackId and status required" });

  try {
    const updated = await Feedback.findByIdAndUpdate(feedbackId, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: "Feedback not found" });

    res.status(200).json({ success: true, message: "Status updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status", error: error.message });
  }
};

// Add a response to feedback
export const respondToFeedback = async (req, res) => {
  const { feedbackId, response } = req.body;
  if (!feedbackId || !response) return res.status(400).json({ error: "feedbackId and response required" });

  try {
    const updated = await Feedback.findByIdAndUpdate(feedbackId, { response }, { new: true });
    if (!updated) return res.status(404).json({ error: "Feedback not found" });

    res.status(200).json({ success: true, message: "Response added", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding response", error: error.message });
  }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
  const { feedbackId } = req.query;
  if (!feedbackId) return res.status(400).json({ error: "feedbackId is required" });

  try {
    const deleted = await Feedback.findByIdAndDelete(feedbackId);
    if (!deleted) return res.status(404).json({ error: "Feedback not found" });

    res.status(200).json({ success: true, message: "Feedback deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting feedback", error: error.message });
  }
};

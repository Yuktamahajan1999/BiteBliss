import Reward from "../Models/Rewards.js";
import { GiftCard } from "../Models/UserModal.js";

// Get all rewards
export const getAllRewards = async (req, res) => {
  try {
    const rewards = await Reward.find();
    res.status(200).json(rewards);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rewards", error });
  }
};

// Redeem a reward as a gift card
export const redeemReward = async (req, res) => {
  const { userId, rewardId } = req.query;

  try {
    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }

    const cardCode = `GC-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 3); // 3 months validity

    const giftCard = new GiftCard({
      cardCode,
      redeemedBy: userId,
      reward: rewardId, // OPTIONAL: if you want to track which reward this card is for
      expirationDate,
    });

    await giftCard.save();

    res.status(200).json({
      message: "Reward redeemed successfully",
      giftCard,
    });
  } catch (error) {
    console.error("Error redeeming reward:", error);
    res.status(500).json({ message: "Reward redemption failed", error });
  }
};

// Get redeemed gift cards for a user
export const getUserRedeemedRewards = async (req, res) => {
  const { userId } = req.query;

  try {
    const giftCards = await GiftCard.find({ redeemedBy: userId })
      .populate("reward") // Optional: include reward details
      .sort({ redeemedAt: -1 });
    res.status(200).json(giftCards);
  } catch (error) {
    console.error("Error fetching redeemed rewards:", error);
    res.status(500).json({ message: "Could not fetch redeemed rewards", error });
  }
};

// Update a reward
export const updateReward = async (req, res) => {
  const { id } = req.query;

  try {
    const updated = await Reward.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Reward not found" });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update reward", err });
  }
};

// Delete a reward
export const deleteReward = async (req, res) => {
  const { id } = req.query;

  try {
    const deleted = await Reward.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Reward not found" });

    res.status(200).json({ message: "Reward deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete reward", err });
  }
};

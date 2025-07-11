import { UserPreference } from "../Models/UserModal.js";
import Rating from "../Models/Ratings.js";

// Static rewards list
export const ALL_REWARDS = [
  {
    title: "₹50 Off",
    desc: "Get ₹50 off on your next order.",
    points: 100,
    icon: "FaGift",
    extra: "Valid on orders above ₹299"
  },
  {
    title: "Free Dessert",
    desc: "Enjoy a free dessert from select restaurants.",
    points: 150,
    icon: "FaIceCream",
    extra: "Check eligible restaurants before redeeming."
  },
  {
    title: "50% Off",
    desc: "Flat 50% off on any order, max discount ₹100.",
    points: 200,
    icon: "FaPercent",
    extra: "Maximum ₹100 off. Can be used once per user."
  },
  {
    title: "First Order Special",
    desc: "Get ₹100 off on your very first order.",
    points: 0,
    icon: "FaCrown",
    extra: "Only once per account. Applied automatically."
  },
  {
    title: "Rate & Save",
    desc: "5% off coupon on your next order for each rating given (up to 5 ratings).",
    points: 0,
    icon: "FaStar",
    extra: "Earn up to 5 coupons. Each coupon max discount ₹30."
  },
  {
    title: "Rating Champion",
    desc: "Earn 50 points for rating 2 services",
    points: 0,
    icon: "FaAward",
    extra: "Automatically awarded after rating 2 deliveries or restaurants",
    type: "rating",
    milestone: 2
  }
];

// GET all rewards
// GET all rewards
export const getAllRewards = async (req, res) => {
  try {
    res.status(200).json(ALL_REWARDS);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rewards", error });
  }
};

// Redeem a reward
export const redeemReward = async (req, res) => {
  const { rewardTitle } = req.body;
  const userId = req.user.id;

  try {
    const reward = ALL_REWARDS.find(r => r.title === rewardTitle);
    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }

    const userPref = await UserPreference.findOne({ user: userId });
    if (!userPref) {
      return res.status(404).json({ message: "User preferences not found" });
    }

    if (userPref.redeemedRewards && userPref.redeemedRewards.includes(rewardTitle)) {
      return res.status(400).json({ message: "Reward already redeemed" });
    }

    if ((userPref.rewardPoints || 0) < reward.points) {
      return res.status(400).json({ message: "Not enough points to redeem this reward" });
    }

    userPref.rewardPoints -= reward.points;
    userPref.redeemedRewards = userPref.redeemedRewards || [];
    userPref.redeemedRewards.push(rewardTitle);
    await userPref.save();

    res.status(200).json({
      message: "Reward redeemed successfully",
      reward,
      remainingPoints: userPref.rewardPoints,
      redeemedRewards: userPref.redeemedRewards,
    });
  } catch (error) {
    res.status(500).json({ message: "Reward redemption failed", error });
  }
};

// Remove a redeemed reward for a user
export const removeReward = async (req, res) => {
  const { rewardTitle } = req.body;
  const userId = req.user.id;

  try {
    const userPref = await UserPreference.findOne({ user: userId });
    if (!userPref) return res.status(404).json({ message: "User preferences not found" });

    if (!userPref.redeemedRewards || !userPref.redeemedRewards.includes(rewardTitle)) {
      return res.status(404).json({ message: "Reward not redeemed yet" });
    }

    userPref.redeemedRewards = userPref.redeemedRewards.filter(title => title !== rewardTitle);
    await userPref.save();

    res.status(200).json({
      message: "Reward removed",
      redeemedRewards: userPref.redeemedRewards,
    });
  } catch (error) {
    res.status(500).json({ message: "Remove reward failed", error });
  }
};

// Get user points
export const getUserPoints = async (req, res) => {
  const userId = req.user.id;
  try {
    console.log('getUserPoints called for user:', userId);

    const userPref = await UserPreference.findOne({ user: userId });
    console.log('User preferences found:', userPref);

    if (!userPref) {
      console.log('No user preferences found');
      return res.status(404).json({ message: "User preferences not found" });
    }

    const ratingCount = await Rating.countDocuments({
      userId,
      targetType: { $in: ['DeliveryPartner', 'Restaurant'] }
    });
    console.log('Rating count:', ratingCount);

    let ratingRewardGiven = userPref.ratingRewardGiven || false;
    if (ratingCount >= 2 && !ratingRewardGiven) {
      const ratingReward = ALL_REWARDS.find(r => r.type === "rating");
      if (ratingReward) {
        userPref.rewardPoints = (userPref.rewardPoints || 0) + ratingReward.points;
        userPref.ratingRewardGiven = true;
        await userPref.save();
        ratingRewardGiven = true;
      }
    }

    res.status(200).json({
      points: userPref.rewardPoints || 0,
      redeemedRewards: userPref.redeemedRewards || [],
      ratingProgress: {
        current: ratingCount,
        required: 2,
        rewarded: ratingRewardGiven
      }
    });
  } catch (error) {
    console.error('Error in getUserPoints:', error);
    res.status(500).json({
      message: "Could not fetch points",
      error: error.message
    });
  }
};

// Add points
export const addOrderPoints = async (req, res) => {
  const { orderAmount } = req.body;
  const userId = req.user.id;

  try {
    const pointsEarned = Math.floor(orderAmount / 10);

    const userPref = await UserPreference.findOneAndUpdate(
      { user: userId },
      { $inc: { rewardPoints: pointsEarned } },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: `Added ${pointsEarned} points for order`,
      points: userPref.rewardPoints
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add points", error });
  }
};
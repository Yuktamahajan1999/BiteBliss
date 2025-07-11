import { UserPreference } from "../Models/UserModal.js";

// Hide a restaurant
export const hideRestaurant = async (req, res) => {
  try {
    const userId = req.user.id;
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const prefs = await UserPreference.findOneAndUpdate(
      { user: userId },
      { $addToSet: { hiddenRestaurants: restaurantId } },
      { new: true, upsert: true }
    ).populate("hiddenRestaurants");

    res.status(200).json({
      message: "Restaurant hidden successfully",
      hiddenRestaurants: prefs.hiddenRestaurants
    });
  } catch (error) {
    console.error("Error hiding restaurant:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Unhide a restaurant
export const unhideRestaurant = async (req, res) => {
  try {
    const userId = req.user.id;
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const prefs = await UserPreference.findOneAndUpdate(
      { user: userId },
      { $pull: { hiddenRestaurants: restaurantId } },
      { new: true }
    ).populate("hiddenRestaurants");

    res.json({
      message: "Restaurant unhidden successfully",
      hiddenRestaurants: prefs?.hiddenRestaurants || []
    });
  } catch (error) {
    console.error("Error unhiding restaurant:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// get Hidden Restauarant
export const getHiddenRestaurants = async (req, res) => {
  try {
    const userId = req.user.id;

    const prefs = await UserPreference.findOne({ user: userId }).populate("hiddenRestaurants");

    res.status(200).json({
      hiddenRestaurants: prefs?.hiddenRestaurants || []
    });
  } catch (err) {
    console.error("Error fetching hidden restaurants:", err);
    res.status(500).json({
      message: "Error fetching hidden restaurants",
      error: err.message
    });
  }
};

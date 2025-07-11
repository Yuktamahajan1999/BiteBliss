import {UserPreference} from '../Models/UserModal.js';

// GET wishlist 
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const prefs = await UserPreference.findOne({ user: userId }).populate("wishList");
    if (!prefs) return res.status(404).json({ message: 'No preferences found for this user.' });

    res.status(200).json({ wishlist: prefs.wishList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const { restaurantId } = req.body;

    let prefs = await UserPreference.findOne({ user: userId });

    if (!prefs) {
      prefs = new UserPreference({
        user: userId,
        wishList: [restaurantId]
      });
      await prefs.save(); 
    } else {
      if (!prefs.wishList.includes(restaurantId)) {
        prefs.wishList.push(restaurantId);
        await prefs.save();
      }
    }

    res.status(200).json({ message: 'Added to wishlist', wishlist: prefs.wishList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// DELETE remove from wishlist 
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { restaurantId } = req.body;


    const prefs = await UserPreference.findOne({ user: userId });
    if (!prefs) return res.status(404).json({ message: 'No preferences found for this user.' });

    prefs.wishList = prefs.wishList.filter(id => id.toString() !== restaurantId);
    await prefs.save();

    res.status(200).json({ message: 'Removed from wishlist', wishlist: prefs.wishList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

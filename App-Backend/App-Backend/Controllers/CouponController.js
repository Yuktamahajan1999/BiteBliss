import {UserPreference} from '../Models/UserModal.js';

// GET coupons
export const getCoupons = async (req, res) => {
  const { userId } = req.query;

  if (!userId) return res.status(400).json({ error: 'UserId required' });

  try {
    const prefs = await UserPreference.findOne({ _id: userId });
    if (!prefs) return res.status(404).json({ error: 'User preferences not found' });

    res.json(prefs.appliedCoupons);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST coupons
export const applyCoupon = async (req, res) => {
  const { userId, code } = req.body;

  if (!userId || !code) return res.status(400).json({ error: 'userId and coupon code are required' });

  try {
    const prefs = await UserPreference.findById(userId);
    if (!prefs) return res.status(404).json({ error: 'User preferences not found' });

    const alreadyApplied = prefs.appliedCoupons.some(c => c.code === code);
    if (alreadyApplied) return res.status(400).json({ error: 'Coupon already applied' });

    prefs.appliedCoupons.push({ code });
    await prefs.save();

    res.json({ message: 'Coupon applied', appliedCoupons: prefs.appliedCoupons });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE coupons
export const removeCoupon = async (req, res) => {
  const { userId, code } = req.body;

  if (!userId || !code) return res.status(400).json({ error: 'userId and coupon code required' });

  try {
    const prefs = await UserPreference.findById(userId);
    if (!prefs) return res.status(404).json({ error: 'User preferences not found' });

    prefs.appliedCoupons = prefs.appliedCoupons.filter(c => c.code !== code);
    await prefs.save();

    res.json({ message: 'Coupon removed', appliedCoupons: prefs.appliedCoupons });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

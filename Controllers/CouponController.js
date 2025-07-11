import Coupon from "../Models/CouponModel.js";
import { UserCouponPrefs } from "../Models/UserModal.js";

// Static coupon list
export const ALL_COUPONS = [
  {
    title: 'Flat 20% Off',
    description: 'Get 20% off on orders above ₹500',
    code: 'FLAT20',
    icon: 'FaPercentage',
    color: '#FF7043',
    tag: 'Popular',
    minOrder: 500
  },
  {
    title: 'Free Delivery',
    description: 'No delivery charge on your first 3 orders',
    code: 'DELIVERYFREE',
    icon: 'FaTruck',
    color: '#5C6BC0'
  },
  {
    title: 'First Order Special',
    description: 'Enjoy a sweet 25% off on your first order',
    code: 'WELCOME25',
    icon: 'FaRegSmile',
    color: '#66BB6A'
  },
  {
    title: 'Buy 1 Get 1 Free',
    description: 'Applicable on select meals only',
    code: 'BOGOBLISS',
    icon: 'FaPlusCircle',
    color: '#EC407A'
  },
  {
    title: 'Limited Time Deal',
    description: 'Hurry! Offer valid only till midnight',
    code: 'MIDNIGHT50',
    icon: 'FaClock',
    color: '#26C6DA',
    tag: 'Expiring Soon'
  }
];

// Get all coupons
export const getAllCoupons = async (req, res) => {
  try {
    res.status(200).json(ALL_COUPONS);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// GET applied coupons for a user
export const getCoupons = async (req, res) => {
  try {
    const userId = req.user.id;
    const prefs = await UserCouponPrefs.findOne({ user: userId });
    res.status(200).json(prefs ? prefs.appliedCoupons : []);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Apply a coupon for a user
export const applyCoupon = async (req, res) => {
  const userId = req.user.id;
  const { code, orderAmount } = req.body;
  if (!orderAmount || orderAmount < 300) {
    return res.status(400).json({
      error: 'Minimum order value for coupons is ₹300'
    });
  }

  if (!userId || !code) {
    return res.status(400).json({ error: 'userId and coupon code are required' });
  }

  // Coupon validation
  const couponDetails = ALL_COUPONS.find(c => c.code === code);
  if (!couponDetails) {
    return res.status(400).json({ error: 'Invalid coupon code' });
  }
  if (couponDetails.minOrder && (!orderAmount || orderAmount < couponDetails.minOrder)) {
    return res.status(400).json({ error: `Minimum order value for this coupon is ₹${couponDetails.minOrder}` });
  }

  try {
    let prefs = await UserCouponPrefs.findOne({ user: userId });
    if (!prefs) {
      prefs = new UserCouponPrefs({ user: userId, appliedCoupons: [] });
    }

    const alreadyApplied = prefs.appliedCoupons.some(c => c.code === code);
    if (alreadyApplied) {
      return res.status(400).json({ error: 'Coupon already applied' });
    }

    prefs.appliedCoupons.push({ code });
    await prefs.save();

    res.status(200).json({ message: 'Coupon applied', appliedCoupons: prefs.appliedCoupons });
  } catch (err) {
    console.error("applyCoupon error:", err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Remove a coupon for a user
export const removeCoupon = async (req, res) => {
  const userId = req.user.id;
  const { code } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ error: 'userId and coupon code required' });
  }

  try {
    const prefs = await UserCouponPrefs.findOne({ user: userId });
    if (!prefs) return res.status(404).json({ error: 'User preferences not found' });

    const newCoupons = prefs.appliedCoupons.filter(c => c.code !== code);
    if (newCoupons.length === prefs.appliedCoupons.length) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    prefs.appliedCoupons = newCoupons;
    await prefs.save();

    res.status(200).json({ message: 'Coupon removed', appliedCoupons: prefs.appliedCoupons });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
import Payment from '../Models/Payment.js';
import { v4 as uuidv4 } from 'uuid';
import Donation from '../Models/Donation.js';
import Order from '../Models/Order.js';

export const createPayment = async (req, res) => {
  try {
    console.log('Received payment request:', req.body);

    const {
      method,
      cardDetails,
      type = 'order',
      name,
      email,
      amount,
      message = '',
      restaurantId,
      address,
      deliveryFee,
      gst,
      paymentMethod,
      restaurantName
    } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!method || !['credit-card', 'google-pay', 'cod'].includes(method)) {
      return res.status(400).json({ success: false, message: 'Valid payment method is required' });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }

    if (method === 'credit-card') {
      const { number, name: cardName, expiry, cvv } = cardDetails || {};
      if (!number || !cardName || !expiry || !cvv) {
        return res.status(400).json({ success: false, message: 'Complete card details are required for credit card payment' });
      }
      if (!/^\d{16}$/.test(number.replace(/\s/g, ''))) {
        return res.status(400).json({ success: false, message: 'Invalid card number' });
      }
    }

    const transactionId = `txn_${uuidv4()}`;
    const paymentStatus = ['credit-card', 'google-pay'].includes(method) ? 'completed' : 'pending';

    if (type === 'donation') {
      if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Name and email are required for donation' });
      }

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }

      const payment = await Payment.create({
        userId,
        method,
        type: 'donation',
        cardDetails: method === 'credit-card' ? cardDetails : undefined,
        transactionId,
        status: paymentStatus,
        amount: parseFloat(amount)
      });

      const donation = await Donation.create({
        name,
        email,
        amount: parseFloat(amount),
        message,
        userId,
        paymentId: payment._id,
        status: paymentStatus
      });

      return res.status(201).json({
        success: true,
        message: 'Donation processed successfully',
        paymentId: payment._id,
        transactionId,
        status: paymentStatus,
        donation
      });
    }

    if (type === 'order') {
      console.log('🧾 Processing order payment...');

      const requiredOrderFields = [restaurantId, address, deliveryFee, gst, paymentMethod, restaurantName];
      const orderFieldNames = ['restaurantId', 'address', 'deliveryFee', 'gst', 'paymentMethod', 'restaurantName'];
      const missing = orderFieldNames.filter((name, i) =>
        requiredOrderFields[i] === undefined ||
        requiredOrderFields[i] === null ||
        requiredOrderFields[i] === ''
      );

      if (missing.length) {
        console.warn('⚠️ Missing required order fields:', missing);
        return res.status(400).json({
          success: false,
          message: 'All order details are required',
          missingFields: missing
        });
      }

      console.log('💳 Creating payment document...');
      const payment = await Payment.create({
        userId,
        method,
        type: 'order',
        cardDetails: method === 'credit-card' ? cardDetails : undefined,
        orderId: uuidv4(), 
        transactionId: transactionId,
        status: paymentStatus,
        amount: parseFloat(amount),
        restaurantId
      });

      console.log('📦 Creating order document...');
      const order = await Order.create({
        userId,
        restaurantId,
        restaurantName,
        address: address._id || address,
        deliveryFee: parseFloat(deliveryFee),
        gst: parseFloat(gst),
        paymentMethod: method,
        orderId: transactionId,
        status: 'pending',
        totalAmount: parseFloat(amount),
        payment: payment._id,
        items: req.body.items || []
      });

      console.log('✅ Order and payment successfully created.');
      return res.status(201).json({
        success: true,
        message: 'Order processed successfully',
        paymentId: payment._id,
        transactionId,
        status: paymentStatus,
        order
      });
    }

    // Handle unknown types
    return res.status(400).json({
      success: false,
      message: 'Invalid payment type'
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment processing failed',
    });
  }
};

// Get all payments
export const getPayments = async (req, res) => {
  try {
    const { userId } = req.query;
    let filter = {};
    if (userId) filter.userId = userId;

    const payments = await Payment.find(filter).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'Payment ID is required' });

    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const { status } = req.body;
    if (!id) return res.status(400).json({ message: 'Payment ID is required' });
    if (!['pending', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const payment = await Payment.findByIdAndUpdate(id, { status }, { new: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    res.json({ message: 'Payment status updated', payment });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update donation payment status 
export const updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const { status } = req.body;

    if (!id) return res.status(400).json({ message: 'Payment ID is required' });
    if (!['pending', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (payment.type !== 'donation') {
      return res.status(400).json({ message: 'This payment is not a donation' });
    }

    payment.status = status;
    await payment.save();

    res.json({ message: 'Donation payment status updated', payment });
  } catch (error) {
    console.error('Error updating donation payment status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

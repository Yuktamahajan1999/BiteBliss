import Payment from '../Models/Payment.js';
import { v4 as uuidv4 } from 'uuid'; 

// Create a new payment record
export const createPayment = async (req, res) => {
  try {
    const { userId, method, cardDetails, type } = req.body;

    if (!method) {
      return res.status(400).json({ message: 'Payment method is required.' });
    }

    if (method === 'credit-card') {
      if (!cardDetails || !cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
        return res.status(400).json({ message: 'Complete card details are required for credit card payment.' });
      }
    }

    const transactionId = uuidv4();

    const payment = new Payment({
      userId,
      method,
      type: type || 'order',
      cardDetails: method === 'credit-card' ? cardDetails : undefined,
      transactionId,
      status: 'pending'
    });

    await payment.save();

    res.status(201).json({ message: 'Payment recorded', payment });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ message: 'Server error' });
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

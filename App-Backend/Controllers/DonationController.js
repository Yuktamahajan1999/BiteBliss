import Donation from '../Models/Donation.js';

// Create a new donation
export const createDonation = async (req, res) => {
  try {
    const { name, email, amount, message, paymentId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const newDonation = new Donation({
      name,
      email,
      amount,
      message,
      userId,
      paymentId,
    });

    await newDonation.save();

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: newDonation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating donation',
      error: error.message
    });
  }
};

// Get all donations
export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find();
    res.status(200).json({
      success: true,
      message: "Fetched all donations successfully",
      data: donations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching donations",
      error: error.message
    });
  }
};

// Get donations by user ID
export const getDonationsByUser = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "User ID is required" });

    const donations = await Donation.find({ userId: id });
    res.status(200).json({
      success: true,
      message: "Fetched donations by user",
      data: donations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching donations by user",
      error: error.message
    });
  }
};

// Update donation status
export const updateDonation = async (req, res) => {
  try {
    const { donationId, status } = req.body;
    if (!donationId || !status) return res.status(400).json({ error: "Donation ID and status are required" });

    if (!["pending", "completed", "failed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedDonation = await Donation.findByIdAndUpdate(donationId, { status }, { new: true });

    if (!updatedDonation) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.status(200).json({
      success: true,
      message: "Donation status updated successfully",
      data: updatedDonation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating donation status",
      error: error.message
    });
  }
};

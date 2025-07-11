import DeliveryPartner from '../Models/DeliveryPartner.js';

// Get all delivery partners
export const getAllDeliveryPartners = async (req, res) => {
  try {
    const data = await DeliveryPartner.find();
    res.status(200).json({
      success: true,
      message: "Fetched all delivery partners successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching delivery partners",
      error: err,
    });
  }
};

export const getDeliveryPartnerById = async (req, res) => {
  try {
    const id = req.query.id;

    const partner = await DeliveryPartner.findById(id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Delivery partner fetched successfully",
      data: partner,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching delivery partner",
      error: err,
    });
  }
};


// Create a new delivery partner
export const createDeliveryPartner = async (req, res) => {
  try {
    const { name, phone, vehicleId, assignedOrderId } = req.body;
    const newPartner = new DeliveryPartner({ name, phone, vehicleId, assignedOrderId });
    await newPartner.save();

    res.status(201).json({
      success: true,
      message: "Delivery partner created successfully",
      data: newPartner,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to create delivery partner",
      error: err,
    });
  }
};

// Update delivery partner 
export const updateDeliveryPartner = async (req, res) => {
  try {
    const id = req.query.id;
    const data = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Delivery partner ID is required",
      });
    }

    const updatedPartner = await DeliveryPartner.findByIdAndUpdate(id, data, { new: true });
    if (!updatedPartner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found to update",
      });
    }

    res.status(200).json({
      success: true,
      message: "Delivery partner updated successfully",
      data: updatedPartner,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating delivery partner",
      error: err,
    });
  }
};

// Delete delivery partner 
export const deleteDeliveryPartner = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Delivery partner ID is required",
      });
    }

    const deletedPartner = await DeliveryPartner.findByIdAndDelete(id);

    if (!deletedPartner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found to delete",
      });
    }

    res.status(200).json({
      success: true,
      message: "Delivery partner deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting delivery partner",
      error: err,
    });
  }
};


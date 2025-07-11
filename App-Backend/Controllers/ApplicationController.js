import Application from "../Models/Application.js";
import sendConfirmationEmail from '../Config/email.js';
import DeliveryPartner from "../Models/DeliveryPartner.js";
import ChefProfile from "../Models/ChefForm.js";
import User from "../Models/User.js";
// Create a new application
export const createApplication = async (req, res) => {
  try {
    console.log('Current user role:', req.user.role);
    const { name, email, phone, position, experience } = req.body;

    if (!name || !email || !phone || !position || !experience) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (req.user.role !== 'user') {
      return res.status(403).json({ message: "Only users can create applications" });
    }
    const existing = await Application.findOne({
      user: req.user.id,
      position
    });

    if (existing) {
      return res.status(400).json({ message: "You have already applied for this position" });
    }

    const application = new Application({
      user: req.user.id,
      name,
      email,
      phone,
      position,
      experience
    });

    await application.save();

    try {
      await sendConfirmationEmail({ name, email, position }, null);
    } catch (emailErr) {
    }

    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit application", error });
  }
};

// Get applications for user
export const getUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await Application.find({ user: userId });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user applications", error });
  }
};

// Get all applications
export const getApplications = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const applications = await Application.find();
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applications", error });
  }
};

// Update application status
export const updateStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized to update status" });
    }

    const { id } = req.query;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: "Application ID and status are required" });
    }

    if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();

    if (status === 'accepted') {
      const user = await User.findById(application.user);
      if (user) {
        user.status = 'approved';
        await user.save();
      }

      if (application.position === "Delivery Partner") {
        const existingPartner = await DeliveryPartner.findOne({ email: application.email });
        if (!existingPartner) {
          await DeliveryPartner.create({
            name: application.name,
            email: application.email,
            phone: application.phone,
            user: application.user,
            status: 'available'
          });
        }
      }

      if (application.position === "Chef") {
        const existingChef = await ChefProfile.findOne({ email: application.email });
        if (!existingChef) {
          await ChefProfile.create({
            chefName: application.name,
            email: application.email,
            specialty: "Multi-cuisine",
            cuisines: ["Indian"],
            price: 299,
            vegNonVeg: "both",
            signatureDishes: ["Chef Special Dish"],
            location: "Unknown",
            contactNumber: application.phone,
            bio: "Professional chef",
            isAvailable: true,
            status: "approved",
            isApproved: true,
            isHygienic: true,
            createdBy: application.user,
            menu: []
          });
        }
      }
    }

    try {
      await sendConfirmationEmail({
        name: application.name,
        email: application.email,
        position: application.position,
        status: application.status,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return res.status(200).json({
      message: "Status updated successfully",
      application
    });

  } catch (error) {
    console.error("Error in updateStatus:", error);
    return res.status(500).json({
      message: "Failed to update status",
      error: error.message
    });
  }
};

// Update application by user
export const updateApplicationByUser = async (req, res) => {
  try {
    const { id } = req.query;
    const { name, email, phone, position, experience } = req.body;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (position) updates.position = position;
    if (experience) updates.experience = experience;

    const updated = await Application.findByIdAndUpdate(id, updates, { new: true });

    res.status(200).json({ message: "Application updated successfully", application: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update application", error });
  }
};

// Delete application
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.query;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (
      req.user.role === 'user' &&
      application.user.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to delete this application" });
    }

    await application.deleteOne();
    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete application", error });
  }
};
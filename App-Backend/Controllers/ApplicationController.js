import Application from "../Models/Application.js";

// Create a new application
export const createApplication = async (req, res) => {
  try {
    const { name, email, phone, position, resumeUrl, experience } = req.body;

    if (!name || !email || !phone || !position || !resumeUrl || !experience) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Application.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Application with this email already exists" });
    }

    if (req.userRole !== 'user') {
      return res.status(403).json({ message: "Only users can create applications" });
    }

    const application = new Application({
      userId: req.userId,
      name,
      email,
      phone,
      position,
      resumeUrl,
      experience,
      status: 'pending',
    });

    await application.save();
    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit application", error });
  }
};

// Get applications for user 
export const getUserApplications = async (req, res) => {
  try {
    const userId = req.userId;

    const applications = await Application.find({ userId });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user applications", error });
  }
};


// Get all applications
export const getApplications = async (req, res) => {
  try {
    if (req.userRole !== 'restaurantOwner') {
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
    if (req.userRole !== 'restaurantOwner') {
      return res.status(403).json({ message: "Unauthorized to update status" });
    }

    const { id } = req.query;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Application.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: "Application not found" });

    res.status(200).json({ message: "Status updated", application: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status", error });
  }
};

// Delete application
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.query;

    const application = await Application.findById(id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (req.userRole === 'user') {
      if (application.userId.toString() !== req.userId) {
        return res.status(403).json({ message: "Not authorized to delete this application" });
      }
    } else if (req.userRole !== 'restaurantOwner') {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    await application.deleteOne();
    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete application", error });
  }
};

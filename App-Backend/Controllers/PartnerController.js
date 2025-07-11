import PartnerApplication from '../Models/PartnerApplication.js';

// Create a new partner application
export const createPartnerApplication = async (req, res) => {
  try {
    const data = req.body;

    if (!req.user || !req.user.id || !req.user.role) {
      return res.status(401).json({ message: 'Unauthorized: user info missing' });
    }

    data.submittedBy = {
      userId: req.user.id,
      role: req.user.role,
    };

    const application = new PartnerApplication(data);
    await application.save();

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (err) {
    res.status(400).json({ message: 'Failed to submit application', error: err.message });
  }
};

// Get all applications 
export const getAllPartnerApplications = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.email) filter.email = req.query.email;

    if (req.user.role === 'restaurantowner') {
      filter['submittedBy.userId'] = req.user.id;
    }

    const applications = await PartnerApplication.find(filter);
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch applications', error: err.message });
  }
};

// Get a single application
export const getSingleApplication = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "id query parameter is required" });

    const application = await PartnerApplication.findById(id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (
      req.user.role === 'restaurantowner' &&
      application.submittedBy.userId !== req.user.id
    ) {
      return res.status(403).json({ message: "Unauthorized to view this application" });
    }

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch application", error: err.message });
  }
};

// Update application status
export const updatePartnerApplication = async (req, res) => {
  try {
    const { id } = req.query;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: 'Both "id" and "status" are required parameters.' });
    }

    if (!['pending', 'approved', 'rejected', 'accepted', 'reviewed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const updated = await PartnerApplication.findByIdAndUpdate(id, { status }, { new: true });

    if (!updated) return res.status(404).json({ message: 'Application not found' });
    if (status === 'accepted') {
      res.status(200).json({
        message: 'Application accepted. Please complete your restaurant profile.',
        application: updated,
        nextStep: 'Please submit detailed restaurant information to complete onboarding.'
      });
    }
    res.json({ message: 'Status updated', application: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
};

// Delete application
export const deletepartnerApplication = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'id query parameter is required' });

    const deleted = await PartnerApplication.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Application not found' });

    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete application', error: err.message });
  }
};

// Approved Application 
export const getApprovedApplication = async (req, res) => {
  try {
    const userId = req.user.id;

    const application = await PartnerApplication.findOne({
      'submittedBy.userId': userId
    });

    if (!application) {
      return res.status(404).json({ message: 'No application found' });
    }

    res.json({ status: application.status });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching application', error: err.message });
  }
};


// Update the application
export const updatePartnerAppDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Application ID is required' });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'At least one field to update is required' });
    }

    const updatedApplication = await PartnerApplication.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true } 
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({ message: 'Application field(s) updated successfully', application: updatedApplication });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update application', error: err.message });
  }
};
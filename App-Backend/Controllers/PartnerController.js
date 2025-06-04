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

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updated = await PartnerApplication.findByIdAndUpdate(id, { status }, { new: true });

    if (!updated) return res.status(404).json({ message: 'Application not found' });

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

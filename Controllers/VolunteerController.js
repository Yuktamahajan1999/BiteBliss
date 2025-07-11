import Volunteer from '../Models/Volunteer.js';

// Create new volunteer
export const createVolunteer = async (req, res) => {
    try {
        const { name, email, phone, address, interests } = req.body;
        if (!name || !email || !phone || !address || !interests) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newVolunteer = new Volunteer({ name, email, phone, address, interests });
        await newVolunteer.save();
        res.status(201).json({ success: true, data: newVolunteer });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all volunteers
export const getAllVolunteers = async (req, res) => {
    try {
        const volunteers = await Volunteer.find();
        res.status(200).json({ success: true, data: volunteers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// update volunteer 
export const updateVolunteer = async (req, res) => {
    const id = req.query.id; 
    const { name, email, phone, address, interests } = req.body;

    if (!id) return res.status(400).json({ error: "Volunteer ID required" });

    try {
        const updated = await Volunteer.findByIdAndUpdate(
            id,
            { name, email, phone, address, interests },
            { new: true }
        );

        if (!updated) return res.status(404).json({ error: "Volunteer not found" });

        res.status(200).json({ success: true, message: "Volunteer updated", data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get volunteer 
export const getVolunteerById = async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Volunteer ID is required" });

    try {
        const volunteer = await Volunteer.findById(id);
        if (!volunteer) return res.status(404).json({ error: "Volunteer not found" });

        res.status(200).json({ success: true, data: volunteer });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


// Delete volunteer 
export const deleteVolunteer = async (req, res) => {
    const id = req.query.id; 
    if (!id) return res.status(400).json({ error: "Volunteer ID required" });

    try {
        const deleted = await Volunteer.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: "Volunteer not found" });

        res.status(200).json({ success: true, message: "Volunteer deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

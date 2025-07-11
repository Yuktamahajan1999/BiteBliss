import Address from '../Models/LocationModel.js';

// Create address
export const createAddress = async (req, res) => {
    try {
        const { name, address, phone, pincode, city, state, country } = req.body;
        const userId = req.user.id;

        const newAddress = await Address.create({
            name,
            address,
            phone,
            pincode,
            city,
            state,
            country,
            userId
        });

        res.status(201).json(newAddress);
    } catch (error) {
        res.status(500).json({ message: "Failed to create address", error });
    }
};



// Get Address of user
export const getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const addresses = await Address.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: "Failed to get addresses", error });
    }
};

// Update Address by ID
export const updateAddress = async (req, res) => {
    try {
        const { id } = req.query;
        const { name, address, phone, pincode, city, state, country } = req.body;

        if (!id) return res.status(400).json({ message: "Address ID is required." });

        const updated = await Address.findByIdAndUpdate(
            id,
            { name, address, phone, pincode, city, state, country },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: "Address not found." });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Failed to update address", error });
    }
};


// Delete Address by ID
export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) return res.status(400).json({ message: "Address ID is required." });

        const deleted = await Address.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Address not found." });

        res.status(200).json({ message: "Address deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete address", error });
    }
};

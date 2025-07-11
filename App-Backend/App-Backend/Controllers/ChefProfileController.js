import ChefProfile from '../Models/ChefForm.js';

// Create a new Chef Profile
export const createChefProfile = async (req, res) => {
    try {
        const body = {
            ...req.body,
            isHygienic: Boolean(req.body.isHygienic),
            isAvailable: Boolean(req.body.isAvailable)
        };


        const chefProfile = new ChefProfile({
            ...body,
            createdBy: req.user.id
        });

        await chefProfile.save();
        res.status(201).json(chefProfile);
    } catch (error) {
        console.error('Validation error:', error);
        res.status(400).json({ error: error.message });
    }
};
// Get all Chef Profiles
export const getChefProfiles = async (req, res) => {
    try {
        const { id } = req.query;

        if (id) {
            const chef = await ChefProfile.findById(id);
            if (!chef) return res.status(404).json({ error: 'Chef profile not found' });
            return res.json(chef);
        }

        const chefs = await ChefProfile.find();
        res.json(chefs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single Chef Profile 
export const getmychefprofile = async (req, res) => {
    try {
        const { id } = req.query;
        const userId = req.user.id;

        if (!id && !userId) {
            return res.status(400).json({ error: 'Either ID or authenticated user required' });
        }

        const query = id ? { _id: id } : { createdBy: userId };
        const chef = await ChefProfile.findOne(query);

        if (!chef) {
            return res.status(404).json({ error: 'Chef profile not found' });
        }

        res.json(chef);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a Chef Profile 
export const updateChefProfile = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) return res.status(400).json({ error: 'Missing chef profile ID in query' });

        const updateData = {
            ...req.body,
            createdBy: req.user.id
        };

        const updatedChef = await ChefProfile.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedChef) return res.status(404).json({ error: 'Chef profile not found' });
        res.json(updatedChef);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a Chef Profile 
export const deleteChefProfile = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) return res.status(400).json({ error: 'Missing chef profile ID in query' });

        const deletedChef = await ChefProfile.findByIdAndDelete(id);
        if (!deletedChef) return res.status(404).json({ error: 'Chef profile not found' });

        res.json({ message: 'Chef profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


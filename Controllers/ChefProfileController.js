import ChefProfile from '../Models/ChefForm.js';
import Application from '../Models/Application.js';
import mongoose from 'mongoose';
export const createChefProfile = async (req, res) => {
    try {
        const signatureDishes = Array.isArray(req.body.signatureDishes)
            ? req.body.signatureDishes
            : typeof req.body.signatureDishes === 'string'
                ? req.body.signatureDishes.split(',').map(item => item.trim())
                : [];

        const menu = Array.isArray(req.body.menu)
            ? req.body.menu
            : typeof req.body.menu === 'string'
                ? req.body.menu.split(',').map(item => item.trim())
                : [];

        const body = {
            ...req.body,
            isHygienic: Boolean(req.body.isHygienic),
            isAvailable: Boolean(req.body.isAvailable),
            signatureDishes,
            menu
        };

        const chefProfile = new ChefProfile({
            ...body,
            createdBy: req.user.id
        });

        await chefProfile.save();
        res.status(201).json(chefProfile);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


export const getChefProfiles = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:8000/chefform/getmychefProfile', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data) {
            const profile = response.data;
            setChefId(profile._id);
            setFormData({
                ...initialFormState,
                ...profile,
                cuisines: Array.isArray(profile.cuisines) ? profile.cuisines : [],
                signatureDishes: Array.isArray(profile.signatureDishes)
                    ? profile.signatureDishes.join(', ')
                    : profile.signatureDishes || '',
                menu: Array.isArray(profile.menu) ? profile.menu.join(', ') : profile.menu || '',
            });
            setIsEditing(true);
            setIsApproved(profile.isApproved ?? false);
            setChefStatus(profile.status || 'pending');
        }
    } catch (error) {
        console.error('Error in getChefProfile:', error);
        setIsApproved(false);
        setChefStatus('error');
    }
};
export const approveChefProfile = async (req, res) => {
    try {
        const { id } = req.query;

        const updatedChef = await ChefProfile.findByIdAndUpdate(
            id,
            {
                status: 'approved',
                isApproved: true
            },
            { new: true }
        );

        if (updatedChef?.createdBy) {
            await User.findByIdAndUpdate(updatedChef.createdBy, {
                status: 'approved'
            });
        }

        res.json(updatedChef);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMyChefProfile = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        let chef = await ChefProfile.findOne({ createdBy: userId });

        if (!chef) {
            const application = await Application.findOne({
                user: userId,
                position: "Chef",
                status: "accepted"
            });

            if (application) {

                chef = await ChefProfile.findOne({
                    $or: [{ createdBy: application.user }, { email: application.email }]
                });

                if (chef && !chef.createdBy.equals(userId)) {
                    chef.createdBy = userId;
                    await chef.save();
                }
            }
        }

        if (!chef) {
            return res.status(404).json({ error: 'Profile not found', isProfileFound: false });
        }

        res.status(200).json({
            ...chef.toObject(),
            signatureDishes: chef.signatureDishes.join(', '),
            menu: chef.menu.join(', ')
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const updateChefProfile = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'Missing chef profile ID' });

        const signatureDishes = Array.isArray(req.body.signatureDishes)
            ? req.body.signatureDishes
            : typeof req.body.signatureDishes === 'string'
                ? req.body.signatureDishes.split(',').map(item => item.trim())
                : [];

        const menu = Array.isArray(req.body.menu)
            ? req.body.menu
            : typeof req.body.menu === 'string'
                ? req.body.menu.split(',').map(item => item.trim())
                : [];

        const updateData = {
            ...req.body,
            signatureDishes,
            menu,
            createdBy: req.user.id
        };

        const updatedChef = await ChefProfile.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        console.log("[updateChefProfile] Incoming body:", req.body);
        if (!updatedChef) return res.status(404).json({ error: 'Chef profile not found' });
        res.json(updatedChef);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


export const deleteChefProfile = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'Missing chef profile ID' });

        const deletedChef = await ChefProfile.findByIdAndDelete(id);
        if (!deletedChef) return res.status(404).json({ error: 'Chef profile not found' });

        res.json({ message: 'Chef profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
import ChefBooking from '../Models/ChefBooking.js';
import ChefProfile from '../Models/ChefForm.js';
import { CateringBooking } from '../Models/CorporateCatering.js'
import { ChefStatus } from '../Models/CorporateCatering.js';

export const bookCatering = async (req, res) => {
    try {
        const { name, email, address, date, specialRequests, chefName, headCount, phone, eventTime, menu } = req.body;

        if (!name || !email || !address || !date || !headCount || !phone) {
            return res.status(400).json({ success: false, message: "All required fields must be provided" });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: "User authentication required" });
        }

        let chefProfile = null;
        if (chefName) {
            chefProfile = await ChefProfile.findOne({ chefName });
        }
        const booking = await CateringBooking.create({
            name,
            email,
            address,
            date,
            specialRequests,
            headCount,
            phone,
            eventTime,
            menu,
            user: req.user.id,
            chef: chefProfile ? chefProfile._id : undefined,
            chefName: chefName || undefined
        });

        if (chefProfile) {
            await ChefBooking.create({
                chef: chefProfile._id,
                user: req.user.id,
                customerName: name,
                customerPhone: phone,
                headCount: headCount,
                eventType: "corporate",
                eventDate: date,
                location: address,
                notes: specialRequests,
                eventTime,
                menu,
                cateringBookingId: booking._id
            });
        }

        res.status(201).json({
            success: true,
            message: "Catering booked successfully",
            booking
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Booking failed",
            error: err.message
        });
    }
};

// Get all bookings 
export const getAllBookings = async (req, res) => {
    try {
        let bookings;
        if (req.user.role === 'chef') {
            bookings = await ChefBooking.find({ chef: req.user.id })
                .populate('user', 'name email phone')
                .populate('chef', 'chefName specialty');
        } else {
            bookings = await CateringBooking.find({ user: req.user.id })
                .populate({
                    path: 'chef',
                    select: 'chefName specialty cuisines',
                    model: 'ChefProfile'
                })
                .select('name email address date eventTime status chefName')
                .sort({ createdAt: -1 });
        }
        res.status(200).json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
            error: err.message
        });
    }
};
// Get available chefs
export const getAvailableChefs = async (req, res) => {
    try {
        const { address, cuisine, minPrice, maxPrice } = req.query;

        const query = {
            isAvailable: true,
            isApproved: true,
            status: 'approved'
        };

        if (address) {
            const addressParts = address.split(',');
            const city = addressParts[addressParts.length - 1].trim();
            query.location = {
                $regex: new RegExp(city, 'i')
            };
        }

        if (cuisine) {
            query.$or = [
                { specialty: { $regex: new RegExp(cuisine, 'i') } },
                { cuisines: { $in: [new RegExp(cuisine, 'i')] } }
            ];
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const chefs = await ChefProfile.find(query)
            .select('-__v -createdAt -updatedAt')
            .populate('ratings.reviewer', 'name')
            .sort({ price: 1 });

        res.status(200).json({
            success: true,
            count: chefs.length,
            chefs: chefs.map(chef => ({
                id: chef._id,
                name: chef.chefName,
                specialty: chef.specialty,
                cuisines: chef.cuisines,
                price: chef.price,
                location: chef.location,
                rating: chef.rating || 0,
                ratings: chef.ratings || [],
                signatureDishes: chef.signatureDishes,
                isVeg: chef.vegNonVeg === 'veg',
                isAvailable: chef.isAvailable,
                chefName: chef.chefName
            }))
        });
    } catch (err) {
        console.error('Error fetching chefs:', err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch available chefs",
            error: err.message
        });
    }
};

// Update chef availability status
export const updateChefStatus = async (req, res) => {
    const chefName = req.user.name;
    const { isAvailable, statusMessage } = req.body;

    if (!chefName) {
        return res.status(400).json({ success: false, message: "Chef name is required" });
    }

    try {
        const chef = await ChefStatus.findOne({ chefName });

        if (!chef) {
            return res.status(404).json({ success: false, message: "Chef not found" });
        }
        const updatedChef = await ChefStatus.findOneAndUpdate(
            { chefName },
            {
                isAvailable,
                statusMessage,
                ratings: chef.ratings,
            },
            { new: true }
        );

        res.status(200).json({ success: true, message: "Chef status updated", chef: updatedChef });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update status", error: err.message });
    }
};

// Add rating for a chef
export const addChefRating = async (req, res) => {
    try {
        const { id, rating, comment, reviewer } = req.body;

        const booking = await CateringBooking.findById(id);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        let chef = booking.chef ? await ChefProfile.findById(booking.chef) : null;
        if (!chef && booking.chefName) {
            chef = await ChefProfile.findOne({ chefName: booking.chefName }) ||
                await ChefStatus.findOne({ chefName: booking.chefName });
        }

        if (!chef) {
            return res.status(400).json({ success: false, message: "No chef found to rate" });
        }

        chef.ratings = chef.ratings || [];
        chef.ratings.push({
            reviewer: reviewer || "Anonymous",
            comment: comment || "No comment provided",
            rating,
            date: new Date()
        });

        const totalRatings = chef.ratings.length;
        chef.rating = chef.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
        await chef.save();

        const update = {
            rated: true,
            rating,
            comment,
            status: booking.status || 'completed'
        };

        const updatedBooking = await CateringBooking.findByIdAndUpdate(
            id,
            update,
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Rating added successfully",
            booking: {
                id: updatedBooking._id,
                status: updatedBooking.status,
                rated: updatedBooking.rated,
                rating: updatedBooking.rating
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to add rating",
            error: err.message,
        });
    }
};

// Update user’s catering booking details
export const updateUserBooking = async (req, res) => {
    try {
        const id = req.user.id
        const bookingId = req.query.id;

        const booking = await CateringBooking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (!booking.user || booking.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own booking",
            });
        }


        const updateFields = {};
        const allowedFields = ['name', 'email', 'address', 'date', 'specialRequests', 'phone', 'headCount'];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateFields[field] = req.body[field];
            }
        });

        const updatedBooking = await CateringBooking.findByIdAndUpdate(
            bookingId,
            updateFields,
            { new: true }
        );

        res.status(200).json({ success: true, message: "Booking updated", booking: updatedBooking });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update booking", error: err.message });
    }
};

// Accept Booking
export const acceptBooking = async (req, res) => {
    const { id } = req.query;
    const booking = await ChefBooking.findByIdAndUpdate(
        id,
        { status: 'accepted' },
        { new: true, runValidators: true }
    );

    if (booking && booking.cateringBookingId) {
        await CateringBooking.findByIdAndUpdate(
            booking.cateringBookingId,
            { status: 'accepted' }
        );
    }

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
};

// Cancel Booking
export const cancelBooking = async (req, res) => {
    const { id } = req.query;

    const booking = await ChefBooking.findByIdAndUpdate(
        id,
        { status: 'cancelled' },
        { new: true, runValidators: true }
    );

    if (booking && booking.cateringBookingId) {
        await CateringBooking.findByIdAndUpdate(
            booking.cateringBookingId,
            { status: 'cancelled' }
        );
    }

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
};

// Complete Booking
export const completeBooking = async (req, res) => {
    const { id } = req.query;

    const booking = await ChefBooking.findByIdAndUpdate(
        id,
        { status: 'completed' },
        { new: true, runValidators: true }
    );

    if (booking && booking.cateringBookingId) {
        await CateringBooking.findByIdAndUpdate(
            booking.cateringBookingId,
            { status: 'completed' }
        );
    }

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
};

// Chef Arrival
export const chefArrival = async (req, res) => {
    const { id } = req.query;
    const booking = await ChefBooking.findByIdAndUpdate(
        id,
        { status: 'arrived' },
        { new: true, runValidators: true }
    );
    if (booking && booking.cateringBookingId) {
        await CateringBooking.findByIdAndUpdate(
            booking.cateringBookingId,
            { status: 'arrived' }
        );
    }
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
};
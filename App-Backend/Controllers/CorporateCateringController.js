import ChefBooking from '../Models/ChefBooking.js';
import ChefProfile from '../Models/ChefForm.js';
import { CateringBooking } from '../Models/CorporateCatering.js'

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
        const bookings = await CateringBooking.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch bookings", error: err.message });
    }
};

// Get available chefs
export const getAvailableChefs = async (req, res) => {
    try {
        const chefs = await ChefProfile.find({ isAvailable: true })
            .select('chefName  isAvailable menu specialty cuisines price vegNonVeg signatureDishes location bio contactNumber');
        res.status(200).json({ success: true, count: chefs.length, chefs });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch available chefs", error: err.message });
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
        const { reviewer, comment, rating } = req.body;
        const { id } = req.query;

        if (!id || !reviewer || !comment || typeof rating !== 'number') {
            return res.status(400).json({
                success: false,
                message: "id, reviewer, comment, and rating are required",
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }

        const chef = await ChefStatus.findById(id);
        if (!chef) {
            return res.status(404).json({
                success: false,
                message: "Chef not found",
            });
        }

        chef.ratings.push({ reviewer, comment, rating, date: new Date() });
        await chef.save();

        res.status(200).json({
            success: true,
            message: "Rating added",
            chef,
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
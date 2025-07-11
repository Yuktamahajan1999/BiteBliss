import TableBooking from "../Models/Booking.js";
import Restaurant from "../Models/Restaurant.js";
import { uploadToCloudinary } from "../Middlewares/UploadMiddleware.js";
//  Create a booking
export const createTableBooking = async (req, res) => {
  try {
    const {
      fullName, email, phoneNumber,
      bookingDate, bookingTime,
      numberOfGuests, specialRequests,
      restaurantId, experiences,
    } = req.body;


    if (!fullName || !email || !phoneNumber || !bookingDate || !bookingTime || !numberOfGuests || !restaurantId) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    if (numberOfGuests <= 0) {
      return res.status(400).json({ error: "Number of guests must be greater than zero" });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    if (!restaurant.diningAvailability) {
      return res.status(400).json({ error: "This restaurant does not offer dining services" });
    }

    const existingBooking = await TableBooking.findOne({
      email,
      restaurantId,
      bookingDate,
      bookingTime
    });

    if (existingBooking) {
      return res.status(400).json({
        error: "You have already booked this restaurant for the selected date and time."
      });
    }

    const userId = req.user.id;

    const newBooking = new TableBooking({
      fullName,
      email,
      phoneNumber,
      bookingDate,
      bookingTime,
      numberOfGuests,
      specialRequests,
      restaurantId,
      userId : req.user.id,
      experiences,
    });

    await newBooking.save();

    res.status(201).json({ message: "Table booking created successfully", booking: newBooking });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Get all bookings
export const getAllTableBookings = async (req, res) => {
  try {
    const bookings = await TableBooking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update booking 

export const updateTableBooking = async (req, res) => {
  try {
    const { id } = req.query;
    const { status, experiences } = req.body;

    const updateQuery = {};
    if (status) updateQuery.status = status;
    if (experiences) {
      updateQuery.$push = { experiences }; 
    }

    const updatedBooking = await TableBooking.findByIdAndUpdate(id, updateQuery, {
      new: true,
      runValidators: true,
    });

    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Delete a booking
export const deleteTableBooking = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "Booking ID is required" });

    const deleted = await TableBooking.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Booking not found" });

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get bookings by user

export const getBookingsByUser = async (req, res) => {
  try {
    const userId = req.query.id || req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const bookings = await TableBooking.find({ userId });

    if (!bookings.length) {
      return res.status(404).json({ error: "No bookings found for this user" });
    }

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add experience to a booking
export const addExperience = async (req, res) => {
  try {
    const { id } = req.query;
    const { text, media } = req.body;

    if (!id || !text) {
      return res.status(400).json({ error: "Booking ID and experience text are required" });
    }

    const booking = await TableBooking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const uploadedMedia = [];
    if (req.files && req.files.length) {
      for (const file of req.files) {
        const cloudResult = await uploadToCloudinary(file.buffer, "experiences");
        uploadedMedia.push({
          mediaUrl: cloudResult.secure_url,
          mediaType: file.mimetype.startsWith('image/') ? 'image' : 'video'
        });
      }
    }
    const bodyMedia = Array.isArray(media) ? media : [];

    booking.experiences.push({
      text,
      media: [...bodyMedia, ...uploadedMedia]
    });

    await booking.save();

    res.status(200).json({ message: "Experience added", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Restaurant Bookings 
export const getBookingsByRestaurant = async (req, res) => {
  try {
    const restaurantId = req.query.id;

    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }

    const bookings = await TableBooking.find({ restaurantId });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





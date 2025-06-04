import GroupDiningBooking from '../Models/GroupDining.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const booking = new GroupDiningBooking(req.body);
    await booking.save();
    res.status(201).json({ success: true, message: 'Booking created', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating booking', error: error.message });
  }
};

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await GroupDiningBooking.find();
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bookings', error: error.message });
  }
};

// Get booking by email
export const getBookingByEmail = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: 'Email query is required' });

  try {
    const bookings = await GroupDiningBooking.find({ email });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status500.json({ success: false, message: 'Error fetching bookings by email', error: error.message });
  }
};

// Update booking details
export const updateBooking = async (req, res) => {
  const { bookingId } = req.query;
  if (!bookingId) return res.status(400).json({ success: false, message: 'bookingId query is required' });

  try {
    const updated = await GroupDiningBooking.findByIdAndUpdate(bookingId, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Booking not found' });

    res.status(200).json({ success: true, message: 'Booking updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating booking', error: error.message });
  }
};

// Delete booking
export const deleteBooking = async (req, res) => {
  const { bookingId } = req.query;
  if (!bookingId) return res.status(400).json({ success: false, message: 'bookingId query is required' });

  try {
    const deleted = await GroupDiningBooking.findByIdAndDelete(bookingId);
    if (!deleted) return res.status(404).json({ success: false, message: 'Booking not found' });

    res.status(200).json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting booking', error: error.message });
  }
};
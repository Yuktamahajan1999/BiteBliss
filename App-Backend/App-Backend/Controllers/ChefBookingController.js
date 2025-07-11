import ChefBooking from '../Models/ChefBooking.js';
import { CateringBooking } from '../Models/CorporateCatering.js';

// Create a new Booking
export const createChefBooking = async (req, res) => {
  try {
    const booking = new ChefBooking(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all bookings
export const getAllChefBookings = async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      const booking = await ChefBooking.findById(id).populate('chef');
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      return res.json(booking);
    }

    const bookings = await ChefBooking.find().populate('chef');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// getchef Booking
export const getBookingsByChef = async (req, res) => {
  try {
    const id = req.query.id;

    const bookings = await ChefBooking.find({ chef: id }).populate('chef');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update booking 
export const updateChefBooking = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing booking ID in query' });

    const updatedBooking = await ChefBooking.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedBooking) return res.status(404).json({ error: 'Booking not found' });
    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete booking 
export const deleteChefBooking = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing booking ID in query' });

    const deletedBooking = await ChefBooking.findByIdAndDelete(id);
    if (!deletedBooking) return res.status(404).json({ error: 'Booking not found' });

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Accept Booking
export const acceptChefBooking = async (req, res) => {
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
export const cancelChefBooking = async (req, res) => {
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
export const completeChefBooking = async (req, res) => {
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

// Chef Arrived 
export const chefArrived = async (req, res) => {
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
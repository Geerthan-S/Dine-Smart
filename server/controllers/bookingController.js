const Booking = require('../models/Booking');
const Table = require('../models/Table');
const crypto = require('crypto');

// POST /api/bookings — create a booking
const createBooking = async (req, res) => {
  try {
    const { restaurantId, tableId, date, time, numberOfPeople } = req.body;

    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    if (table.capacity < numberOfPeople) {
      return res.status(400).json({ message: `Table capacity (${table.capacity}) is less than number of people` });
    }

    const existingBooking = await Booking.findOne({ tableId, date, time, status: 'confirmed' });
    if (existingBooking) {
      return res.status(409).json({ message: 'This table is already booked for the selected date and time' });
    }

    // Generate unique QR token
    const qrToken = crypto.randomUUID();

    const booking = await Booking.create({
      userId: req.user._id,
      restaurantId,
      tableId,
      date,
      time,
      numberOfPeople,
      qrToken,
    });

    await booking.populate(['restaurantId', 'tableId']);
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('restaurantId', 'name location cuisine image area')
      .populate('tableId', 'tableNumber capacity')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/bookings/all (admin)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('restaurantId', 'name location')
      .populate('tableId', 'tableNumber capacity')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('restaurantId')
      .populate('tableId', 'tableNumber capacity')
      .populate('userId', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/bookings/checkin/:token  (public — called from QR scan)
const checkinByToken = async (req, res) => {
  try {
    const booking = await Booking.findOne({ qrToken: req.params.token })
      .populate('restaurantId', 'name area image')
      .populate('userId', 'name email')
      .populate('tableId', 'tableNumber capacity');

    if (!booking) return res.status(404).json({ message: 'Invalid or expired QR token' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'This booking has been cancelled' });
    if (booking.checkedIn) {
      return res.json({ alreadyCheckedIn: true, booking, message: 'Already checked in' });
    }

    booking.checkedIn = true;
    booking.checkInTime = new Date();
    await booking.save();

    res.json({ success: true, message: `✅ Welcome! ${booking.userId.name} checked in at ${booking.restaurantId.name}`, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/bookings/:id/qr  (user gets their own QR token info)
const getBookingQR = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('restaurantId', 'name area image')
      .populate('tableId', 'tableNumber capacity');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      qrToken: booking.qrToken,
      checkedIn: booking.checkedIn,
      checkInTime: booking.checkInTime,
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getMyBookings, getAllBookings, getBookingById, cancelBooking, checkinByToken, getBookingQR };

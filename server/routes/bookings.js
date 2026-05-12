const express = require('express');
const router = express.Router();
const {
  createBooking, getMyBookings, getAllBookings, getBookingById,
  cancelBooking, checkinByToken, getBookingQR,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/all', protect, adminOnly, getAllBookings);
// QR check-in — public (no auth needed, token is the secret)
router.post('/checkin/:token', checkinByToken);
router.get('/:id/qr', protect, getBookingQR);
router.get('/:id', protect, getBookingById);
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;

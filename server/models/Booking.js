const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    date: { type: String, required: [true, 'Booking date is required'] },
    time: { type: String, required: [true, 'Booking time is required'] },
    numberOfPeople: { type: Number, required: [true, 'Number of people is required'], min: 1 },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    // QR Check-in
    qrToken: { type: String, unique: true, sparse: true },
    checkedIn: { type: Boolean, default: false },
    checkInTime: { type: Date, default: null },
  },
  { timestamps: true }
);

bookingSchema.index({ qrToken: 1 });
bookingSchema.index({ restaurantId: 1, date: 1 });
bookingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);

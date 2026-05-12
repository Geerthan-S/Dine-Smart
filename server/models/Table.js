const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    tableNumber: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Table capacity is required'],
      min: 1,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

tableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });
tableSchema.index({ restaurantId: 1, capacity: 1 });

module.exports = mongoose.model('Table', tableSchema);

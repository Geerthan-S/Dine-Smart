const Table = require('../models/Table');
const Booking = require('../models/Booking');

// GET /api/tables/:restaurantId — get all tables for a restaurant
const getTablesByRestaurant = async (req, res) => {
  try {
    const tables = await Table.find({ restaurantId: req.params.restaurantId });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/tables — create a table (admin)
const createTable = async (req, res) => {
  try {
    const { restaurantId, tableNumber, capacity } = req.body;
    const table = await Table.create({ restaurantId, tableNumber, capacity });
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      {
        tableNumber: req.body.tableNumber,
        capacity: req.body.capacity,
        isAvailable: req.body.isAvailable,
      },
      { new: true, runValidators: true }
    );
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json({ message: 'Table deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/tables/available/:restaurantId — get available tables for date+time
const getAvailableTables = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { date, time, numberOfPeople } = req.query;

    // Get all tables for this restaurant with sufficient capacity
    const allTables = await Table.find({
      restaurantId,
      capacity: { $gte: Number(numberOfPeople) || 1 },
    });

    // Get already-booked table IDs for this date + time slot
    const bookedBookings = await Booking.find({
      restaurantId,
      date,
      time,
      status: 'confirmed',
    });

    const bookedTableIds = bookedBookings.map((b) => b.tableId.toString());

    // Filter out booked tables
    const availableTables = allTables.filter(
      (t) => !bookedTableIds.includes(t._id.toString())
    );

    res.json(availableTables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTablesByRestaurant, createTable, updateTable, deleteTable, getAvailableTables };

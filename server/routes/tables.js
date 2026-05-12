const express = require('express');
const router = express.Router();
const { getTablesByRestaurant, createTable, updateTable, deleteTable, getAvailableTables } = require('../controllers/tableController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/available/:restaurantId', protect, getAvailableTables);
router.get('/:restaurantId', protect, getTablesByRestaurant);
router.post('/', protect, adminOnly, createTable);
router.patch('/:id', protect, adminOnly, updateTable);
router.delete('/:id', protect, adminOnly, deleteTable);

module.exports = router;

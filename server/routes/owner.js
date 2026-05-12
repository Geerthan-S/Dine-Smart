const express = require('express');
const router = express.Router();
const {
  getOwnerRestaurants,
  getOwnerDashboard,
  replyToReview,
  setDynamicPricing,
  updateMenu,
  assignOwner,
  listUsers,
  deleteUser,
  updateUserRole,
} = require('../controllers/ownerController');
const { protect, ownerOrAdmin, adminOnly } = require('../middleware/auth');

// Owner routes
router.get('/restaurants', protect, ownerOrAdmin, getOwnerRestaurants);
router.get('/dashboard/:restaurantId', protect, ownerOrAdmin, getOwnerDashboard);
router.post('/restaurants/:restaurantId/reviews/:reviewId/reply', protect, ownerOrAdmin, replyToReview);
router.patch('/restaurants/:restaurantId/dynamic-pricing', protect, ownerOrAdmin, setDynamicPricing);
router.put('/restaurants/:restaurantId/menu', protect, ownerOrAdmin, updateMenu);

// Admin-only owner management
router.post('/assign', protect, adminOnly, assignOwner);
router.get('/users', protect, adminOnly, listUsers);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.patch('/users/:id/role', protect, adminOnly, updateUserRole);

module.exports = router;

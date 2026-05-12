const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurantMeta,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  toggleFavorite,
  getFavorites,
  addReview,
  searchMenu,
  buildItinerary,
  getAdminAnalytics,
  fetchAndStoreFromGoogle,
} = require('../controllers/restaurantController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/fetch', fetchAndStoreFromGoogle);
router.get('/meta', getRestaurantMeta);
router.get('/favorites/my', protect, getFavorites);
router.get('/menu/search', searchMenu);
router.get('/itinerary/plan', protect, buildItinerary);
router.get('/admin/analytics', protect, adminOnly, getAdminAnalytics);
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);
router.post('/', protect, adminOnly, createRestaurant);
router.patch('/:id', protect, adminOnly, updateRestaurant);
router.post('/:id/favorite', protect, toggleFavorite);
router.post('/:id/reviews', protect, addReview);
router.delete('/:id', protect, adminOnly, deleteRestaurant);

module.exports = router;

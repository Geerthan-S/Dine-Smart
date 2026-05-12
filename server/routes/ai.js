const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/recommend', protect, getRecommendations);

module.exports = router;

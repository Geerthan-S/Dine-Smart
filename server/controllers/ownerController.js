const Restaurant = require('../models/Restaurant');
const Booking = require('../models/Booking');
const User = require('../models/User');

// GET /api/owner/restaurants — get all restaurants the logged-in owner manages
const getOwnerRestaurants = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('ownedRestaurants');
    if (req.user.role === 'admin') {
      const all = await Restaurant.find().sort({ name: 1 });
      return res.json(all);
    }
    res.json(user.ownedRestaurants || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/owner/dashboard/:restaurantId — full analytics
const getOwnerDashboard = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    // Fetch all bookings for this restaurant
    const allBookings = await Booking.find({ restaurantId })
      .populate('userId', 'name email')
      .populate('tableId', 'tableNumber capacity')
      .sort({ date: -1, time: -1 });

    const confirmed = allBookings.filter((b) => b.status === 'confirmed');
    const cancelled = allBookings.filter((b) => b.status === 'cancelled');
    const checkedIn = allBookings.filter((b) => b.checkedIn);
    const revenueProxy = confirmed.length * (restaurant.avgCostForTwo || 0);

    // Peak hours — count bookings per time slot
    const peakHours = {};
    allBookings.forEach((b) => {
      peakHours[b.time] = (peakHours[b.time] || 0) + 1;
    });
    const peakHoursArray = Object.entries(peakHours)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time));

    // Calendar data — count bookings per date (last 60 days)
    const calendarData = {};
    allBookings.forEach((b) => {
      calendarData[b.date] = (calendarData[b.date] || 0) + 1;
    });

    // Today's bookings
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = allBookings.filter((b) => b.date === today);

    // Rating breakdown
    const reviews = restaurant.reviews || [];
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => { ratingBreakdown[Math.floor(r.rating)] = (ratingBreakdown[Math.floor(r.rating)] || 0) + 1; });

    // Recent bookings (last 10)
    const recentBookings = allBookings.slice(0, 10);

    res.json({
      restaurant,
      stats: {
        totalBookings: allBookings.length,
        confirmedBookings: confirmed.length,
        cancelledBookings: cancelled.length,
        checkedInCount: checkedIn.length,
        revenueProxy,
        averageRating: restaurant.rating,
        totalReviews: reviews.length,
        todayBookingCount: todayBookings.length,
      },
      peakHours: peakHoursArray,
      calendarData,
      todayBookings,
      recentBookings,
      ratingBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/owner/restaurants/:restaurantId/reviews/:reviewId/reply
const replyToReview = async (req, res) => {
  try {
    const { restaurantId, reviewId } = req.params;
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Reply text is required' });

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const review = restaurant.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.reply = {
      text: text.trim(),
      repliedAt: new Date(),
      repliedBy: req.user?.name || 'Owner',
    };

    await restaurant.save();
    res.json({ message: 'Reply posted successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/owner/restaurants/:restaurantId/dynamic-pricing
const setDynamicPricing = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { rules } = req.body;
    if (!Array.isArray(rules)) return res.status(400).json({ message: 'rules must be an array' });

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { dynamicPricing: rules },
      { new: true, runValidators: true }
    );
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json({ message: 'Dynamic pricing updated', dynamicPricing: restaurant.dynamicPricing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/owner/restaurants/:restaurantId/menu — replace entire menu
const updateMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { menu } = req.body;
    if (!Array.isArray(menu)) return res.status(400).json({ message: 'menu must be an array' });

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { menu },
      { new: true, runValidators: false }
    );
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json({ message: 'Menu updated', menu: restaurant.menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/owner/assign — admin assigns owner to restaurant
const assignOwner = async (req, res) => {
  try {
    const { userId, restaurantId } = req.body;
    const user = await User.findById(userId);
    const restaurant = await Restaurant.findById(restaurantId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    // Set role to owner
    user.role = 'owner';
    if (!user.ownedRestaurants.some((id) => id.toString() === restaurantId)) {
      user.ownedRestaurants.push(restaurantId);
    }
    restaurant.ownerId = userId;
    await user.save();
    await restaurant.save();

    res.json({ message: `${user.name} is now owner of ${restaurant.name}`, user, restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/owner/users — list all users (admin)
const listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// DELETE /api/owner/users/:id — delete user (admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Also delete their bookings if necessary or handle references (skipping for simplicity/seed)
    await Booking.deleteMany({ userId: req.params.id });

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/owner/users/:id/role — update user role (admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'owner', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User role updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOwnerRestaurants,
  getOwnerDashboard,
  replyToReview,
  setDynamicPricing,
  updateMenu,
  assignOwner,
  listUsers,
  deleteUser,
  updateUserRole,
};

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes — verify JWT token
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Access denied — admins only' });
};

// Owner or Admin middleware
const ownerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'owner' || req.user.role === 'admin')) return next();
  res.status(403).json({ message: 'Access denied — owners and admins only' });
};

// Check ownership of a specific restaurant (param: restaurantId)
const ownerOfRestaurant = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  if (req.user.role === 'admin') return next(); // admins bypass ownership check
  const rid = req.params.restaurantId || req.params.id;
  const owns = (req.user.ownedRestaurants || []).some((id) => id.toString() === rid);
  if (!owns) return res.status(403).json({ message: 'Access denied — not your restaurant' });
  next();
};

module.exports = { protect, adminOnly, ownerOrAdmin, ownerOfRestaurant };

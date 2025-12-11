const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received:', token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }

      console.log('User retrieved:', req.user);
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.log('No token found in request headers');
    res.status(401).json({ message: 'Not authorized, token missing' });
  }
});

// Role-based access control middleware unchanged, but wrapped in express-async-handler for safety
const authorizeRoles = (...roles) => {
  return asyncHandler((req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('No user attached to request');
    }
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('Forbidden: insufficient permissions');
    }
    next();
  });
};

module.exports = { protect, authorizeRoles };

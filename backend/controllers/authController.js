const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc Register user
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address, role } = req.body; // ALLOW role if you do admin registration, else just default
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('User already exists');
  }
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashed,
    phone,
    address,
    status: 'pending',
    role: role || 'User', // <-- Default to 'User' unless set by admin/registration logic
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN || '7d' });

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      company: user.company || null,
      status: user.status,
      role: user.role, 
    },
    token,
    isNewUser: true,
  });
});

// @desc Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).populate('company');
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN || '7d' });

  const isNewUser = !user.company;

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      company: user.company || null,
      status: user.status,
      role: user.role, // <-- CRUCIAL
    },
    token,
    isNewUser,
  });
});

// @desc Get current user
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password').lean();
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    company: user.company || null,
    status: user.status,
    role: user.role, // <-- CRUCIAL
  });
});

module.exports = { register, login, getMe };

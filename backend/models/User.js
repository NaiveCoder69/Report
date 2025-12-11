const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  phone: String,
  address: String,
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  status: { type: String, default: 'pending' },
  role: { type: String, default: 'User', enum: ['Admin', 'Engineer', 'Accountant', 'User'] }, // <-- Ensure this matches your business logic
  // Add any additional fields as needed
  createdAt: { type: Date, default: Date.now }

});

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const projectAccessSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['Sub-Admin', 'Engineer'], required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The admin who assigned access
  assignedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProjectAccess', projectAccessSchema);

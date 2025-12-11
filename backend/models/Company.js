const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  inviteCode: { type: String, unique: true, index: true },
  inviteToken: { type: String, unique: true, index: true },
  inviteExpiresAt: { type: Date },
});

module.exports = mongoose.model('Company', companySchema);

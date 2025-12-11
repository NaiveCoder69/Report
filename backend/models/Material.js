const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unitType: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
});

// Add compound index for uniqueness
materialSchema.index({ name: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Material', materialSchema);

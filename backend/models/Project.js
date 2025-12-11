const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true},
  client: { type: String, required: true },
  location: { type: String, required: true },
  budget: { type: Number }, // optional
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  assignedEngineer: { type: String, required: true },
  progress: { type: Number, default: 0 },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }


  // Note: No direct members field here, managed by ProjectAccess
});

module.exports = mongoose.model('Project', projectSchema);

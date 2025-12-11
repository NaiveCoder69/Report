const mongoose = require("mongoose");

const laborContractorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: String,
  phone: String,
  email: String,
  address: String,
  projects: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Project" }
  ],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
  // Other fields as required
});

module.exports = mongoose.model("LaborContractor", laborContractorSchema);

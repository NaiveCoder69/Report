const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  billNumber: { type: String, required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }, // optional vendor
  laborContractor: { type: mongoose.Schema.Types.ObjectId, ref: "LaborContractor" }, // optional labor contractor
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, // required if laborContractor is set
  amount: { type: Number, required: true },
  billDate: { type: Date, required: true },
  remarks: { type: String },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },   // <-- Add this!
}, { timestamps: true });

module.exports = mongoose.model("Bill", billSchema);

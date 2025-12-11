const mongoose = require("mongoose");

const materialDeliverySchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  material: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  date: { type: Date, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },  // <-- Add this!
});

module.exports = mongoose.model("MaterialDelivery", materialDeliverySchema);

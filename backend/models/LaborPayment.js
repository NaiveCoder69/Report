// models/LaborPayment.js
const mongoose = require("mongoose");

const laborPaymentSchema = new mongoose.Schema({
  laborContractor: { type: mongoose.Schema.Types.ObjectId, ref: "LaborContractor", required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  remarks: String,
  status: { type: String, default: "Paid" },
});

module.exports = mongoose.model("LaborPayment", laborPaymentSchema);

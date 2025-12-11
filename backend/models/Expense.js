const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  description: { type: String, required: true },
  category: { type: String },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  remarks: { type: String },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },   // <-- Add this!
});

module.exports = mongoose.model("Expense", expenseSchema);

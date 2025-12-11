const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, enum: ["add", "edit", "delete"], required: true }, 
  refId: { type: mongoose.Schema.Types.ObjectId }, // ID related to notification (like delivery id)
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }, // <-- Add this!
});

module.exports = mongoose.model("Notification", notificationSchema);

// routes/laborPaymentRoutes.js
const express = require("express");
const router = express.Router();
const LaborPayment = require("../models/LaborPayment");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", protect, authorizeRoles("Admin", "Engineer", "Accountant"), async (req, res) => {
  const { laborContractor } = req.query;
  const filter = {};
  if (laborContractor) filter.laborContractor = laborContractor;
  const payments = await LaborPayment.find(filter).sort({ date: -1 });
  res.json(payments);
});

router.post("/", protect, authorizeRoles("Admin", "Engineer"), async (req, res) => {
  const payment = await LaborPayment.create(req.body);
  res.status(201).json(payment);
});

module.exports = router;

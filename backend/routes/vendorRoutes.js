const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Vendor = require("../models/Vendor");
const Notification = require("../models/Notification");

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Get all vendors (company-filtered)
router.get("/", protect, authorizeRoles("Admin", "Engineer", "Accountant"), async (req, res) => {
  try {
    const vendors = await Vendor.find({ company: req.user.company }).sort({ createdAt: -1 });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new vendor (sets company)
router.post("/", protect, authorizeRoles("Admin", "Engineer"), async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address } = req.body;

    // Check duplicate vendor by name and company
    const existingVendor = await Vendor.findOne({ name, company: req.user.company });
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor already exists' });
    }

    const newVendor = new Vendor({
      name,
      contactPerson,
      phone,
      email,
      address,
      company: req.user.company
    });
    await newVendor.save();

    // Create notification (non-blocking)
    try {
      await Notification.create({
        message: `New vendor added: ${newVendor.name}`,
        type: "add",
        refId: newVendor._id,
        company: req.user.company,
        createdAt: new Date(),
      });
    } catch (notifyErr) {
      console.error("Notification create failed:", notifyErr);
    }

    // Emit notification event
    const io = req.app.get("io");
    if (io) io.emit("newNotification", `New vendor added: ${newVendor.name}`);

    res.status(201).json(newVendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get vendor by ID (company-filtered)
router.get("/:id", protect, authorizeRoles("Admin", "Engineer", "Accountant"), async (req, res) => {
  try {
    console.log("GET /vendors/:id called with ID:", req.params.id);
    const vendor = await Vendor.findOne({ _id: req.params.id, company: req.user.company });
    if (!vendor) {
      console.log("Vendor not found or forbidden for ID:", req.params.id);
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json(vendor);
  } catch (error) {
    console.error("Error fetching vendor:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete vendor by ID (company-filtered)
router.delete("/:id", protect, authorizeRoles("Admin", "Engineer"), async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndDelete({ _id: req.params.id, company: req.user.company });
    if (!vendor) return res.status(404).json({ message: "Vendor not found or forbidden" });
    res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vendor financial summary (company-filtered aggregation)
router.get("/:id/financial-summary", protect, authorizeRoles("Admin", "Engineer", "Accountant"), async (req, res) => {
  try {
    const vendorId = req.params.id;
    const MaterialDelivery = require('../models/MaterialDelivery');
    const Bill = require('../models/Bill');
    const companyId = req.user.company;

    const materialAggregation = await MaterialDelivery.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(vendorId), company: companyId } },
      { $group: { _id: null, totalMaterialCost: { $sum: { $multiply: ["$quantity", "$rate"] } } } }
    ]);

    const totalMaterialCost = materialAggregation[0]?.totalMaterialCost || 0;

    const billAggregation = await Bill.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(vendorId), company: companyId } },
      { $group: { _id: null, totalPaid: { $sum: "$amount" } } }
    ]);

    const totalPaid = billAggregation[0]?.totalPaid || 0;

    const remainingAmount = totalMaterialCost - totalPaid;

    res.json({ totalMaterialCost, totalPaid, remainingAmount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

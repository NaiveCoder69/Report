const express = require("express");
const router = express.Router();
const {
  addMaterialDelivery,
  getMaterialDeliveries,
  deleteMaterialDelivery,
  updateMaterialDelivery,
} = require("../controllers/materialDeliveryController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Add new delivery
router.post(
  "/",
  protect,
  authorizeRoles("Admin", "Engineer"),
  addMaterialDelivery
);

// Get deliveries – supports vendor & project filters and company
router.get(
  "/",
  protect,
  authorizeRoles("Admin", "Engineer", "Accountant"),
  async (req, res) => {
    try {
      const { vendor, project } = req.query;
      let query = { company: req.user.company }; // company scoped

      if (vendor) query.vendor = vendor;
      if (project) query.project = project;

      const MaterialDelivery = require("../models/MaterialDelivery");
      const deliveries = await MaterialDelivery.find(query)
        .populate("material")
        .populate("vendor")
        .populate("project");

      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update delivery
router.put(
  "/:id",
  protect,
  authorizeRoles("Admin", "Engineer"),
  updateMaterialDelivery
);

// Delete delivery
router.delete(
  "/:id",
  protect,
  authorizeRoles("Admin", "Engineer"),
  deleteMaterialDelivery
);

module.exports = router;

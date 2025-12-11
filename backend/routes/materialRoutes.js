const express = require("express");
const router = express.Router();
const {
  createMaterial,
  getMaterials,
  deleteMaterial,
  updateMaterial,
} = require("../controllers/materialController");

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Add a new material - protected
router.post("/", protect, authorizeRoles("Admin", "Engineer"), createMaterial);

// Get all materials - protected
router.get("/", protect, authorizeRoles("Admin", "Engineer", "Accountant"), getMaterials);

// Delete material by ID - protected
router.delete("/:id", protect, authorizeRoles("Admin", "Engineer"), deleteMaterial);

// Update material by ID - protected
router.put("/:id", protect, authorizeRoles("Admin", "Engineer"), updateMaterial);

module.exports = router;

const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const controller = require("../controllers/laborContractorController");

// Get all labor contractors (company filtered)
router.get("/", protect, authorizeRoles("Admin", "Engineer", "Accountant"), controller.getAllLaborContractors);

// Create labor contractor (PROTECTED)
router.post("/", protect, authorizeRoles("Admin", "Engineer"), controller.createLaborContractor);

// Get labor contractor details (company filtered)
router.get("/:id", protect, authorizeRoles("Admin", "Engineer", "Accountant"), controller.getLaborContractorDetail);

// Delete labor contractor (company filtered)
router.delete("/:id", protect, authorizeRoles("Admin", "Engineer"), controller.deleteLaborContractor);

module.exports = router;

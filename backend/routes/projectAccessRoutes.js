const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  assignProjectAccess,
  removeProjectAccess,
  getProjectAccessList,
} = require("../controllers/projectAccessController");

// All routes require login, assign/remove only allowed by company admin
router.post("/", protect, authorizeRoles("Admin"), assignProjectAccess);
router.delete("/:id", protect, authorizeRoles("Admin"), removeProjectAccess);
router.get("/:projectId", protect, getProjectAccessList);

module.exports = router;

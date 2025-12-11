const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { listUsers } = require("../controllers/userController");

// Only admins can list users
router.get("/", protect, authorizeRoles("Admin"), listUsers);

module.exports = router;

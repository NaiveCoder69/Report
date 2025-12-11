const express = require("express");
const router = express.Router();
const {
  createBill,
  getBills,
  deleteBill,
} = require("../controllers/billController");
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post("/", protect, authorizeRoles("Admin", "Engineer", "Accountant"), createBill);
router.get("/", protect, authorizeRoles("Admin", "Engineer", "Accountant"), getBills);
router.delete("/:id", protect, authorizeRoles("Admin", "Engineer"), deleteBill);

module.exports = router;

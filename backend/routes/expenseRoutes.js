const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware"); // Add this import!
const {
  createExpense,
  getExpenses,
  deleteExpense,
} = require("../controllers/expenseController");

// Add protect middleware to all routes that require user context!
router.post("/", protect, createExpense);
router.get("/", protect, getExpenses);
router.delete("/:id", protect, deleteExpense);

module.exports = router;

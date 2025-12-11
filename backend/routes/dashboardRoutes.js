const express = require("express");
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDashboardSummary,
  getProjectSummary,
  getProjectDetails,
} = require("../controllers/dashboardController");

// Overall Dashboard Totals (counts + totals)
router.get('/summary', protect, getDashboardSummary);  

// Per-project summary (for dashboard cards)
router.get('/project-summary', protect, getProjectSummary);

// Individual project details (click to view)
router.get("/:projectId", protect,  getProjectDetails);

module.exports = router;
    
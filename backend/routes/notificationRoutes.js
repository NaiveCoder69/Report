const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markNotificationRead,
  deleteNotification,
} = require("../controllers/notificationController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get(
  "/",
  protect,
  authorizeRoles("Admin", "Engineer", "Accountant"),
  getNotifications
);

// change PATCH → POST
router.post(
  "/:id/read",
  protect,
  authorizeRoles("Admin", "Engineer", "Accountant"),
  markNotificationRead
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("Admin", "Engineer", "Accountant"),
  deleteNotification
);

module.exports = router;

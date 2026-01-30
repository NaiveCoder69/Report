const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { parseChatMessage } = require("../controllers/chatController");

router.post("/parse", protect, parseChatMessage);

module.exports = router;

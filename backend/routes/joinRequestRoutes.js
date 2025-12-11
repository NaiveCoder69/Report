const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const joinRequestController = require('../controllers/joinRequestController');

router.post('/', protect, joinRequestController.submitJoinRequest);

// Admin only routes
router.get('/', protect, authorizeRoles('Admin'), joinRequestController.getPendingJoinRequests);
router.post('/:id/approve', protect, authorizeRoles('Admin'), joinRequestController.approveJoinRequest);
router.post('/:id/reject', protect, authorizeRoles('Admin'), joinRequestController.rejectJoinRequest);

module.exports = router;

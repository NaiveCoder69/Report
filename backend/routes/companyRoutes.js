const express = require('express');
const router = express.Router();
const { protect , authorizeRoles } = require('../middleware/authMiddleware');
const { createCompany, getCompany ,generateInviteLink } = require('../controllers/companyController'); // Import getCompany

router.post('/', protect, createCompany);
router.get("/:id", protect, getCompany);
router.post('/invite', protect, authorizeRoles('Admin'), generateInviteLink);

module.exports = router;

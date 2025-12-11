const Company = require("../models/Company");
const User = require("../models/User");
const crypto = require('crypto');

// Helper to generate 6-digit invite code
function generateInviteCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.createCompany = async (req, res) => {
  try {
    const { name } = req.body;

    // Validation omitted for brevity

    // Generate invite code and token
    const inviteCode = generateInviteCode();
    const inviteToken = crypto.randomBytes(16).toString('hex');

    const company = await Company.create({ 
      name, 
      createdBy: req.user._id,
      inviteCode,
      inviteToken
    });

    // Update user with company and role Admin and set active status
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { company: company._id, role: 'Admin', status: 'active' },
      { new: true }
    );

    // Return company plus invite info
    res.status(201).json({ company, inviteCode, inviteToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateInviteLink = async (req, res) => {
  try {
    // Only allow admin who created the company or with right role
    const company = await Company.findById(req.user.company);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    // Optionally check user is admin: req.user._id equals company.createdBy

    // Generate new token and expiry
    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    company.inviteToken = token;
    company.inviteExpiresAt = expiresAt;
    await company.save();

    res.json({
      inviteToken: token,
      inviteExpiresAt: expiresAt,
      inviteLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join-company?token=${token}`,
    });
  } catch (error) {
    console.error("Error generating invite link:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate("createdBy", "name email");
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

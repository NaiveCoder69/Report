const JoinRequest = require('../models/JoinRequest');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const User = require('../models/User');


exports.submitJoinRequest = async (req, res) => {
  try {
    const { code, token } = req.body;

    let company;
    if (code) {
      company = await Company.findOne({ inviteCode: code });
    } else if (token) {
      company = await Company.findOne({ inviteToken: token });
      // ADD expiry check
      if (!company || !company.inviteExpiresAt || company.inviteExpiresAt < new Date()) {
        return res.status(400).json({ message: "Invite link expired or invalid." });
      }
    }

    if (!company) {
      return res.status(400).json({ message: "Invalid join code or invite link." });
    }

    if (req.user.company) {
      return res.status(400).json({ message: "You already belong to a company." });
    }

    const existingRequest = await JoinRequest.findOne({
      user: req.user._id,
      company: company._id,
      status: 'pending'
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Pending join request already exists." });
    }

    const joinRequest = await JoinRequest.create({
      user: req.user._id,
      company: company._id,
      status: 'pending',
      requestedAt: new Date(),
    });

    res.status(201).json({ message: "Join request submitted and pending approval." });
  } catch (error) {
    console.error("Join request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all pending join requests for admin's company
exports.getPendingJoinRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.find({
      company: req.user.company,
      status: 'pending'
    }).populate('user', 'name email');

    res.json(requests);
  } catch (error) {
    console.error("Error fetching join requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve join request and assign role
exports.approveJoinRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const joinReq = await JoinRequest.findOne({
      _id: id,
      company: req.user.company,
      status: 'pending'
    });

    if (!joinReq) {
      return res.status(404).json({ message: "Join request not found or already processed" });
    }

    const user = await User.findById(joinReq.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.company = req.user.company;
    user.role = role;
    user.status = 'active'; // Optional: activate user on approval
    await user.save();

    joinReq.status = 'approved';
    joinReq.assignedRole = role;
    joinReq.decidedAt = new Date();
    joinReq.decidedBy = req.user._id;
    await joinReq.save();

    res.json({ message: `User approved and assigned role ${role}` });
  } catch (error) {
    console.error("Error approving join request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject join request
exports.rejectJoinRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const joinReq = await JoinRequest.findOne({
      _id: id,
      company: req.user.company,
      status: 'pending'
    });

    if (!joinReq) {
      return res.status(404).json({ message: "Join request not found or already processed" });
    }

    joinReq.status = 'rejected';
    joinReq.decidedAt = new Date();
    joinReq.decidedBy = req.user._id;
    await joinReq.save();

    res.json({ message: "Join request rejected" });
  } catch (error) {
    console.error("Error rejecting join request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

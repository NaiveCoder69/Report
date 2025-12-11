const User = require("../models/User");

exports.listUsers = async (req, res) => {
  try {
    // Return basic info for all users (avoid sending passwords etc)
    const users = await User.find({}, "name email company");
    res.json(users);
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

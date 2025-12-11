const ProjectAccess = require("../models/ProjectAccess");
const Project = require("../models/Project");

// Assign role to user for project
exports.assignProjectAccess = async (req, res) => {
  try {
    const { project, user, role } = req.body;

    // Validate inputs
    if (!project || !user || !role) {
      return res.status(400).json({ message: "Project, user and role are required" });
    }

    // Check project exists
    const proj = await Project.findById(project);
    if (!proj) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if already assigned
    const exists = await ProjectAccess.findOne({ project, user });
    if (exists) {
      return res.status(400).json({ message: "User already assigned to project" });
    }

    // Create assignment; assignedBy is current user (admin)
    const assignment = await ProjectAccess.create({
      project,
      user,
      role,
      assignedBy: req.user._id,
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Assign project access error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove assignment by ID
exports.removeProjectAccess = async (req, res) => {
  try {
    const id = req.params.id;
    const removed = await ProjectAccess.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.json({ message: "Assignment removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all assignments for a project
exports.getProjectAccessList = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const list = await ProjectAccess.find({ project: projectId }).populate("user", "name email");
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

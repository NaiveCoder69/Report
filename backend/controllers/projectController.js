const Project = require("../models/Project");
const Notification = require("../models/Notification");
const Bill = require("../models/Bill");
const Expense = require("../models/Expense");
const LaborPayment = require("../models/LaborPayment");
const MaterialDelivery = require("../models/MaterialDelivery");

// createProject without any uniqueness check
exports.createProject = async (req, res) => {
  try {
    const { name, client, location, budget, startDate, endDate, assignedEngineer } = req.body;

    const project = await Project.create({
      name,
      client,
      location,
      budget: budget || null,
      startDate,
      endDate,
      assignedEngineer,
      company: req.user.company,
    });

    const notificationMessage = `New project created: ${project.name}`;

    const notification = await Notification.create({
      message: notificationMessage,
      type: "add",
      refId: project._id,
      createdAt: new Date(),
      company: req.user.company,
    });
    const io = req.app.get("io");
    io.emit("newNotification", notification);

    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: error.message });
  }
};

// getProjects unchanged
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ company: req.user.company });
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: error.message });
  }
};

// deleteProject unchanged
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the project first
    const project = await Project.findById(id);

    // If not found, return 404
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Compare logged-in user's company to project's company
    if (project.company.toString() !== req.user.company.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden: Cannot delete project of another company" });
    }

    // Delete the project
    const deletedProject = await Project.findByIdAndDelete(id);

    // Delete related data
    await Bill.deleteMany({ project: id });
    await Expense.deleteMany({ project: id });
    await LaborPayment.deleteMany({ project: id });
    await MaterialDelivery.deleteMany({ project: id });

    // Notification logic
    const notificationMessage = `Project deleted: ${deletedProject.name}`;
    const notification = await Notification.create({
      message: notificationMessage,
      type: "delete",
      refId: id,
      createdAt: new Date(),
      company: req.user.company,
    });
    const io = req.app.get("io");
    io.emit("newNotification", notification);

    res.json({ message: "Project and related data deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addProjectMember = async (req, res) => {
  try {
    const { id } = req.params; // Project ID
    const { userId } = req.body; // User ID to add

    const project = await Project.findByIdAndUpdate(
      id,
      { $addToSet: { members: userId } }, // Add user if not exists
      { new: true }
    ).populate("members", "name email role");

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a user from project members
exports.removeProjectMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const project = await Project.findByIdAndUpdate(
      id,
      { $pull: { members: userId } },
      { new: true }
    ).populate("members", "name email role");

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all members of a project
exports.getProjectMembers = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id).populate(
      "members",
      "name email role"
    );
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project.members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

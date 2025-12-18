const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const {
  getProjects,
  getProjectById,
  createProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  getProjectMembers,
} = require("../controllers/projectController");

// Get all projects for logged-in user's company
router.get("/", protect, getProjects);

// Get single project by ID (details page)
router.get("/:id", protect, getProjectById);

// Create project
router.post("/", protect, createProject);

// 🗑️ Delete project by ID - protected, limited to Admin and Engineer
router.delete("/:id", protect, deleteProject);

// Members
router.post(
  "/:id/members",
  protect,
  authorizeRoles("Admin"),
  addProjectMember
);
router.delete(
  "/:id/members/:userId",
  protect,
  authorizeRoles("Admin"),
  removeProjectMember
);
router.get("/:id/members", protect, getProjectMembers);

module.exports = router;

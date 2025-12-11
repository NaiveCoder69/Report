const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getProjects,
  createProject,
  deleteProject,
  addProjectMember, removeProjectMember, getProjectMembers
} = require("../controllers/projectController");


router.get("/", protect, getProjects);
router.post("/", protect, createProject);


// 🗑️ Delete project by ID - protected, limited to Admin and Engineer
router.delete("/:id", protect, deleteProject);

router.post('/:id/members', protect, authorizeRoles('Admin'), addProjectMember);
router.delete('/:id/members/:userId', protect, authorizeRoles('Admin'), removeProjectMember);
router.get('/:id/members', protect, getProjectMembers);

module.exports = router;

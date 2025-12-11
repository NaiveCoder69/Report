const LaborContractor = require('../models/LaborContractor');
const Bill = require('../models/Bill');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// All labor contractors for current user's company
exports.getAllLaborContractors = async (req, res) => {
  try {
    const contractors = await LaborContractor.find({ company: req.user.company }).populate("projects", "name");
    res.json(contractors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new labor contractor (PROTECTED + sets company + notification)
exports.createLaborContractor = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address, projects } = req.body;
    if (!name || !phone || !projects || projects.length === 0) {
      return res.status(400).json({ message: "Name, phone, and at least one project are required" });
    }
    const contractor = await LaborContractor.create({
      name,
      contactPerson,
      phone,
      email,
      address,
      projects,
      company: req.user.company
    });

    // Create notification for added labor contractor
    try {
      await Notification.create({
        message: `Labor contractor added: ${contractor.name}`,
        type: "add",
        refId: contractor._id,
        company: req.user.company,
        createdAt: new Date()
      });
    } catch (err) {
      console.error("Failed to create notification for labor contractor:", err);
      // Do not block main response
    }

    res.status(201).json(contractor);
  } catch (error) {
    console.error("Failed to add labor contractor:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getLaborContractorDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const laborContractor = await LaborContractor.findOne({ _id: id, company: req.user.company }).populate("projects", "name");
    if (!laborContractor) return res.status(404).json({ message: "Labor Contractor not found" });

    const bills = await Bill.find({ laborContractor: id, company: req.user.company })
      .populate('project', 'name')
      .sort({ billDate: 1 });

    res.json({ laborContractor, bills });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete labor contractor (PROTECTED, with notification)
exports.deleteLaborContractor = async (req, res) => {
  try {
    const { id } = req.params;
    const contractor = await LaborContractor.findOneAndDelete({ _id: id, company: req.user.company });
    if (!contractor) {
      return res.status(404).json({ message: "Labor contractor not found or forbidden" });
    }

    try {
      await Notification.create({
        message: `Labor contractor deleted: ${contractor.name}`,
        type: "delete",
        refId: contractor._id,
        company: req.user.company,
        createdAt: new Date()
      });
    } catch (err) {
      console.error("Failed to create deletion notification:", err);
    }

    res.json({ message: "Labor contractor deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

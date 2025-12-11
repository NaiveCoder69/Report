const mongoose = require("mongoose");
const Material = require("../models/Material");
const MaterialDelivery = require("../models/MaterialDelivery");
const Project = require("../models/Project");
const Bill = require("../models/Bill");
const Expense = require("../models/Expense");

exports.getDashboardSummary = async (req, res) => {
  try {
const companyId = new mongoose.Types.ObjectId(req.user.company);

    const totalProjects = await Project.countDocuments({ company: companyId });
    const totalMaterials = await Material.countDocuments({ company: companyId });
    const totalDeliveries = await MaterialDelivery.countDocuments({ company: companyId });
    const totalBills = await Bill.countDocuments({ company: companyId });
    const totalExpenses = await Expense.countDocuments({ company: companyId });

    const totalExpenseAmount = await Expense.aggregate([
      { $match: { company: companyId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalBillAmount = await Bill.aggregate([
      { $match: { company: companyId } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalMaterialCost = await MaterialDelivery.aggregate([
      { $match: { company: companyId } },
      { $group: { _id: null, total: { $sum: { $multiply: ["$quantity", "$rate"] } } } },
    ]);

    res.json({
      totalProjects,
      totalMaterials,
      totalDeliveries,
      totalBills,
      totalExpenses,
      totalExpenseAmount: totalExpenseAmount.length > 0 ? totalExpenseAmount[0].total : 0,
      totalBillAmount: totalBillAmount.length > 0 ? totalBillAmount[0].total : 0,
      totalMaterialCost: totalMaterialCost.length > 0 ? totalMaterialCost[0].total : 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return res.status(400).json({
      message: error.message,
      stack: error.stack,
    });
  }
};


// 🧭 PER-PROJECT DETAILED SUMMARY
exports.getProjectSummary = async (req, res) => {
  try {
    const projects = await Project.find({ company: req.user.company });

    const summary = await Promise.all(
      projects.map(async (project) => {
        const materials = await MaterialDelivery.find({ project: project._id });
        const totalMaterialCost = materials.reduce(
          (sum, mat) => sum + (mat.quantity * mat.rate || 0),
          0
        );

        const expenses = await Expense.find({ project: project._id });
        const totalExpense = expenses.reduce(
          (sum, exp) => sum + (exp.amount || 0),
          0
        );

        const laborBills = await Bill.find({
          project: project._id,
          laborContractor: { $exists: true, $ne: null },
        });
        const totalLaborPayments = laborBills.reduce(
          (sum, b) => sum + (b.amount || 0),
          0
        );

        return {
          projectId: project._id,
          projectName: project.name,
          totalMaterialCost,
          totalExpense,
          totalLaborPayments,
        };
      })
    );

    res.json(summary);
  } catch (error) {
    console.error("Error fetching project summary:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 🧭 PER-PROJECT DETAILS (materials + expenses breakdown)
exports.getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const materialDeliveries = await MaterialDelivery.find({ project: projectId })
      .populate("material", "name unitType")
      .populate("vendor", "name");

    let totalMaterialCost = 0;
    materialDeliveries.forEach((d) => {
      totalMaterialCost += d.quantity * d.rate;
    });

    const expenses = await Expense.find({ project: projectId });
    const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

    res.json({
      project,
      materials: materialDeliveries,
      totalMaterialCost,
      expenses,
      totalExpense,
    });
  } catch (error) {
    console.error("Error loading project details:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

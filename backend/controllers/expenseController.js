const Expense = require("../models/Expense");
const Notification = require("../models/Notification"); // Added import

// ✅ Add a new expense
exports.createExpense = async (req, res) => {
  try {
    const { project, description, category, amount, date, remarks } = req.body;

    console.log("📩 Received expense data:", req.body);

    if (!project || !description || !amount || !date) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const newExpense = new Expense({
      project,
      description,
      category,
      amount,
      date,
      remarks,
      company: req.user.company // <--- Add company filter
    });

    await newExpense.save();
    const populatedExpense = await newExpense.populate("project");

    // Create notification message
    const notificationMessage = `New expense added for project ${populatedExpense.project.name}`;

    // Create Notification document
    const notification = await Notification.create({
      message: notificationMessage,
      type: "add",
      refId: populatedExpense._id,
      company: req.user.company,
      createdAt: new Date(),
    });

    // Emit notification event
    const io = req.app.get("io");
    io.emit("newNotification", notification);

    res.status(201).json(populatedExpense);
  } catch (error) {
    console.error("❌ Error creating expense:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all expenses for this company
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ company: req.user.company }).populate("project");
    res.json(expenses);
  } catch (error) {
    console.error("❌ Error fetching expenses:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Create notification message
    const notificationMessage = `Expense deleted for project ID ${expense.project}`;

    // Create Notification document
    const notification = await Notification.create({
      message: notificationMessage,
      type: "delete",
      refId: id,
      company: req.user.company,
      createdAt: new Date(),
    });

    // Emit notification event
    const io = req.app.get("io");
    io.emit("newNotification", notification);

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting expense:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

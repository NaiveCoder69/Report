const MaterialDelivery = require("../models/MaterialDelivery");
const Project = require("../models/Project");
const Notification = require("../models/Notification");

exports.addMaterialDelivery = async (req, res) => {
  try {
    const { vendor, project, material, quantity, rate, date } = req.body;

    const delivery = await MaterialDelivery.create({
      vendor,
      project,
      material,
      quantity,
      rate,
      date,
      company: req.user.company, // STRICT company
    });

    const projectDoc = await Project.findById(project);
    if (projectDoc) {
      projectDoc.totalMaterialCost =
        (projectDoc.totalMaterialCost || 0) + quantity * rate;
      await projectDoc.save();
    }

    const populatedDelivery = await MaterialDelivery.findById(delivery._id)
      .populate("project", "name")
      .populate("vendor", "name")
      .populate("material", "name");

    try {
      await Notification.create({
        message: `New material delivery added to project ${
          populatedDelivery.project?.name || ""
        }`,
        type: "add",
        refId: populatedDelivery._id,
        company: req.user.company,
        createdAt: new Date(),
      });
    } catch (notifyErr) {
      console.error("Notification create failed:", notifyErr);
    }

    const io = req.app.get("io");
    if (io) {
      io.emit(
        "newNotification",
        `New material delivery added to project ${
          populatedDelivery.project?.name || ""
        }`
      );
      io.emit("addMaterialDelivery", populatedDelivery);
    }

    res.status(201).json(populatedDelivery);
  } catch (err) {
    console.error("Error adding delivery:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMaterialDeliveries = async (req, res) => {
  try {
    const { vendor, project } = req.query;
    let query = { company: req.user.company }; // STRICT company filter

    if (vendor) query.vendor = vendor;
    if (project) query.project = project; // filter by project for details page

    const deliveries = await MaterialDelivery.find(query)
      .populate("material")
      .populate("vendor")
      .populate("project");

    res.json(deliveries);
  } catch (err) {
    console.error("Error fetching deliveries:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteMaterialDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await MaterialDelivery.findOneAndDelete({
      _id: id,
      company: req.user.company,
    }); // STRICT company filter

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    try {
      await Notification.create({
        message: `Material delivery deleted (ID: ${id})`,
        type: "delete",
        refId: id,
        company: req.user.company,
        createdAt: new Date(),
      });
    } catch (notifyErr) {
      console.error("Notification create failed:", notifyErr);
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("newNotification", `Material delivery deleted (ID: ${id})`);
      io.emit("deleteMaterialDelivery", id);
    }

    res.json({ message: "Delivery deleted successfully" });
  } catch (err) {
    console.error("Error deleting delivery:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateMaterialDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { vendor, project, material, quantity, rate, date } = req.body;

    const updated = await MaterialDelivery.findOneAndUpdate(
      { _id: id, company: req.user.company },
      { vendor, project, material, quantity, rate, date },
      { new: true }
    )
      .populate("material")
      .populate("vendor")
      .populate("project");

    if (!updated) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating delivery:", err);
    res.status(500).json({ message: "Server error" });
  }
};


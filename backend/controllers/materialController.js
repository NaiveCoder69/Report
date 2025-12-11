const Material = require("../models/Material");
const Notification = require("../models/Notification");

// Create new material (NO duplicate check)
exports.createMaterial = async (req, res) => {
  console.log("Create Material for user:", req.user.id, "company:", req.user.company);

  try {
    const { name, unitType, quantity } = req.body;

    if (!name || !unitType) {
      return res.status(400).json({ message: "Name and unit type are required" });
    }

    const material = await Material.create({
      name,
      unitType,
      quantity: quantity || 0,
      company: req.user.company
    });

    // Create notification message
    const notificationMessage = `New material created: ${material.name}`;

    // Create notification document
    const notification = await Notification.create({
      message: notificationMessage,
      type: "add",
      refId: material._id,
      company: req.user.company,
      createdAt: new Date(),
    });

    // Emit socket notification event
    const io = req.app.get("io");
    io.emit("newNotification", notification);

    res.status(201).json(material);
  } catch (error) {
    console.error("Error creating material:", error);
    res.status(500).json({ message: "Server error while creating material" });
  }
};

// Get all materials for this company
exports.getMaterials = async (req, res) => {
  try {
    console.log("Fetching materials for company:", req.user.company);
    const materials = await Material.find({ company: req.user.company }).sort({ createdAt: -1 });
    console.log("Materials found:", materials.length);
    res.json(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ message: "Server error while fetching materials" });
  }
};

// Update material
exports.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Material.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Create notification message
    const notificationMessage = `Material updated: ${updated.name}`;

    // Create notification document
    const notification = await Notification.create({
      message: notificationMessage,
      type: "edit",
      refId: updated._id,
      company: req.user.company,
      createdAt: new Date(),
    });

    // Emit socket notification event
    const io = req.app.get("io");
    io.emit("newNotification", notification);

    res.json(updated);
  } catch (error) {
    console.error("Error updating material:", error);
    res.status(500).json({ message: "Server error while updating material" });
  }
};

// Delete material
exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByIdAndDelete(id);

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Create notification message
    const notificationMessage = `Material deleted: ${material.name}`;

    // Create notification document
    const notification = await Notification.create({
      message: notificationMessage,
      type: "delete",
      refId: id,
      company: req.user.company,
      createdAt: new Date(),
    });

    // Emit socket notification event
    const io = req.app.get("io");
    io.emit("newNotification", notification);

    res.json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("Error deleting material:", error);
    res.status(500).json({ message: "Server error while deleting material" });
  }
};

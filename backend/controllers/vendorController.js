const Vendor = require('../models/Vendor');
const Notification = require('../models/Notification');

// Add a new vendor
exports.addVendor = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address } = req.body;

    // Duplicate vendor per company only
    const existingVendor = await Vendor.findOne({ name, company: req.user.company });
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor already exists' });
    }

    const newVendor = new Vendor({ name, contactPerson, phone, email, address, company: req.user.company });
    await newVendor.save();

    // Create notification message
    const notificationMessage = `New vendor added: ${newVendor.name}`;

    // Create Notification document
    try {
      await Notification.create({
        message: notificationMessage,
        type: "add",
        refId: newVendor._id,
        company: req.user.company,
        createdAt: new Date(),
      });
    } catch (notifyErr) {
      console.error("Notification create failed:", notifyErr);
    }

    // Emit notification via Socket.IO
    const io = req.app.get("io");
    if (io) io.emit("newNotification", notificationMessage);

    res.status(201).json(newVendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all vendors for this company
exports.getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ company: req.user.company }).sort({ createdAt: -1 });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

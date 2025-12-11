const Bill = require("../models/Bill");
const Notification = require("../models/Notification");


exports.createBill = async (req, res) => {
  try {
    const { billNumber, vendor, laborContractor, project, amount, billDate, remarks } = req.body;

    if (!amount || !billDate) {
      return res
        .status(400)
        .json({ message: "amount and billDate are required" });
    }

    if ((vendor && laborContractor) || (!vendor && !laborContractor)) {
      return res
        .status(400)
        .json({ message: "Specify either vendor or labor contractor." });
    }

    if (laborContractor && !project) {
      return res
        .status(400)
        .json({ message: "Project is required for labor contractor bills." });
    }

    // Auto-generate billNumber per company if not provided
    let finalBillNumber = billNumber;

    if (!finalBillNumber) {
      const lastBill = await Bill.findOne({ company: req.user.company })
        .sort({ billNumber: -1 }) // highest billNumber for this company
        .lean();

      const lastNumber = lastBill ? Number(lastBill.billNumber) || 0 : 0;
      finalBillNumber = String(lastNumber + 1);
    }

    const billData = {
      billNumber: finalBillNumber,
      amount,
      billDate,
      remarks,
      vendor: vendor || null,
      laborContractor: laborContractor || null,
      project: project || null,
      company: req.user.company,
    };

    const bill = await Bill.create(billData);

    try {
      await Notification.create({
        message: `New bill created: ${bill.billNumber}`,
        type: "add",
        refId: bill._id,
        company: req.user.company,
        createdAt: new Date(),
      });
    } catch (notifyErr) {
      console.error("Notification create failed:", notifyErr);
    }

    const io = req.app.get("io");
    if (io) io.emit("newNotification", `New bill created: ${bill.billNumber}`);

    res.status(201).json(bill);
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getBills = async (req, res) => {
  try {
    const { vendor, laborContractor, project } = req.query;
    let query = { company: req.user.company }; // STRICT company-level filter here

    if (vendor) query.vendor = vendor;
    if (laborContractor) query.laborContractor = laborContractor;
    if (project) query.project = project;

    const Bill = require("../models/Bill");

    let bills;
    if (vendor) {
      bills = await Bill.find(query).populate("vendor", "name");
    } else if (laborContractor) {
      bills = await Bill.find(query).populate("laborContractor", "name");
    } else {
      bills = await Bill.find(query)
        .populate("vendor", "name")
        .populate("laborContractor", "name");
    }

    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Bill.findOneAndDelete({ _id: id, company: req.user.company }); // STRICT company filter

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    try {
      await Notification.create({
        message: `Bill deleted: ${bill.billNumber}`,
        type: "delete",
        refId: id,
        company: req.user.company,
        createdAt: new Date(),
      });
    } catch (notifyErr) {
      console.error("Notification create failed:", notifyErr);
    }

    const io = req.app.get("io");
    if (io) io.emit("newNotification", `Bill deleted: ${bill.billNumber}`);

    res.json({ message: "Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

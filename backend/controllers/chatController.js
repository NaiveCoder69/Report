const Material = require("../models/Material");
const Vendor = require("../models/Vendor");
const Project = require("../models/Project");
const MaterialDelivery = require("../models/MaterialDelivery");
const Expense = require("../models/Expense");

// Parse ANY message and create data
exports.parseChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userCompany = req.user.company;
    const lowerMsg = message.toLowerCase().trim();

    console.log("🗣️ Chat input:", lowerMsg); // Debug log

    // Parse action type
    let action, data;
    if (lowerMsg.includes("delivery")) {
      ({ action: "delivery", data } = parseDelivery(lowerMsg));
    } else if (lowerMsg.includes("expense") || lowerMsg.includes("exp")) {
      ({ action: "expense", data } = parseExpense(lowerMsg));
    } else if (lowerMsg.includes("material") || lowerMsg.includes("mat")) {
      ({ action: "material", data } = parseMaterial(lowerMsg));
    } else if (lowerMsg.includes("vendor")) {
      ({ action: "vendor", data } = parseVendor(lowerMsg));
    } else if (lowerMsg.includes("project") || lowerMsg.includes("proj")) {
      ({ action: "project", data } = parseProject(lowerMsg));
    } else {
      return res.json({
        message: "Say: 'add delivery cement 50 450' | 'add expense transport 5000' | 'add material bricks'",
        success: false
      });
    }

    // Execute action
    const result = await executeAction(action, data, userCompany);
    
    res.json({
      message: result.message,
      success: result.success,
      action: `${action} added`
    });

  } catch (error) {
    console.error("💥 Chat parser error:", error);
    res.status(500).json({
      message: "Sorry, try again with simpler format",
      success: false
    });
  }
};

// ========== PARSERS ==========
function parseDelivery(text) {
  // "delivery cement 50 bags 450" or "add delivery ultratech 50 450"
  const match = text.match(/delivery\s+(\w+(?:\s\w+)*)\s+(\d+(?:\.\d+)?)\s*(bags?|tons?|kg?|units?)?\s*(\d+(?:\.\d+)?)/i);
  if (match) {
    return {
      action: "delivery",
      data: {
        materialName: match[1].trim(),
        quantity: parseFloat(match[2]),
        unit: match[3] || "bags",
        rate: parseFloat(match[4]) || 0
      }
    };
  }
  throw new Error("Use: delivery [material] [qty] [rate]");
}

function parseExpense(text) {
  // "expense transport 5000" or "add expense fuel 2500"
  const match = text.match(/(?:expense|exp)\s+(.+?)\s+(\d+(?:\.\d+)?)/i);
  if (match) {
    return {
      action: "expense",
      data: {
        description: match[1].trim(),
        amount: parseFloat(match[2])
      }
    };
  }
  throw new Error("Use: expense [description] [amount]");
}

function parseMaterial(text) {
  // "material bricks red" or "add material cement ultratech"
  const match = text.match(/(?:material|mat)\s+(.+)/i);
  if (match) {
    return {
      action: "material",
      data: {
        name: match[1].trim()
      }
    };
  }
  throw new Error("Use: material [name]");
}

function parseVendor(text) {
  const match = text.match(/(?:vendor|ven)\s+(.+)/i);
  if (match) {
    return {
      action: "vendor",
      data: {
        name: match[1].trim()
      }
    };
  }
  throw new Error("Use: vendor [name]");
}

function parseProject(text) {
  const match = text.match(/(?:project|proj)\s+(.+)/i);
  if (match) {
    return {
      action: "project",
      data: {
        name: match[1].trim()
      }
    };
  }
  throw new Error("Use: project [name]");
}

// ========== ACTION EXECUTORS ==========
async function executeAction(action, data, company) {
  switch (action) {
    case "delivery":
      return await createDelivery(data, company);
    case "expense":
      return await createExpense(data, company);
    case "material":
      return await createMaterial(data, company);
    case "vendor":
      return await createVendor(data, company);
    case "project":
      return await createProject(data, company);
    default:
      throw new Error("Unknown action");
  }
}

async function createDelivery(data, company) {
  // Auto-create material
  let material = await Material.findOne({ 
    name: { $regex: data.materialName, $i: 1 },
    company 
  });
  
  if (!material) {
    material = await Material.create({
      name: data.materialName,
      company
    });
  }

  // Create delivery (use first project or create default)
  const project = await Project.findOne({ company });
  const delivery = await MaterialDelivery.create({
    project: project?._id || null,
    material: material._id,
    vendor: null, // or auto-find
    quantity: data.quantity,
    rate: data.rate,
    company
  });

  const total = data.quantity * data.rate;
  return {
    message: `✅ Delivery added: ${data.materialName} ×${data.quantity} @ ₹${data.rate} = ₹${total.toLocaleString()}`,
    success: true
  };
}

async function createExpense(data, company) {
  const expense = await Expense.create({
    description: data.description,
    amount: data.amount,
    category: "General",
    project: null,
    company
  });

  return {
    message: `✅ Expense added: ${data.description} ₹${data.amount.toLocaleString()}`,
    success: true
  };
}

async function createMaterial(data, company) {
  const material = await Material.findOne({ 
    name: { $regex: data.name, $i: 1 },
    company 
  });

  if (material) {
    return {
      message: `ℹ️ Material "${data.name}" already exists`,
      success: false
    };
  }

  await Material.create({
    name: data.name,
    company
  });

  return {
    message: `✅ New material "${data.name}" added`,
    success: true
  };
}

async function createVendor(data, company) {
  const vendor = await Vendor.findOne({ 
    name: { $regex: data.name, $i: 1 },
    company 
  });

  if (vendor) {
    return {
      message: `ℹ️ Vendor "${data.name}" already exists`,
      success: false
    };
  }

  await Vendor.create({
    name: data.name,
    company
  });

  return {
    message: `✅ New vendor "${data.name}" added`,
    success: true
  };
}

async function createProject(data, company) {
  await Project.create({
    name: data.name,
    client: "Client",
    company
  });

  return {
    message: `✅ New project "${data.name}" created`,
    success: true
  };
}

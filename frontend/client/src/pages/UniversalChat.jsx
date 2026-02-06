import React, { useEffect, useRef, useState } from "react";
import API from "../api";
import "../styles/chat.css";

const ACTIONS = [
  { key: "project", label: "Add Project" },
  { key: "vendor", label: "Add Vendor" },
  { key: "material", label: "Add Material" },
  { key: "expense", label: "Add Expense" },
  { key: "delivery", label: "Add Delivery" },
  { key: "bill", label: "Add Bill" },
  { key: "labor", label: "Add Labor Contractor" },
];

/* ---------------------- FLOWS ---------------------- */

const projectFlow = {
  api: "/projects",
  fields: [
    { key: "name", label: "Project name" },
    { key: "client", label: "Client name" },
    { key: "location", label: "Location" },
    { key: "budget", label: "Budget (₹)", type: "number", optional: true },
    { key: "startDate", label: "Start date", type: "date" },
    { key: "endDate", label: "End date", type: "date", optional: true },
    { key: "assignedEngineer", label: "Assigned engineer" },
  ],
};

const vendorFlow = {
  api: "/vendors",
  fields: [
    { key: "name", label: "Vendor name" },
    { key: "contactPerson", label: "Contact person", optional: true },
    { key: "phone", label: "Phone", optional: true },
    { key: "email", label: "Email", optional: true },
    { key: "address", label: "Address", optional: true },
  ],
};

const materialFlow = {
  api: "/materials",
  fields: [
    { key: "name", label: "Material name" },
    { key: "unitType", label: "Unit type (bag, ton, truck)" },
  ],
};

const expenseFlow = {
  api: "/expenses",
  fields: [
    { key: "project", label: "Select project", type: "project" },
    { key: "description", label: "Expense description" },
    { key: "category", label: "Category", optional: true },
    { key: "amount", label: "Amount (₹)", type: "number" },
    { key: "date", label: "Expense date", type: "date" },
    { key: "remarks", label: "Remarks", optional: true },
  ],
};

const deliveryFlow = {
  api: "/material-deliveries",
  fields: [
    { key: "project", label: "Select project", type: "project" },
    { key: "vendor", label: "Select vendor", type: "vendor" },
    { key: "material", label: "Select material", type: "material" },
    { key: "quantity", label: "Quantity", type: "number" },
    { key: "rate", label: "Rate (₹)", type: "number" },
    { key: "date", label: "Delivery date", type: "date" },
  ],
};

const billFlow = {
  api: "/bills",
  fields: [
    {
      key: "recipientType",
      label: "Bill recipient",
      type: "select",
      options: [
        { label: "Vendor", value: "vendor" },
        { label: "Labor Contractor", value: "labor-contractor" },
      ],
    },
    {
      key: "vendor",
      label: "Select vendor",
      type: "vendor",
      requiredIf: (d) => d.recipientType === "vendor",
    },
    {
      key: "laborContractor",
      label: "Select labor contractor",
      type: "labor",
      requiredIf: (d) => d.recipientType === "labor-contractor",
    },
    {
      key: "project",
      label: "Select project",
      type: "project",
      requiredIf: (d) => d.recipientType === "labor-contractor",
    },
    { key: "amount", label: "Amount (₹)", type: "number" },
    { key: "billDate", label: "Bill date", type: "date" },
    { key: "remarks", label: "Remarks", optional: true },
  ],
};

const laborFlow = {
  api: "/labor-contractors",
  fields: [{ key: "name", label: "Labor contractor name" }],
};

const FLOWS = {
  project: projectFlow,
  vendor: vendorFlow,
  material: materialFlow,
  expense: expenseFlow,
  delivery: deliveryFlow,
  bill: billFlow,
  labor: laborFlow,
};

/* ---------------------- COMPONENT ---------------------- */

export default function UniversalChat() {
  const [query, setQuery] = useState("");
  const [action, setAction] = useState(null);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [messages, setMessages] = useState([
    { from: "bot", text: "Type what you want to add 👇" },
  ]);

  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [laborContractors, setLaborContractors] = useState([]);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    API.get("/projects").then((r) => setProjects(r.data));
    API.get("/vendors").then((r) => setVendors(r.data));
    API.get("/materials").then((r) => setMaterials(r.data));
    API.get("/labor-contractors").then((r) => setLaborContractors(r.data));
  }, []);

  const flow = action ? FLOWS[action] : null;

  const currentField = (() => {
    if (!flow) return null;
    for (let i = step; i < flow.fields.length; i++) {
      const f = flow.fields[i];
      if (!f.requiredIf || f.requiredIf(formData)) {
        if (i !== step) setStep(i);
        return f;
      }
    }
    return null;
  })();

  const addMsg = (from, text) =>
    setMessages((m) => [...m, { from, text }]);

  const startAction = (a) => {
    setAction(a.key);
    setStep(0);
    setFormData({});
    setMessages([{ from: "bot", text: a.label }]);
  };

  const submitField = async (value) => {
    const updated = { ...formData, [currentField.key]: value };
    setFormData(updated);
    addMsg("user", value);

    let next = step + 1;
    while (
      next < flow.fields.length &&
      flow.fields[next].requiredIf &&
      !flow.fields[next].requiredIf(updated)
    ) {
      next++;
    }

    if (next < flow.fields.length) {
      setStep(next);
      addMsg("bot", flow.fields[next].label);
    } else {
      await API.post(flow.api, updated);
      addMsg("bot", "✅ Added successfully");
      setAction(null);
      setQuery("");
    }
  };

  const suggestions = ACTIONS.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="chat-shell">
      <div className="chat-box">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.from}`}>
              {m.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="chat-input">
          {!action && (
            <>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to add..."
              />
              {query && (
                <div className="chat-suggestions">
                  {suggestions.map((a) => (
                    <div key={a.key} onClick={() => startAction(a)}>
                      {a.label}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {action && currentField && (
            <>
              {currentField.type === "select" && (
                <select onChange={(e) => submitField(e.target.value)}>
                  <option value="">Select</option>
                  {currentField.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}

              {currentField.type === "project" && (
                <select onChange={(e) => submitField(e.target.value)}>
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}

              {currentField.type === "vendor" && (
                <select onChange={(e) => submitField(e.target.value)}>
                  <option value="">Select vendor</option>
                  {vendors.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              )}

              {currentField.type === "material" && (
                <select onChange={(e) => submitField(e.target.value)}>
                  <option value="">Select material</option>
                  {materials.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              )}

              {currentField.type === "labor" && (
                <select onChange={(e) => submitField(e.target.value)}>
                  <option value="">Select labor contractor</option>
                  {laborContractors.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              )}

              {!currentField.type && (
                <input
                  type={currentField.type || "text"}
                  placeholder={currentField.label}
                  onKeyDown={(e) =>
                    e.key === "Enter" && submitField(e.target.value)
                  }
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

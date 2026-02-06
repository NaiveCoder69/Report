import React, { useEffect, useRef, useState } from "react";
import API from "../api";

export default function UniversalChat() {
  /* ---------------- INLINE CSS ---------------- */
  const styles = `
    .chat-shell {
      display: flex;
      justify-content: center;
      padding: 16px;
      background: #f4f6f8;
      min-height: 100vh;
    }
    .chat-box {
      width: 100%;
      max-width: 420px;
      height: 85vh;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .chat-header {
      padding: 14px 16px;
      background: #0d6efd;
      color: #fff;
      font-weight: 600;
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      background: #f8f9fa;
      display: flex;
      flex-direction: column;
    }
    .chat-msg {
      max-width: 78%;
      padding: 10px 14px;
      margin-bottom: 10px;
      border-radius: 14px;
      font-size: 14px;
    }
    .chat-msg.bot {
      background: #e9ecef;
      align-self: flex-start;
    }
    .chat-msg.user {
      background: #0d6efd;
      color: #fff;
      align-self: flex-end;
    }
    .chat-input {
      padding: 12px;
      border-top: 1px solid #eee;
      background: #fff;
    }
    .chat-input input,
    .chat-input select,
    .chat-input button {
      width: 100%;
      padding: 10px;
      border-radius: 10px;
      border: 1px solid #ccc;
      font-size: 14px;
    }
    .chat-input button {
      margin-top: 6px;
      background: #0d6efd;
      color: white;
      border: none;
    }
    .chat-suggestions {
      margin-top: 6px;
      border: 1px solid #ddd;
      border-radius: 10px;
      overflow: hidden;
    }
    .chat-suggestions div {
      padding: 10px;
      cursor: pointer;
    }
    .chat-suggestions div:hover {
      background: #f1f1f1;
    }
  `;

  /* ---------------- ACTIONS ---------------- */
  const ACTIONS = [
    { key: "project", label: "Add Project" },
    { key: "vendor", label: "Add Vendor" },
    { key: "material", label: "Add Material" },
    { key: "expense", label: "Add Expense" },
    { key: "delivery", label: "Add Delivery" },
    { key: "bill", label: "Add Bill" },
    { key: "labor", label: "Add Labor Contractor" },
  ];

  /* ---------------- FLOWS ---------------- */
  const FLOWS = {
    project: {
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
    },
    vendor: {
      api: "/vendors",
      fields: [
        { key: "name", label: "Vendor name" },
        { key: "contactPerson", label: "Contact person", optional: true },
        { key: "phone", label: "Phone", optional: true },
        { key: "email", label: "Email", optional: true },
        { key: "address", label: "Address", optional: true },
      ],
    },
    material: {
      api: "/materials",
      fields: [
        { key: "name", label: "Material name" },
        { key: "unitType", label: "Unit type" },
      ],
    },
    expense: {
      api: "/expenses",
      fields: [
        { key: "project", label: "Select project", type: "project" },
        { key: "description", label: "Description" },
        { key: "category", label: "Category", optional: true },
        { key: "amount", label: "Amount (₹)", type: "number" },
        { key: "date", label: "Expense date", type: "date" },
        { key: "remarks", label: "Remarks", optional: true },
      ],
    },
    delivery: {
      api: "/material-deliveries",
      fields: [
        { key: "project", label: "Select project", type: "project" },
        { key: "vendor", label: "Select vendor", type: "vendor" },
        { key: "material", label: "Select material", type: "material" },
        { key: "quantity", label: "Quantity", type: "number" },
        { key: "rate", label: "Rate (₹)", type: "number" },
        { key: "date", label: "Delivery date", type: "date" },
      ],
    },
    bill: {
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
    },
    labor: {
      api: "/labor-contractors",
      fields: [{ key: "name", label: "Labor contractor name" }],
    },
  };

  /* ---------------- STATE ---------------- */
  const [query, setQuery] = useState("");
  const [action, setAction] = useState(null);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [inputValue, setInputValue] = useState("");
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
    API.get("/labor-contractors").then((r) =>
      setLaborContractors(r.data)
    );
  }, []);

  const flow = action ? FLOWS[action] : null;
  const currentField = flow?.fields[step];

  const addMsg = (from, text) =>
    setMessages((m) => [...m, { from, text }]);

  const startAction = (a) => {
    setAction(a.key);
    setStep(0);
    setFormData({});
    setInputValue("");
    setMessages([{ from: "bot", text: a.label }]);
    addMsg("bot", FLOWS[a.key].fields[0].label);
  };

  const submitValue = async (value) => {
    if (!value) return;
    const updated = { ...formData, [currentField.key]: value };
    setFormData(updated);
    addMsg("user", value);
    setInputValue("");

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
      setStep(0);
    }
  };

  const suggestions = ACTIONS.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <style>{styles}</style>

      <div className="chat-shell">
        <div className="chat-box">
          <div className="chat-header">🤖 Smart Assistant</div>

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
                  <select
                    onChange={(e) => submitValue(e.target.value)}
                  >
                    <option value="">Select</option>
                    {currentField.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )}

                {["project", "vendor", "material", "labor"].includes(
                  currentField.type
                ) && (
                  <select
                    onChange={(e) => submitValue(e.target.value)}
                  >
                    <option value="">Select</option>
                    {(currentField.type === "project"
                      ? projects
                      : currentField.type === "vendor"
                      ? vendors
                      : currentField.type === "material"
                      ? materials
                      : laborContractors
                    ).map((x) => (
                      <option key={x._id} value={x._id}>
                        {x.name}
                      </option>
                    ))}
                  </select>
                )}

                {!currentField.type && (
                  <>
                    <input
                      type={currentField.type || "text"}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={currentField.label}
                      onKeyDown={(e) =>
                        e.key === "Enter" && submitValue(inputValue)
                      }
                    />
                    <button onClick={() => submitValue(inputValue)}>
                      Send
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

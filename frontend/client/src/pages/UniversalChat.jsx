import React, { useEffect, useRef, useState } from "react";
import API from "../api";

const ACTIONS = [
  "Add Project",
  "Add Vendor",
  "Add Material",
  "Add Expense",
  "Add Delivery",
  "Add Bill",
  "Add Labor Contractor",
];

export default function UniversalChat() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 What do you want to do?" },
  ]);
  const [action, setAction] = useState(null);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");

  const endRef = useRef(null);

  /* ---------------- SCROLL (ONLY AFTER MESSAGE ADD) ---------------- */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (from, text) => {
    setMessages((prev) => [...prev, { from, text }]);
  };

  /* ---------------- FLOWS ---------------- */
  const FLOWS = {
    "Add Project": {
      api: "/projects",
      fields: [
        { key: "name", label: "Project name" },
        { key: "client", label: "Client name" },
        { key: "location", label: "Location" },
        { key: "budget", label: "Budget (optional)", optional: true },
        { key: "startDate", label: "Start date" },
        { key: "endDate", label: "End date (optional)", optional: true },
        { key: "assignedEngineer", label: "Assigned engineer" },
      ],
    },

    "Add Vendor": {
      api: "/vendors",
      fields: [
        { key: "name", label: "Vendor name" },
        { key: "contactPerson", label: "Contact person (optional)", optional: true },
        { key: "phone", label: "Phone number (optional)", optional: true },
        { key: "email", label: "Email (optional)", optional: true },
        { key: "address", label: "Address (optional)", optional: true },
      ],
    },

    "Add Material": {
      api: "/materials",
      fields: [
        { key: "name", label: "Material name" },
        { key: "unitType", label: "Unit type (bag, ton, etc.)" },
      ],
    },

    "Add Expense": {
      api: "/expenses",
      fields: [
        { key: "project", label: "Project name" },
        { key: "description", label: "Expense description" },
        { key: "category", label: "Category (optional)", optional: true },
        { key: "amount", label: "Amount (₹)" },
        { key: "date", label: "Expense date" },
        { key: "remarks", label: "Remarks (optional)", optional: true },
      ],
    },

    "Add Delivery": {
      api: "/material-deliveries",
      fields: [
        { key: "project", label: "Project name" },
        { key: "vendor", label: "Vendor name" },
        { key: "material", label: "Material name" },
        { key: "quantity", label: "Quantity" },
        { key: "rate", label: "Rate (₹)" },
        { key: "date", label: "Delivery date" },
      ],
    },

    "Add Bill": {
      api: "/bills",
      fields: [
        { key: "billNumber", label: "Bill number" },
        {
          key: "recipientType",
          label: "Recipient type (vendor / labor-contractor)",
        },
        {
          key: "vendor",
          label: "Vendor name",
          requiredIf: (d) => d.recipientType === "vendor",
        },
        {
          key: "laborContractor",
          label: "Labor contractor name",
          requiredIf: (d) => d.recipientType === "labor-contractor",
        },
        {
          key: "project",
          label: "Project name",
          requiredIf: (d) => d.recipientType === "labor-contractor",
        },
        { key: "amount", label: "Amount (₹)" },
        { key: "billDate", label: "Bill date" },
        { key: "remarks", label: "Remarks (optional)", optional: true },
      ],
    },

    "Add Labor Contractor": {
      api: "/labor-contractors",
      fields: [
        { key: "name", label: "Labor contractor name" },
        { key: "phone", label: "Phone number (optional)", optional: true },
        { key: "address", label: "Address (optional)", optional: true },
      ],
    },
  };

  const flow = action ? FLOWS[action] : null;

  /* ---------------- FIELD RESOLVER ---------------- */
  const getCurrentField = () => {
    if (!flow) return null;

    for (let i = step; i < flow.fields.length; i++) {
      const f = flow.fields[i];
      if (!f.requiredIf || f.requiredIf(formData)) {
        if (i !== step) setStep(i);
        return f;
      }
    }
    return null;
  };

  const currentField = getCurrentField();

  /* ---------------- START ACTION ---------------- */
  const startAction = (act) => {
    setAction(act);
    setStep(0);
    setFormData({});
    setInput("");
    setQuery("");
    addMessage("user", act);
    addMessage("bot", FLOWS[act].fields[0].label);
  };

  /* ---------------- SUBMIT INPUT ---------------- */
  const submitInput = async () => {
    if (!currentField) return;
    if (!input && !currentField.optional) return;

    const value = input.trim();
    const updated = { ...formData, [currentField.key]: value };

    setFormData(updated);
    addMessage("user", value || "—");
    setInput("");

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
      addMessage("bot", flow.fields[next].label);
    } else {
      await API.post(flow.api, updated);
      addMessage("bot", "✅ Added successfully");
      setAction(null);
      setStep(0);
      setFormData({});
    }
  };

  /* ---------------- SUGGESTIONS ---------------- */
  const suggestions = ACTIONS.filter((a) =>
    a.toLowerCase().includes(query.toLowerCase())
  );

  /* ---------------- UI ---------------- */
  return (
    <div style={{ padding: 20 }}>
      <div style={{ maxWidth: 420, margin: "auto" }}>
        <h5 style={{ marginBottom: 10 }}>🤖 Smart Assistant</h5>

        <div
          style={{
            height: "70vh",
            overflowY: "auto",
            border: "1px solid #ddd",
            padding: 10,
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                textAlign: m.from === "user" ? "right" : "left",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: m.from === "user" ? "#0d6efd" : "#eee",
                  color: m.from === "user" ? "#fff" : "#000",
                }}
              >
                {m.text}
              </span>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {!action && (
          <>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to add..."
              style={{ width: "100%", padding: 10 }}
            />
            {query && (
              <div style={{ border: "1px solid #ddd", marginTop: 4 }}>
                {suggestions.map((a) => (
                  <div
                    key={a}
                    style={{ padding: 8, cursor: "pointer" }}
                    onClick={() => startAction(a)}
                  >
                    {a}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {action && currentField && (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitInput()}
            placeholder={currentField.label}
            style={{ width: "100%", padding: 10 }}
          />
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import API from "../api";

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

const projectFlow = {
  api: "/projects",
  success: "✅ Project added successfully!",
  fields: [
    { key: "name", label: "Enter project name", type: "text", required: true },
    { key: "client", label: "Enter client name", type: "text", required: true },
    { key: "location", label: "Enter project location", type: "text", required: true },
    { key: "budget", label: "Enter budget (optional)", type: "number", required: false },
    { key: "startDate", label: "Select start date", type: "date", required: true },
    { key: "endDate", label: "Select end date (optional)", type: "date", required: false },
    { key: "assignedEngineer", label: "Enter assigned engineer", type: "text", required: true },
  ],
};

const vendorFlow = {
  api: "/vendors",
  success: "✅ Vendor added successfully!",
  fields: [
    { key: "name", label: "Enter vendor name", type: "text", required: true },
    { key: "contactPerson", label: "Enter contact person (optional)", type: "text", required: false },
    { key: "phone", label: "Enter phone number (optional)", type: "text", required: false },
    { key: "email", label: "Enter email (optional)", type: "email", required: false },
    { key: "address", label: "Enter address (optional)", type: "text", required: false },
  ],
};

const materialFlow = {
  api: "/materials",
  success: "✅ Material added successfully!",
  fields: [
    { key: "name", label: "Enter material name", type: "text", required: true },
    { key: "unitType", label: "Enter unit type (e.g., bag, ton)", type: "text", required: true },
  ],
};

const FLOWS = {
  project: projectFlow,
  vendor: vendorFlow,
  material: materialFlow,
};

/* ---------------- COMPONENT ---------------- */

export default function UniversalChat() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 What do you want to do?" },
  ]);

  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [flowKey, setFlowKey] = useState(null);
  const [step, setStep] = useState(-1);
  const [formData, setFormData] = useState({});

  const flow = flowKey ? FLOWS[flowKey] : null;
  const currentField = flow?.fields[step];

  /* ---------------- HELPERS ---------------- */

  const addBot = (text) =>
    setMessages((m) => [...m, { sender: "bot", text }]);

  const addUser = (text) =>
    setMessages((m) => [...m, { sender: "user", text }]);

  /* ---------------- AUTO SUGGEST ---------------- */

  useEffect(() => {
    if (flowKey) return;

    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    setSuggestions(
      ACTIONS.filter((a) =>
        a.label.toLowerCase().includes(input.toLowerCase())
      )
    );
  }, [input, flowKey]);

  /* ---------------- START ACTION ---------------- */

  const startAction = (action) => {
    addUser(action.label);
    setInput("");
    setSuggestions([]);

    if (!FLOWS[action.key]) {
      addBot("🚧 This action will be enabled soon.");
      return;
    }

    setFlowKey(action.key);
    setStep(0);
    setFormData({});
  };

  /* ---------------- ASK QUESTION ---------------- */

  useEffect(() => {
    if (currentField) {
      addBot(currentField.label);
    }
  }, [step]);

  /* ---------------- SUBMIT FIELD ---------------- */

  const submitField = async () => {
    if (!currentField) return;

    if (!input && currentField.required) {
      addBot("❗ This field is required.");
      return;
    }

    addUser(input || "(skipped)");

    const updated = {
      ...formData,
      [currentField.key]: input,
    };

    setFormData(updated);
    setInput("");

    if (step < flow.fields.length - 1) {
      setStep(step + 1);
    } else {
      await submitForm(updated);
    }
  };

  /* ---------------- FINAL SUBMIT ---------------- */

  const submitForm = async (payload) => {
    try {
      await API.post(flow.api, payload);
      addBot(flow.success);
    } catch (err) {
      addBot("❌ Failed to add data.");
      console.error(err);
    }

    setFlowKey(null);
    setStep(-1);
    setFormData({});
    addBot("What do you want to do next?");
  };

  /* ---------------- UI ---------------- */

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>🤖 Smart Assistant</div>

      <div style={styles.chat}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.msg,
              alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
              background: m.sender === "user" ? "#DCF8C6" : "#fff",
            }}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div style={styles.inputArea}>
        <input
          type={currentField?.type || "text"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type here…"
          style={styles.input}
        />
        <button onClick={flowKey ? submitField : undefined} style={styles.sendBtn}>
          ➤
        </button>
      </div>

      {!flowKey && suggestions.length > 0 && (
        <div style={styles.suggestions}>
          {suggestions.map((s) => (
            <div
              key={s.key}
              style={styles.suggestion}
              onClick={() => startAction(s)}
            >
              {s.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  wrapper: {
    maxWidth: 520,
    height: "85vh",
    margin: "20px auto",
    border: "1px solid #ddd",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    background: "#f0f0f0",
    position: "relative",
  },
  header: {
    padding: 14,
    background: "#075E54",
    color: "#fff",
    fontWeight: 600,
    borderRadius: "12px 12px 0 0",
  },
  chat: {
    flex: 1,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
  },
  msg: {
    padding: "10px 14px",
    borderRadius: 12,
    maxWidth: "80%",
    fontSize: 15,
  },
  inputArea: {
    display: "flex",
    padding: 10,
    gap: 8,
    borderTop: "1px solid #ddd",
    background: "#fff",
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    border: "1px solid #ccc",
    outline: "none",
  },
  sendBtn: {
    padding: "0 18px",
    borderRadius: "50%",
    border: "none",
    background: "#075E54",
    color: "#fff",
    cursor: "pointer",
  },
  suggestions: {
    position: "absolute",
    bottom: 60,
    left: 10,
    right: 10,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  suggestion: {
    padding: 12,
    cursor: "pointer",
    borderBottom: "1px solid #eee",
  },
};

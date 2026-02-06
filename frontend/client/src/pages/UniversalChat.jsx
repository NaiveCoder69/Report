import React, { useEffect, useState } from "react";
import API from "../api";

/* ---------------- ACTIONS REGISTRY ---------------- */

const ACTIONS = [
  { key: "project", label: "Add Project" },
  { key: "vendor", label: "Add Vendor" },
  { key: "material", label: "Add Material" },
  { key: "expense", label: "Add Expense" },
  { key: "delivery", label: "Add Delivery" },
  { key: "bill", label: "Add Bill" },
  { key: "labor", label: "Add Labor Contractor" },
];

/* ---------------- PROJECT FLOW ---------------- */

const projectFlow = [
  { key: "name", label: "Enter project name", type: "text", required: true },
  { key: "client", label: "Enter client name", type: "text", required: true },
  { key: "location", label: "Enter project location", type: "text", required: true },
  { key: "budget", label: "Enter budget (optional)", type: "number", required: false },
  { key: "startDate", label: "Select start date", type: "date", required: true },
  { key: "endDate", label: "Select end date (optional)", type: "date", required: false },
  { key: "assignedEngineer", label: "Enter assigned engineer", type: "text", required: true },
];

export default function UniversalChat() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 What do you want to do?" },
  ]);

  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [flow, setFlow] = useState(null);
  const [step, setStep] = useState(-1);
  const [formData, setFormData] = useState({});

  /* ---------------- HELPERS ---------------- */

  const addBot = (text) =>
    setMessages((m) => [...m, { sender: "bot", text }]);

  const addUser = (text) =>
    setMessages((m) => [...m, { sender: "user", text }]);

  /* ---------------- AUTO SUGGEST ---------------- */

  useEffect(() => {
    if (flow) return; // disable suggestions during flow

    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = ACTIONS.filter((a) =>
      a.label.toLowerCase().includes(input.toLowerCase())
    );

    setSuggestions(filtered);
  }, [input, flow]);

  /* ---------------- START FLOW ---------------- */

  const startAction = (action) => {
    addUser(action.label);
    setInput("");
    setSuggestions([]);

    if (action.key === "project") {
      setFlow(projectFlow);
      setStep(0);
      setFormData({});
    } else {
      addBot("🚧 This action will be enabled next.");
    }
  };

  /* ---------------- FLOW HANDLING ---------------- */

  useEffect(() => {
    if (flow && step >= 0) {
      addBot(flow[step].label);
    }
  }, [step]);

  const submitField = async () => {
    const current = flow[step];

    if (!input && current.required) {
      addBot("❗ This field is required.");
      return;
    }

    addUser(input || "(skipped)");

    const updated = {
      ...formData,
      [current.key]: input,
    };

    setFormData(updated);
    setInput("");

    if (step < flow.length - 1) {
      setStep(step + 1);
    } else {
      await submitProject(updated);
    }
  };

  const submitProject = async (payload) => {
    try {
      await API.post("/projects", payload);
      addBot("✅ Project added successfully!");
    } catch (err) {
      addBot("❌ Failed to add project.");
      console.error(err);
    }

    setFlow(null);
    setStep(-1);
    setFormData({});
    addBot("What do you want to do next?");
  };

  /* ---------------- UI ---------------- */

  const currentField = flow?.[step];

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

        <button
          onClick={flow ? submitField : undefined}
          style={styles.sendBtn}
        >
          ➤
        </button>
      </div>

      {!flow && suggestions.length > 0 && (
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

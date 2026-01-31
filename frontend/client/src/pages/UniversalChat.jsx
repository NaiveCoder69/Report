import React, { useEffect, useState } from "react";
import API from "../api";

const projectFlow = [
  { key: "name", label: "Enter project name", type: "text", required: true },
  { key: "client", label: "Enter client name", type: "text", required: true },
  { key: "location", label: "Enter project location", type: "text", required: true },
  { key: "budget", label: "Enter budget (optional)", type: "number", required: false },
  { key: "startDate", label: "Select start date", type: "date", required: true },
  { key: "endDate", label: "Select end date (optional)", type: "date", required: false },
  { key: "assignedEngineer", label: "Enter assigned engineer", type: "text", required: true },
];

const UniversalChat = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 What do you want to do?" }
  ]);
  const [step, setStep] = useState(-1);
  const [input, setInput] = useState("");
  const [formData, setFormData] = useState({});
  const [flow, setFlow] = useState(null);

  useEffect(() => {
    if (step >= 0 && flow) {
      addBotMessage(flow[step].label);
    }
  }, [step]);

  const addBotMessage = (text) => {
    setMessages((prev) => [...prev, { sender: "bot", text }]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { sender: "user", text }]);
  };

  const startProjectFlow = () => {
    setFlow(projectFlow);
    setFormData({});
    setStep(0);
    addUserMessage("Add Project");
  };

  const handleSubmitValue = async () => {
    const current = flow[step];

    if (!input && current.required) {
      addBotMessage("❗ This field is required.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [current.key]: input,
    }));

    addUserMessage(input || "(skipped)");
    setInput("");

    if (step < flow.length - 1) {
      setStep(step + 1);
    } else {
      await submitProject({
        ...formData,
        [current.key]: input,
      });
    }
  };

  const submitProject = async (payload) => {
    try {
      await API.post("/projects", payload);
      addBotMessage("✅ Project added successfully!");
    } catch (err) {
      addBotMessage("❌ Failed to add project.");
      console.error(err);
    }

    setStep(-1);
    setFlow(null);
    setFormData({});
    addBotMessage("What do you want to do next?");
  };

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
        {step === -1 ? (
          <button onClick={startProjectFlow} style={styles.actionBtn}>
            ➕ Add Project
          </button>
        ) : (
          <>
            <input
              type={currentField.type}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleSubmitValue} style={styles.sendBtn}>
              ➤
            </button>
          </>
        )}
      </div>
    </div>
  );
};

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
  actionBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    border: "none",
    background: "#075E54",
    color: "#fff",
    cursor: "pointer",
  },
};

export default UniversalChat;

import React, { useEffect, useRef, useState } from "react";
import API from "../api";

export default function UniversalChat() {
  /* -------------------- UI STATE -------------------- */
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 What do you want to do?" },
  ]);
  const [mode, setMode] = useState(null);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [formData, setFormData] = useState({});

  /* -------------------- DROPDOWN DATA -------------------- */
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [laborContractors, setLaborContractors] = useState([]);

  const bottomRef = useRef(null);

  /* -------------------- FETCH DATA -------------------- */
  useEffect(() => {
    API.get("/projects").then(res => setProjects(res.data || []));
    API.get("/vendors").then(res => setVendors(res.data || []));
    API.get("/materials").then(res => setMaterials(res.data || []));
    API.get("/labor-contractors").then(res => setLaborContractors(res.data || []));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMsg = (from, text) =>
    setMessages(prev => [...prev, { from, text }]);

  /* -------------------- ACTIONS -------------------- */
  const ACTIONS = [
    "Add Project",
    "Add Vendor",
    "Add Material",
    "Add Expense",
    "Add Delivery",
    "Add Bill",
    "Add Labor Contractor",
  ];

  /* -------------------- FLOWS -------------------- */
  const FLOWS = {
    "Add Bill": {
      api: "/bills",
      steps: [
        { key: "billNumber", label: "Enter bill number", type: "text" },
        {
          key: "recipientType",
          label: "Select recipient type",
          type: "select",
          options: [
            { label: "Vendor", value: "vendor" },
            { label: "Labor Contractor", value: "labor-contractor" },
          ],
        },
        {
          key: "vendor",
          label: "Select vendor",
          type: "select",
          showIf: d => d.recipientType === "vendor",
          options: vendors.map(v => ({ label: v.name, value: v._id })),
        },
        {
          key: "laborContractor",
          label: "Select labor contractor",
          type: "select",
          showIf: d => d.recipientType === "labor-contractor",
          options: laborContractors.map(l => ({ label: l.name, value: l._id })),
        },
        {
          key: "project",
          label: "Select project",
          type: "select",
          showIf: d => d.recipientType === "labor-contractor",
          options: projects.map(p => ({ label: p.name, value: p._id })),
        },
        { key: "amount", label: "Enter amount (₹)", type: "number" },
        { key: "billDate", label: "Select bill date", type: "date" },
        { key: "remarks", label: "Remarks (optional)", type: "text", optional: true },
      ],
    },
  };

  const flow = FLOWS[mode];

  const currentStep = flow?.steps.filter(
    s => !s.showIf || s.showIf(formData)
  )[step];

  /* -------------------- HANDLERS -------------------- */
  const startAction = (a) => {
    setMode(a);
    setStep(0);
    setFormData({});
    addMsg("user", a);
    addMsg("bot", FLOWS[a].steps[0].label);
  };

  const handleSubmitValue = async (value) => {
    const stepDef = currentStep;
    const updated = { ...formData, [stepDef.key]: value };

    setFormData(updated);
    addMsg("user", stepDef.type === "select"
      ? stepDef.options.find(o => o.value === value)?.label
      : value || "—"
    );

    const validSteps = flow.steps.filter(
      s => !s.showIf || s.showIf(updated)
    );

    if (step + 1 < validSteps.length) {
      setStep(step + 1);
      addMsg("bot", validSteps[step + 1].label);
    } else {
      await API.post(flow.api, updated);
      addMsg("bot", "✅ Added successfully");
      setMode(null);
      setStep(0);
      setFormData({});
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <div style={styles.header}>🤖 Smart Assistant</div>

        <div style={styles.body}>
          {messages.map((m, i) => (
            <div key={i} style={{
              ...styles.msg,
              alignSelf: m.from === "user" ? "flex-end" : "flex-start",
              background: m.from === "user" ? "#0d6efd" : "#e9ecef",
              color: m.from === "user" ? "#fff" : "#000",
            }}>
              {m.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {!mode && (
          <div style={styles.actions}>
            {ACTIONS.map(a => (
              <button key={a} style={styles.actionBtn} onClick={() => startAction(a)}>
                {a}
              </button>
            ))}
          </div>
        )}

        {mode && currentStep && (
          <div style={styles.inputArea}>
            {currentStep.type === "select" ? (
              <select
                style={styles.input}
                onChange={e => handleSubmitValue(e.target.value)}
                defaultValue=""
              >
                <option value="">Select...</option>
                {currentStep.options.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <input
                style={styles.input}
                type={currentStep.type}
                placeholder={currentStep.label}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    handleSubmitValue(input);
                    setInput("");
                  }
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- STYLES -------------------- */
const styles = {
  shell: {
    display: "flex",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: 420,
    height: "80vh",
    background: "#fff",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
  },
  header: {
    padding: 16,
    background: "#0d6efd",
    color: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    fontWeight: 600,
  },
  body: {
    flex: 1,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflowY: "auto",
  },
  msg: {
    padding: "8px 12px",
    borderRadius: 12,
    maxWidth: "75%",
    fontSize: 14,
  },
  actions: {
    padding: 12,
    display: "grid",
    gap: 8,
  },
  actionBtn: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#f8f9fa",
    cursor: "pointer",
  },
  inputArea: {
    padding: 12,
    borderTop: "1px solid #eee",
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
};

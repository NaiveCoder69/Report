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
  const [activeAction, setActiveAction] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState("");
  const [formData, setFormData] = useState({});
  const [search, setSearch] = useState("");

  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [laborContractors, setLaborContractors] = useState([]);
  const [bills, setBills] = useState([]);

  const bottomRef = useRef(null);

  useEffect(() => {
    API.get("/projects").then(r => setProjects(r.data || []));
    API.get("/vendors").then(r => setVendors(r.data || []));
    API.get("/materials").then(r => setMaterials(r.data || []));
    API.get("/labor-contractors").then(r => setLaborContractors(r.data || []));
    API.get("/bills").then(r => setBills(r.data || []));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMsg = (from, text) =>
    setMessages(prev => [...prev, { from, text }]);

  /* ---------------- BILL NUMBER (UNCHANGED) ---------------- */
  const getNextBillNumber = () => {
    if (!bills.length) return "";
    let max = null;
    let base = "";
    bills.forEach(b => {
      const match = b.billNumber?.match(/(\d+)$/);
      if (!match) return;
      const num = parseInt(match[1], 10);
      if (max === null || num > max) {
        max = num;
        base = b.billNumber.replace(/\d+$/, "");
      }
    });
    if (max === null) return "";
    return `${base}${String(max + 1).padStart(3, "0")}`;
  };

  /* ---------------- FLOWS ---------------- */
  const FLOWS = {
    /* ✅ ADD PROJECT */
    "Add Project": {
      api: "/projects",
      steps: [
        { key: "name", label: "Project name", type: "text" },
        { key: "client", label: "Client", type: "text" },
        { key: "location", label: "Location", type: "text" },
        { key: "budget", label: "Budget (optional)", type: "number", optional: true },
        { key: "startDate", label: "Start date", type: "date" },
        { key: "endDate", label: "End date (optional)", type: "date", optional: true },
        { key: "assignedEngineer", label: "Assigned engineer", type: "text" },
      ],
    },

    /* 🔒 ADD BILL (UNCHANGED) */
    "Add Bill": {
      api: "/bills",
      steps: [
        { key: "billNumber", label: "Bill number", type: "text", auto: true },
        {
          key: "recipientType",
          label: "Who is this bill for?",
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
        { key: "amount", label: "Amount (₹)", type: "number" },
        { key: "billDate", label: "Bill date", type: "date" },
        { key: "remarks", label: "Remarks (optional)", type: "text", optional: true },
      ],
    },
  };

  const flow = FLOWS[activeAction];
  const visibleSteps = flow
    ? flow.steps.filter(s => !s.showIf || s.showIf(formData))
    : [];
  const currentStep = visibleSteps[stepIndex];

  /* ---------------- START ACTION ---------------- */
  const startAction = (action) => {
    setActiveAction(action);
    setStepIndex(0);
    setFormData({});
    setInput("");
    setSearch("");
    addMsg("user", action);

    if (action === "Add Bill") {
      const autoBill = getNextBillNumber();
      if (autoBill) {
        setFormData({ billNumber: autoBill });
        addMsg("bot", `🧾 Bill number will be: ${autoBill}`);
        addMsg("bot", visibleSteps[1].label);
        setStepIndex(1);
        return;
      }
    }

    addMsg("bot", visibleSteps[0].label);
  };

  /* ---------------- SUBMIT STEP ---------------- */
  const submitValue = async (value) => {
    const step = currentStep;
    const updated = { ...formData, [step.key]: value };

    setFormData(updated);
    addMsg("user", value || "—");
    setInput("");

    if (stepIndex + 1 < visibleSteps.length) {
      setStepIndex(stepIndex + 1);
      addMsg("bot", visibleSteps[stepIndex + 1].label);
    } else {
      await API.post(flow.api, updated);
      addMsg("bot", "✅ Saved successfully");
      setActiveAction(null);
      setStepIndex(0);
      setFormData({});
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={styles.wrapper}>
      <div style={styles.chatBox}>
        <div style={styles.header}>💬 Smart Assistant</div>

        <div style={styles.messages}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                ...styles.msg,
                alignSelf: m.from === "user" ? "flex-end" : "flex-start",
                background: m.from === "user" ? "#2563eb" : "#f1f5f9",
                color: m.from === "user" ? "#fff" : "#000",
              }}
            >
              {m.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {!activeAction && (
          <div style={styles.inputBar}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Type to add…"
              style={styles.input}
            />
            <div style={styles.suggestions}>
              {ACTIONS.filter(a =>
                a.toLowerCase().includes(search.toLowerCase())
              ).map(a => (
                <div
                  key={a}
                  style={styles.suggestion}
                  onClick={() => startAction(a)}
                >
                  {a}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeAction && currentStep && (
          <div style={styles.inputBar}>
            <input
              type={currentStep.type}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitValue(input)}
              placeholder={currentStep.label}
              style={styles.input}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", justifyContent: "center", padding: 20 },
  chatBox: {
    width: 420,
    height: "80vh",
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: 16,
    background: "linear-gradient(135deg,#2563eb,#1e40af)",
    color: "#fff",
    fontWeight: 600,
  },
  messages: {
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
  inputBar: { padding: 12, borderTop: "1px solid #e5e7eb" },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #cbd5f5",
  },
  suggestions: { marginTop: 6, display: "flex", flexDirection: "column", gap: 4 },
  suggestion: {
    padding: 8,
    borderRadius: 8,
    background: "#f1f5f9",
    cursor: "pointer",
  },
};

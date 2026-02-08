import React, { useEffect, useRef, useState } from "react";
import API from "../api";

/* =======================
   UNIVERSAL CHAT
   ======================= */

export default function UniversalChat() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi 👋 What would you like to do?" }
  ]);

  const [input, setInput] = useState("");
  const [currentFlow, setCurrentFlow] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [inputType, setInputType] = useState("text");

  const chatEndRef = useRef(null);

  /* =======================
     SCROLL CONTROL
     ======================= */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =======================
     ACTION DEFINITIONS
     ======================= */

  const ACTIONS = {
    "Add Project": {
      endpoint: "/projects",
      steps: [
        { key: "name", label: "Project name", type: "text" },
        { key: "client", label: "Client name", type: "text" },
        { key: "location", label: "Project location", type: "text" },
        { key: "budget", label: "Budget (₹)", type: "number", optional: true },
        { key: "startDate", label: "Start date", type: "date" },
        { key: "endDate", label: "End date", type: "date", optional: true },
        { key: "assignedEngineer", label: "Assigned engineer", type: "text" }
      ]
    },

    "Add Vendor": {
      endpoint: "/vendors",
      steps: [
        { key: "name", label: "Vendor name", type: "text" },
        { key: "contactPerson", label: "Contact person", type: "text", optional: true },
        { key: "phone", label: "Phone number", type: "text", optional: true },
        { key: "email", label: "Email address", type: "text", optional: true },
        { key: "address", label: "Address", type: "text", optional: true }
      ]
    },

    "Add Material": {
      endpoint: "/materials",
      steps: [
        { key: "name", label: "Material name", type: "text" },
        { key: "unitType", label: "Unit type (bag, ton, truck)", type: "text" }
      ]
    },

    "Add Labor Contractor": {
      endpoint: "/labor-contractors",
      steps: [
        { key: "name", label: "Labor contractor name", type: "text" },
        { key: "phone", label: "Phone number", type: "text", optional: true },
        { key: "address", label: "Address", type: "text", optional: true }
      ]
    },

    "Add Expense": {
      endpoint: "/expenses",
      steps: [
        { key: "project", label: "Select project", type: "select", source: "/projects" },
        { key: "description", label: "Expense description", type: "text" },
        { key: "category", label: "Category", type: "text", optional: true },
        { key: "amount", label: "Amount (₹)", type: "number" },
        { key: "date", label: "Expense date", type: "date" },
        { key: "remarks", label: "Remarks", type: "text", optional: true }
      ]
    },

    "Add Delivery": {
      endpoint: "/material-deliveries",
      steps: [
        { key: "project", label: "Select project", type: "select", source: "/projects" },
        { key: "vendor", label: "Select vendor", type: "select", source: "/vendors" },
        { key: "material", label: "Select material", type: "select", source: "/materials" },
        { key: "quantity", label: "Quantity", type: "number" },
        { key: "rate", label: "Rate (₹)", type: "number" },
        { key: "date", label: "Delivery date", type: "date" }
      ]
    },

    "Add Bill": {
      endpoint: "/bills",
      steps: [
        { key: "billNumber", label: "Bill number (auto-filled)", type: "auto" },
        { key: "recipientType", label: "Bill recipient type", type: "select-static", options: [
          { label: "Vendor", value: "vendor" },
          { label: "Labor Contractor", value: "labor-contractor" }
        ]},
        { key: "recipient", label: "Select recipient", type: "conditional" },
        { key: "project", label: "Select project", type: "select", source: "/projects", dependsOn: "labor-contractor" },
        { key: "amount", label: "Bill amount (₹)", type: "number" },
        { key: "billDate", label: "Bill date", type: "date" },
        { key: "remarks", label: "Remarks", type: "text", optional: true }
      ]
    }
  };

  /* =======================
     FETCH HELPERS
     ======================= */

  const loadDropdown = async (source) => {
    const res = await API.get(source);
    return res.data.map(item => ({
      label: item.name,
      value: item._id
    }));
  };

  const getNextBillNumber = async () => {
    const res = await API.get("/bills");
    if (!res.data.length) return "BILL-001";
    const nums = res.data
      .map(b => parseInt(b.billNumber?.match(/\d+$/)?.[0] || 0));
    return `BILL-${String(Math.max(...nums) + 1).padStart(3, "0")}`;
  };

  /* =======================
     FLOW HANDLER
     ======================= */

  const startFlow = async (action) => {
    setCurrentFlow(action);
    setStepIndex(0);
    setFormData({});
    setDropdownOptions([]);

    setMessages(m => [...m, { from: "user", text: action }]);

    const step = ACTIONS[action].steps[0];

    if (step.type === "auto") {
      const billNo = await getNextBillNumber();
      setFormData({ billNumber: billNo });
      nextStep({ auto: billNo });
      return;
    }

    askStep(step);
  };

  const askStep = async (step) => {
    setMessages(m => [...m, { from: "bot", text: step.label }]);

    if (step.type === "select") {
      const options = await loadDropdown(step.source);
      setDropdownOptions(options);
      setInputType("select");
    } else if (step.type === "select-static") {
      setDropdownOptions(step.options);
      setInputType("select");
    } else {
      setDropdownOptions([]);
      setInputType(step.type);
    }
  };

  const nextStep = async (valueObj) => {
    const flow = ACTIONS[currentFlow];
    const step = flow.steps[stepIndex];

    setFormData(prev => ({ ...prev, ...valueObj }));

    const nextIndex = stepIndex + 1;

    if (nextIndex >= flow.steps.length) {
      await API.post(flow.endpoint, { ...formData, ...valueObj });
      setMessages(m => [...m, { from: "bot", text: "✅ Done successfully!" }]);
      setCurrentFlow(null);
      setInput("");
      return;
    }

    setStepIndex(nextIndex);
    const nextStepDef = flow.steps[nextIndex];

    if (nextStepDef.type === "conditional") {
      if (valueObj.recipientType === "vendor") {
        const vendors = await loadDropdown("/vendors");
        setDropdownOptions(vendors);
        setInputType("select");
        setMessages(m => [...m, { from: "bot", text: "Select vendor" }]);
      } else {
        const labors = await loadDropdown("/labor-contractors");
        setDropdownOptions(labors);
        setInputType("select");
        setMessages(m => [...m, { from: "bot", text: "Select labor contractor" }]);
      }
      return;
    }

    askStep(nextStepDef);
  };

  /* =======================
     SUBMIT HANDLER
     ======================= */

  const handleSubmit = async () => {
    if (!input && inputType !== "select") return;

    setMessages(m => [...m, { from: "user", text: input }]);

    const key = ACTIONS[currentFlow].steps[stepIndex].key;
    await nextStep({ [key]: input });

    setInput("");
  };

  /* =======================
     RENDER
     ======================= */

  return (
    <div style={styles.shell}>
      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div key={i} style={m.from === "bot" ? styles.bot : styles.user}>
            {m.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {!currentFlow && (
        <div style={styles.actions}>
          {Object.keys(ACTIONS).map(a => (
            <button key={a} style={styles.actionBtn} onClick={() => startFlow(a)}>
              {a}
            </button>
          ))}
        </div>
      )}

      {currentFlow && (
        <div style={styles.inputArea}>
          {inputType === "select" && (
            <select
              style={styles.select}
              onChange={e => {
                setMessages(m => [...m, { from: "user", text: e.target.options[e.target.selectedIndex].text }]);
                nextStep({ [ACTIONS[currentFlow].steps[stepIndex].key]: e.target.value });
              }}
              defaultValue=""
            >
              <option value="" disabled>Select</option>
              {dropdownOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          )}

          {inputType !== "select" && (
            <input
              style={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Type here..."
            />
          )}
        </div>
      )}
    </div>
  );
}

/* =======================
   STYLES
   ======================= */

const styles = {
  shell: { height: "100%", display: "flex", flexDirection: "column" },
  chatBox: { flex: 1, padding: 12, overflowY: "auto", background: "#f5f7fb" },
  bot: { background: "#fff", padding: 10, borderRadius: 10, marginBottom: 6, maxWidth: "70%" },
  user: { background: "#2563eb", color: "#fff", padding: 10, borderRadius: 10, marginBottom: 6, marginLeft: "auto", maxWidth: "70%" },
  actions: { display: "flex", flexWrap: "wrap", gap: 8, padding: 8 },
  actionBtn: { padding: "6px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" },
  inputArea: { padding: 8, borderTop: "1px solid #ddd" },
  input: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" },
  select: { width: "100%", padding: 10, borderRadius: 8 }
};

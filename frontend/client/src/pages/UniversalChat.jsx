import React, { useEffect, useRef, useState } from "react";
import API from "../api";

export default function UniversalChat() {
  /* ================== INLINE CSS ================== */
  const styles = `
    .chat-shell{display:flex;justify-content:center;padding:16px;background:#f4f6f8;min-height:100vh}
    .chat-box{width:100%;max-width:420px;height:85vh;background:#fff;border-radius:16px;
      box-shadow:0 10px 30px rgba(0,0,0,.08);display:flex;flex-direction:column}
    .chat-header{padding:14px 16px;background:#0d6efd;color:#fff;font-weight:600}
    .chat-messages{flex:1;overflow-y:auto;padding:14px;background:#f8f9fa}
    .chat-msg{max-width:78%;padding:10px 14px;margin-bottom:10px;border-radius:14px;font-size:14px}
    .chat-msg.bot{background:#e9ecef}
    .chat-msg.user{background:#0d6efd;color:#fff;margin-left:auto}
    .chat-input{padding:12px;border-top:1px solid #eee}
    .chat-input input,.chat-input select,.chat-input button{
      width:100%;padding:10px;border-radius:10px;border:1px solid #ccc}
    .chat-input button{margin-top:6px;background:#0d6efd;color:#fff;border:none}
    .chat-suggestions{margin-top:6px;border:1px solid #ddd;border-radius:10px;overflow:hidden}
    .chat-suggestions div{padding:10px;cursor:pointer}
    .chat-suggestions div:hover{background:#f1f1f1}
  `;

  /* ================== ACTIONS ================== */
  const ACTIONS = [
    { key: "project", label: "Add Project" },
    { key: "vendor", label: "Add Vendor" },
    { key: "material", label: "Add Material" },
    { key: "expense", label: "Add Expense" },
    { key: "delivery", label: "Add Delivery" },
    { key: "bill", label: "Add Bill" },
    { key: "labor", label: "Add Labor Contractor" },
  ];

  /* ================== FLOWS ================== */
  const FLOWS = {
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
    // (other flows remain same as before)
  };

  /* ================== STATE ================== */
  const [query, setQuery] = useState("");
  const [action, setAction] = useState(null);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "What do you want to do?" },
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
    API.get("/projects").then(r => setProjects(r.data));
    API.get("/vendors").then(r => setVendors(r.data));
    API.get("/materials").then(r => setMaterials(r.data));
    API.get("/labor-contractors").then(r => setLaborContractors(r.data));
  }, []);

  const flow = action ? FLOWS[action] : null;
  const field = flow?.fields[step];

  const addMsg = (from, text) =>
    setMessages(m => [...m, { from, text }]);

  const startAction = (a) => {
    setAction(a.key);
    setStep(0);
    setFormData({});
    setMessages([{ from: "bot", text: a.label }]);
    addMsg("bot", FLOWS[a.key].fields[0].label);
  };

  const handleSelect = async (id) => {
    let list = [];
    if (field.type === "project") list = projects;
    if (field.type === "vendor") list = vendors;
    if (field.type === "material") list = materials;
    if (field.type === "labor") list = laborContractors;

    const selected = list.find(x => x._id === id);
    if (!selected) return;

    const updated = { ...formData, [field.key]: id };
    setFormData(updated);
    addMsg("user", selected.name); // ✅ SHOW NAME, NOT ID

    proceedNext(updated);
  };

  const submitText = async () => {
    if (!inputValue) return;
    const updated = { ...formData, [field.key]: inputValue };
    setFormData(updated);
    addMsg("user", inputValue);
    setInputValue("");
    proceedNext(updated);
  };

  const proceedNext = async (data) => {
    const next = step + 1;
    if (next < flow.fields.length) {
      setStep(next);
      addMsg("bot", flow.fields[next].label);
    } else {
      await API.post(flow.api, data);
      addMsg("bot", "✅ Added successfully");
      setAction(null);
      setQuery("");
      setStep(0);
    }
  };

  const suggestions = ACTIONS.filter(a =>
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
                    {suggestions.map(a => (
                      <div key={a.key} onClick={() => startAction(a)}>
                        {a.label}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {action && field && (
              <>
                {["project","vendor","material","labor"].includes(field.type) && (
                  <select onChange={(e) => handleSelect(e.target.value)}>
                    <option value="">Select</option>
                    {(field.type === "project" ? projects :
                      field.type === "vendor" ? vendors :
                      field.type === "material" ? materials :
                      laborContractors
                    ).map(x => (
                      <option key={x._id} value={x._id}>{x.name}</option>
                    ))}
                  </select>
                )}

                {!field.type && (
                  <>
                    <input
                      type={field.type || "text"}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitText()}
                      placeholder={field.label}
                    />
                    <button onClick={submitText}>Send</button>
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

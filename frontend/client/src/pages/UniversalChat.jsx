import React, { useState, useRef, useEffect, useContext } from "react";
import API from "../api";
import { AuthContext } from "../contexts/AuthContext";

const UniversalChat = () => {
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [messages, setMessages] = useState([
    { text: "👋 What would you like to add?", type: "bot", id: 1 }
  ]);
  const messagesEndRef = useRef(null);

  // Actions configuration
  const actions = {
    "Add Vendor": ["name", "materialType", "contact"],
    "Add Delivery": ["project", "vendor", "material", "quantity", "rate"],
    "Add Expense": ["project", "category", "amount", "description"],
    "Add Material": ["name", "unit"]
  };

  const actionOptions = [
    "Add Vendor", "Add Delivery", "Add Expense", "Add Material"
  ];

  // Mock data - replace with your API calls
  const projects = ["Project Alpha", "Project Beta", "PNK Site 1"];
  const vendors = ["ABC Cement", "XYZ Bricks", "Super Sand"];
  const materials = ["Cement", "Bricks", "Sand", "Steel"];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, step]);

  const addMessage = (text, type = "bot") => {
    setMessages(prev => [...prev, { text, type, id: Date.now() }]);
  };

  const handleActionSelect = (action) => {
    setFormData({ action });
    setStep(1);
    addMessage(`Great! Let's add a ${action.toLowerCase()}.`);
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (step < actions[formData.action].length) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    addMessage("✅ Creating...", "bot");
    
    try {
      const response = await API.post("/chat/parse", { 
        action: formData.action,
        data: formData,
        companyId: user?.company?._id
      });
      
      addMessage(`✅ ${formData.action} created successfully!`, "success");
      // Reset
      setStep(0);
      setFormData({});
    } catch (error) {
      addMessage("❌ Something went wrong. Try again.", "error");
    }
  };

  const currentField = actions[formData.action]?.[step - 1];
  const isLastStep = step === actions[formData.action]?.length;

  return (
    <div style={{
      width: "100%",
      maxWidth: "500px",
      height: "500px",
      border: "1px solid #ddd",
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      background: "#fff",
      fontFamily: "-apple-system, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        padding: "16px",
        background: "#0B3D91",
        color: "white",
        borderRadius: "12px 12px 0 0"
      }}>
        <h3 style={{ margin: 0 }}>🤖 Smart Assistant</h3>
        <p style={{ margin: "4px 0 0 0", fontSize: "14px", opacity: 0.9 }}>
          Guided data entry
        </p>
      </div>

      {/* Messages History */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        padding: "16px",
        background: "#f8f9fa"
      }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            marginBottom: "12px",
            padding: "12px 16px",
            background: msg.type === "success" ? "#d4edda" : 
                       msg.type === "error" ? "#f8d7da" : "#fff",
            borderRadius: "12px",
            maxWidth: "80%"
          }}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Current Step Input */}
      <div style={{ padding: "16px", borderTop: "1px solid #eee", background: "#fff" }}>
        {step === 0 ? (
          /* Step 1: Select Action */
          <div>
            <p style={{ margin: "0 0 12px 0", fontWeight: 500 }}>What would you like to do?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {actionOptions.map(option => (
                <button
                  key={option}
                  onClick={() => handleActionSelect(option)}
                  style={{
                    padding: "12px 16px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    background: formData.action === option ? "#0B3D91" : "#fff",
                    color: formData.action === option ? "white" : "#333",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : !isLastStep ? (
          /* Step 2-N: Field Inputs */
          <div>
            <p style={{ margin: "0 0 12px 0", fontWeight: 500 }}>
              Step {step}/{actions[formData.action].length}: {currentField.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </p>
            
            {currentField === "quantity" || currentField === "rate" || currentField === "amount" ? (
              /* Number Input */
              <input
                type="number"
                placeholder="Enter number"
                value={formData[currentField] || ""}
                onChange={(e) => handleFieldChange(currentField, e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px"
                }}
              />
            ) : currentField === "project" ? (
              /* Project Dropdown */
              <select
                value={formData.project || ""}
                onChange={(e) => handleFieldChange("project", e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                  background: "#fff"
                }}
              >
                <option value="">Select Project</option>
                {projects.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            ) : currentField === "vendor" ? (
              /* Vendor Dropdown */
              <select
                value={formData.vendor || ""}
                onChange={(e) => handleFieldChange("vendor", e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                  background: "#fff"
                }}
              >
                <option value="">Select Vendor</option>
                {vendors.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            ) : currentField === "material" ? (
              /* Material Dropdown */
              <select
                value={formData.material || ""}
                onChange={(e) => handleFieldChange("material", e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                  background: "#fff"
                }}
              >
                <option value="">Select Material</option>
                {materials.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              /* Text Input */
              <input
                type="text"
                placeholder={`Enter ${currentField}...`}
                value={formData[currentField] || ""}
                onChange={(e) => handleFieldChange(currentField, e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px"
                }}
              />
            )}
            
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  marginTop: "12px",
                  padding: "8px 16px",
                  border: "1px solid #999",
                  background: "#fff",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                ← Back
              </button>
            )}
          </div>
        ) : (
          /* Final Confirmation */
          <div>
            <h4 style={{ margin: "0 0 16px 0" }}>Review & Confirm</h4>
            <div style={{
              padding: "16px",
              background: "#f8f9fa",
              borderRadius: "8px",
              marginBottom: "16px"
            }}>
              <strong>{formData.action}</strong><br/>
              {Object.entries(formData).map(([key, value]) => (
                key !== "action" && (
                  <div key={key} style={{ margin: "4px 0", fontSize: "14px" }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value}
                  </div>
                )
              ))}
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleSubmit}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: "#0B3D91",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  cursor: "pointer"
                }}
              >
                ✅ Create
              </button>
              <button
                onClick={() => setStep(0)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: "#fff",
                  color: "#0B3D91",
                  border: "1px solid #0B3D91",
                  borderRadius: "8px",
                  fontSize: "16px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalChat;

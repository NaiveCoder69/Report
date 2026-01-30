import React, { useState, useRef, useEffect, useContext } from "react";
import API from "../api";
import { AuthContext } from "../contexts/AuthContext";

const UniversalChat = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { text: "👋 What to add today?", type: "bot", time: "Just now", id: 1 }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text, type = "user") => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { text, type, time, id: Date.now() }]);
  };

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;

    const userInput = input.trim();
    setInput("");
    inputRef.current?.focus();
    addMessage(userInput, "user");
    setLoading(true);

    try {
      const response = await API.post("/chat/parse", { 
        message: userInput,
        companyId: user?.company?._id
      });
      
      addMessage(response.data.message || "✅ Done!", "bot");
      if (response.data.success && response.data.action) {
        addMessage(`✅ ${response.data.action} completed!`, "success");
      }
    } catch (error) {
      console.error("Chat error:", error);
      addMessage("❌ Try: 'add delivery cement 50 450'", "error");
    } finally {
      setLoading(false);
    }
  };

  // Voice Recognition
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    window.startVoice = () => recognition.start();
  }, []);

  // Quick Action Buttons (EXACTLY like PDF)
  const quickActions = [
    { label: "📦 Delivery", command: "add delivery cement 50 450" },
    { label: "💰 Expense", command: "add expense transport 5000" },
    { label: "🧱 Material", command: "add material bricks" },
    { label: "🏭 Vendor", command: "add vendor ABC cement" }
  ];

  return (
    <div style={{ 
      width: "100%", 
      maxWidth: "500px", 
      height: "500px", 
      borderRadius: "16px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      display: "flex", 
      flexDirection: "column",
      background: "#fff",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "hidden"
    }}>
      {/* WhatsApp-style Header */}
      <div style={{
        padding: "16px 20px",
        background: "#075E54",
        color: "white",
        borderBottom: "1px solid #128C7E"
      }}>
        <div style={{ fontSize: "18px", fontWeight: 600 }}>
          💬 Data Entry
        </div>
        <div style={{ fontSize: "13px", opacity: 0.9 }}>
          Say "add delivery cement 50 450"
        </div>
      </div>

      {/* Quick Buttons Row (EXACTLY like PDF) */}
      <div style={{
        padding: "12px 16px",
        background: "#E5DDD5",
        borderBottom: "1px solid #D1D7D2",
        display: "flex",
        gap: "8px",
        flexWrap: "wrap"
      }}>
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => setInput(action.command)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              background: "#FFF",
              color: "#075E54",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              whiteSpace: "nowrap"
            }}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages - WhatsApp Style */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        padding: "16px",
        background: "#E5DDD5"
      }}>
        {messages.map((msg) => (
          <div 
            key={msg.id}
            style={{
              marginBottom: "16px",
              display: "flex",
              justifyContent: msg.type === "user" ? "flex-end" : "flex-start"
            }}
          >
            <div style={{
              maxWidth: "70%",
              padding: "12px 16px",
              borderRadius: "18px",
              background: msg.type === "user" 
                ? "#DCF8C6" 
                : msg.type === "success" 
                ? "#D4EDDA" 
                : msg.type === "error" 
                ? "#F8D7DA" 
                : "#FFF",
              color: "#000",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              position: "relative"
            }}>
              <div style={{ 
                whiteSpace: "pre-wrap", 
                lineHeight: 1.4,
                fontSize: "15px"
              }}>
                {msg.text}
              </div>
              <div style={{
                marginTop: "4px",
                fontSize: "12px",
                opacity: 0.7,
                textAlign: msg.type === "user" ? "right" : "left"
              }}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", padding: "8px 0" }}>
            <div style={{
              padding: "12px 16px",
              background: "#FFF",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <div style={{ 
                width: "8px", height: "8px", 
                background: "#919191", 
                borderRadius: "50%",
                animation: "typing 1.4s infinite"
              }} />
              <div style={{ 
                width: "8px", height: "8px", 
                background: "#919191", 
                borderRadius: "50%",
                animation: "typing 1.4s infinite 0.2s"
              }} />
              <div style={{ 
                width: "8px", height: "8px", 
                background: "#919191", 
                borderRadius: "50%",
                animation: "typing 1.4s infinite 0.4s"
              }} />
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp Input */}
      <div style={{
        padding: "12px 16px",
        background: "#F0F0F0",
        borderTop: "1px solid #E1E1E1",
        display: "flex",
        alignItems: "flex-end",
        gap: "12px"
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
          placeholder="add delivery cement 50 450..."
          style={{
            flex: 1,
            border: "none",
            borderRadius: "24px",
            padding: "12px 20px",
            fontSize: "16px",
            background: "#FFF",
            outline: "none",
            maxHeight: "44px",
            overflow: "hidden"
          }}
          disabled={loading}
        />
        <button 
          onClick={() => window.startVoice?.()}
          disabled={loading}
          style={{
            width: "44px",
            height: "44px",
            border: "none",
            borderRadius: "50%",
            background: isListening ? "#25D366" : "#008069",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          🎤
        </button>
        <button 
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          style={{
            width: "44px",
            height: "44px",
            border: "none",
            borderRadius: "50%",
            background: loading || !input.trim() ? "#A9A9A9" : "#25D366",
            color: "white",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          📤
        </button>
      </div>

      <style>{`
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default UniversalChat;

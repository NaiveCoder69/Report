import React, { useState, useRef, useEffect, useContext } from "react";
import API from "../api";
import { AuthContext } from "../contexts/AuthContext"; // For user info

const UniversalChat = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { 
      text: "👋 Welcome back to Data Entry Assistant!", 
      type: "bot", 
      timestamp: new Date(),
      id: Date.now()
    },
    { 
      text: "Quick commands:\n• `add delivery cement 50 450`\n• `add expense transport 5000`\n• `add material bricks`\n• `add vendor ABC cement`\n• `show projects`", 
      type: "bot", 
      timestamp: new Date() + 1,
      id: Date.now() + 1
    }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const wsRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket for real-time chat (company-specific)
  useEffect(() => {
    if (user?.company) {
      const wsUrl = `ws://localhost:4000/chat?company=${user.company._id}&user=${user.email}`;
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log("✅ Chat WebSocket connected");
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        addMessage(data.message, data.type || "bot");
      };
      
      wsRef.current.onclose = () => {
        console.log("❌ WebSocket disconnected");
      };
      
      return () => {
        wsRef.current?.close();
      };
    }
  }, [user]);

  const addMessage = (text, type = "user") => {
    setMessages(prev => [...prev, { 
      text, 
      type, 
      timestamp: new Date(),
      id: Date.now()
    }]);
  };

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;

    const userInput = input.trim();
    const userMessage = {
      text: userInput,
      type: "user",
      user: user?.name || user?.email || "User",
      company: user?.company?._id,
      timestamp: new Date()
    };

    setInput("");
    inputRef.current?.focus();
    addMessage(userInput, "user");
    setLoading(true);

    // Send to WebSocket (real-time)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(userMessage));
    }

    // Send to API (data processing)
    try {
      const response = await API.post("/chat/parse", { 
        message: userInput,
        companyId: user?.company?._id
      });
      
      const botResponse = response.data.message || "✅ Action completed!";
      addMessage(botResponse, response.data.success ? "success" : "bot");
      
      if (response.data.success && response.data.action) {
        addMessage(`✅ ${response.data.action} processed successfully!`, "success");
      }
    } catch (error) {
      console.error("Chat API error:", error);
      addMessage(
        "❌ Sorry, I didn't understand that. Try:\n• `add delivery cement 50 450`\n• `add expense transport 5000`\n• `add material bricks`", 
        "error"
      );
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

  // INLINE STYLES - NO CSS IMPORT NEEDED ✅
  const chatStyles = {
    container: {
      maxWidth: "500px",
      height: "400px",
      border: "1px solid #ddd",
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      background: "#fff",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif"
    },
    header: {
      padding: "16px",
      background: "linear-gradient(135deg, #0B3D91 0%, #1e5bb8 100%)",
      color: "white",
      borderRadius: "12px 12px 0 0"
    },
    messages: {
      flex: 1,
      overflowY: "auto",
      padding: "16px",
      background: "#f8f9fa"
    },
    inputArea: {
      padding: "12px 16px",
      borderTop: "1px solid #eee",
      display: "flex",
      gap: "8px",
      alignItems: "center"
    },
    input: {
      flex: 1,
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "10px 14px",
      fontSize: "14px",
      outline: "none",
      background: "#fff"
    },
    voiceBtn: {
      width: "44px",
      height: "44px",
      border: "none",
      borderRadius: "50%",
      background: "#007bff",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      transition: "all 0.2s"
    },
    sendBtn: {
      width: "44px",
      height: "44px",
      border: "none",
      borderRadius: "50%",
      background: "#28a745",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      transition: "all 0.2s"
    }
  };

  return (
    <div style={chatStyles.container}>
      {/* Header */}
      <div style={chatStyles.header}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
          🤖 Data Entry Assistant
        </h3>
        <div style={{ fontSize: "12px", opacity: 0.9 }}>
          Quick actions: Delivery • Expense • Material • Vendor
        </div>
      </div>

      {/* Messages */}
      <div style={chatStyles.messages}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            style={{
              marginBottom: "12px",
              display: "flex",
              justifyContent: msg.type === "user" ? "flex-end" : "flex-start"
            }}
          >
            <div 
              style={{
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius: "18px",
                background: msg.type === "user" 
                  ? "#007bff" 
                  : msg.type === "success" 
                  ? "#28a745" 
                  : msg.type === "error" 
                  ? "#dc3545" 
                  : "#fff",
                color: msg.type === "user" || msg.type === "success" ? "white" : "#333",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                position: "relative"
              }}
            >
              <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.4" }}>
                {msg.text}
              </div>
              <small style={{
                display: "block",
                marginTop: "4px",
                opacity: 0.7,
                fontSize: "11px"
              }}>
                {msg.timestamp.toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "8px" }}>
            <div style={{
              padding: "10px 14px",
              background: "#e9ecef",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <div style={{ fontSize: "20px" }}>🤖</div>
              <div style={{
                display: "flex",
                gap: "4px"
              }}>
                <span style={{ width: "8px", height: "8px", background: "#adb5bd", borderRadius: "50%", animation: "dot 1.4s infinite" }}></span>
                <span style={{ width: "8px", height: "8px", background: "#adb5bd", borderRadius: "50%", animation: "dot 1.4s infinite 0.2s" }}></span>
                <span style={{ width: "8px", height: "8px", background: "#adb5bd", borderRadius: "50%", animation: "dot 1.4s infinite 0.4s" }}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={chatStyles.inputArea}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
          placeholder="Type command like 'add delivery cement 50 450' or tap 🎤"
          style={chatStyles.input}
          disabled={loading}
          autoFocus
        />
        <button 
          onClick={window.startVoice} 
          style={{
            ...chatStyles.voiceBtn,
            background: isListening ? "#ff4757" : "#007bff",
            boxShadow: isListening ? "0 0 0 3px rgba(255,71,87,0.3)" : "none"
          }}
          title="Voice Input (Hindi/English)"
        >
          🎤
        </button>
        <button 
          onClick={handleSubmit} 
          disabled={loading || !input.trim()}
          style={{
            ...chatStyles.sendBtn,
            opacity: loading || !input.trim() ? 0.5 : 1,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer"
          }}
        >
          📤
        </button>
      </div>

      <style jsx>{`
        @keyframes dot {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default UniversalChat;

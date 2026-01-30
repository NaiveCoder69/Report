import React, { useState, useRef, useEffect, useContext } from "react";
import API from "../api";
import { AuthContext } from "../contexts/AuthContext";

const UniversalChat = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { 
      text: "👋 Welcome to Data Entry Assistant!", 
      type: "bot", 
      time: "Just now",
      id: "1"
    },
    { 
      text: "Quick commands:\n• `add delivery cement 50 450`\n• `add expense transport 5000`\n• `add material bricks`\n• `add vendor ABC cement`\n• `show projects`", 
      type: "bot", 
      time: "Just now",
      id: "2"
    }
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
    const time = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    setMessages(prev => [...prev, { 
      text, 
      type, 
      time,  // ✅ STRING ONLY - NO CRASHES
      id: Date.now().toString()
    }]);
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
      
      const botResponse = response.data.message || "✅ Action completed!";
      addMessage(botResponse, response.data.success ? "success" : "bot");
      
      if (response.data.success && response.data.action) {
        addMessage(`✅ ${response.data.action} processed!`, "success");
      }
    } catch (error) {
      console.error("Chat API error:", error);
      addMessage(
        "❌ Sorry! Try:\n• `add delivery cement 50 450`\n• `add expense transport 5000`", 
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Voice Recognition - SAFE
  useEffect(() => {
    if (typeof window !== 'undefined' && "webkitSpeechRecognition" in window) {
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
    }
  }, []);

  return (
    <div style={{
      width: "100%",
      maxWidth: "500px",
      height: "400px",
      border: "1px solid #e0e0e0",
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      background: "#ffffff",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        padding: "16px",
        background: "linear-gradient(135deg, #0B3D91 0%, #1e5bb8 100%)",
        color: "white",
        borderRadius: "12px 12px 0 0"
      }}>
        <div style={{ 
          margin: 0, 
          fontSize: "16px", 
          fontWeight: 600 
        }}>
          🤖 Data Entry Assistant
        </div>
        <div style={{ 
          fontSize: "12px", 
          opacity: 0.9, 
          marginTop: "4px" 
        }}>
          Type or speak construction commands
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        background: "#f8f9fa"
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
              maxWidth: "75%",
              padding: "12px 16px",
              borderRadius: "20px",
              background: msg.type === "user" 
                ? "#007bff" 
                : msg.type === "success" 
                ? "#28a745" 
                : msg.type === "error" 
                ? "#dc3545" 
                : "#ffffff",
              color: msg.type === "user" || msg.type === "success" ? "#ffffff" : "#333333",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              wordWrap: "break-word"
            }}>
              <div style={{ 
                whiteSpace: "pre-wrap", 
                lineHeight: 1.4,
                fontSize: "14px"
              }}>
                {msg.text}
              </div>
              <div style={{
                marginTop: "6px",
                fontSize: "11px",
                opacity: 0.8
              }}>
                {msg.time} {/* ✅ STRING - NO CRASH */}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {loading && (
          <div style={{ 
            display: "flex", 
            justifyContent: "flex-start", 
            padding: "8px 0" 
          }}>
            <div style={{
              padding: "12px 16px",
              background: "#e9ecef",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <span style={{ fontSize: "20px" }}>🤖</span>
              <div style={{ 
                display: "flex", 
                gap: "4px", 
                height: "12px" 
              }}>
                <div style={{ 
                  width: "8px", 
                  height: "8px", 
                  background: "#6c757d", 
                  borderRadius: "50%",
                  animation: "typing 1.4s infinite"
                }} />
                <div style={{ 
                  width: "8px", 
                  height: "8px", 
                  background: "#6c757d", 
                  borderRadius: "50%",
                  animation: "typing 1.4s infinite 0.2s"
                }} />
                <div style={{ 
                  width: "8px", 
                  height: "8px", 
                  background: "#6c757d", 
                  borderRadius: "50%",
                  animation: "typing 1.4s infinite 0.4s"
                }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid #e9ecef",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "#ffffff"
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Type 'add delivery cement 50 450' or tap 🎤"
          style={{
            flex: 1,
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            padding: "10px 14px",
            fontSize: "14px",
            outline: "none",
            background: "#ffffff"
          }}
          disabled={loading}
          autoFocus
        />
        <button 
          onClick={() => window.startVoice?.()}
          style={{
            width: "44px",
            height: "44px",
            border: "none",
            borderRadius: "50%",
            background: isListening ? "#ef4444" : "#3b82f6",
            color: "#ffffff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
          }}
          title="Voice Input"
          disabled={loading}
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
            background: loading || !input.trim() ? "#9ca3af" : "#10b981",
            color: "#ffffff",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
          }}
        >
          {loading ? "⏳" : "📤"}
        </button>
      </div>

      <style>{`
        @keyframes typing {
          0%, 80%, 100% { 
            transform: scale(0.8); 
            opacity: 0.5; 
          }
          40% { 
            transform: scale(1); 
            opacity: 1; 
          }
        }
      `}</style>
    </div>
  );
};

export default UniversalChat;

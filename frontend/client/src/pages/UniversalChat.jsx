import React, { useState, useRef, useEffect } from "react";
import API from "../api"; // your existing API client
// import "./styles/universalChat.css"; 

const UniversalChat = () => {
  const [messages, setMessages] = useState([
    { text: "👋 Welcome! Say or type:", type: "bot", timestamp: new Date() },
    { 
      text: "Examples:\n• add delivery cement 50 450\n• add expense transport 5000\n• add material bricks\n• add vendor ABC cement", 
      type: "bot", 
      timestamp: new Date() 
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
    setInput("");
    inputRef.current?.focus();
    addMessage(userInput, "user");
    setLoading(true);

    try {
      const response = await API.post("/chat/parse", { 
        message: userInput 
      });
      
      addMessage(response.data.message, "bot");
      if (response.data.success) {
        addMessage(`✅ ${response.data.action} completed!`, "success");
      }
    } catch (error) {
      console.error("Chat API error:", error);
      addMessage(
        "❌ Sorry, I didn't understand. Try:\n'add delivery cement 50 450'\n'add expense transport 5000'", 
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

  return (
    <div className="universal-chat">
      <div className="chat-header">
        <h2>📱 Data Entry Assistant</h2>
        <div className="quick-examples">
          <button onClick={() => setInput("add delivery cement 50 450")}>📦 Delivery</button>
          <button onClick={() => setInput("add expense transport 5000")}>💰 Expense</button>
          <button onClick={() => setInput("add material bricks")}>🧱 Material</button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.type}`}>
            <div className="message-bubble">
              {msg.type === "user" ? "👷" : "🤖"}
              <div className="message-text">{msg.text}</div>
            </div>
            <small className="message-time">
              {msg.timestamp.toLocaleTimeString()}
            </small>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {loading && (
          <div className="message bot">
            <div className="typing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
            placeholder="Type 'add delivery cement 50 450' or tap 🎤"
            className="chat-input"
            disabled={loading}
            autoFocus
          />
          <button 
            onClick={window.startVoice} 
            className={`voice-btn ${isListening ? 'active' : ''}`}
            title="Voice Input"
          >
            🎤
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading || !input.trim()}
            className="send-btn"
          >
            📤
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniversalChat;

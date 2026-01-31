import React, { useState, useRef, useEffect } from "react";
import API from "../api";

const UniversalChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "👋 Hi! You can type things like:\n\n• add delivery cement 50 450\n• add expense transport 5000\n• add vendor abc cement"
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      // STEP 2 will connect real backend logic
      const res = await API.post("/chat", {
        message: userMessage.text
      });

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: res.data?.reply || "✅ Received"
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: "bot",
          text: "❌ Could not connect. Backend not ready yet."
        }
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        🤖 Smart Assistant
      </div>

      {/* Messages */}
      <div style={styles.chatBody}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              ...styles.message,
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              background: msg.sender === "user" ? "#DCF8C6" : "#fff"
            }}
          >
            {msg.text.split("\n").map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputBox}>
        <input
          type="text"
          placeholder="Type here…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.sendBtn}>
          ➤
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    maxWidth: "600px",
    height: "85vh",
    margin: "20px auto",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ddd",
    borderRadius: "12px",
    background: "#f0f0f0"
  },
  header: {
    padding: "14px",
    background: "#075E54",
    color: "#fff",
    fontWeight: "600",
    borderRadius: "12px 12px 0 0"
  },
  chatBody: {
    flex: 1,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    overflowY: "auto"
  },
  message: {
    maxWidth: "75%",
    padding: "10px 14px",
    borderRadius: "12px",
    fontSize: "15px",
    whiteSpace: "pre-wrap"
  },
  inputBox: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #ddd",
    background: "#fff"
  },
  input: {
    flex: 1,
    padding: "10px",
    fontSize: "16px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    outline: "none"
  },
  sendBtn: {
    marginLeft: "10px",
    padding: "0 18px",
    borderRadius: "50%",
    border: "none",
    background: "#075E54",
    color: "#fff",
    fontSize: "18px",
    cursor: "pointer"
  }
};

export default UniversalChat;

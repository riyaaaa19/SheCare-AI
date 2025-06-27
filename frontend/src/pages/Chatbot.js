import React, { useState, useRef, useEffect } from "react";
import api from "../api";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! How can I help you today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom on new message
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = async e => {
    e.preventDefault();
    if (!input) return;
    setLoading(true);
    setError("");
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { from: "user", text: input, time: now };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    try {
      const token = localStorage.getItem('token');
      const res = await api.post(
        "/chatbot",
        { message: userMsg.text },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessages(prev => [
        ...prev,
        { from: "bot", text: res.data.response || JSON.stringify(res.data), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    } catch (err) {
      setError("Failed to get AI response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)" }}>
      <div style={{ background: "#fff", padding: 36, borderRadius: 18, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", minWidth: 340, maxWidth: 420, width: "100%" }}>
        <h2 style={{ color: "#d72660", marginBottom: 24 }}>AI Chatbot</h2>
        <div style={{ minHeight: 220, maxHeight: 260, overflowY: "auto", marginBottom: 16, background: "#fce4ec", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              flexDirection: msg.from === "user" ? "row-reverse" : "row",
              alignItems: "flex-end",
              marginBottom: 8
            }}>
              <div style={{
                background: msg.from === "user" ? "#d72660" : "#fff0f6",
                color: msg.from === "user" ? "#fff" : "#d72660",
                borderRadius: msg.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                padding: "10px 16px",
                maxWidth: "75%",
                fontSize: 16,
                boxShadow: "0 2px 8px rgba(215,38,96,0.04)",
                marginLeft: msg.from === "user" ? 0 : 8,
                marginRight: msg.from === "user" ? 8 : 0
              }}>
                {msg.text}
                <div style={{ fontSize: 11, color: msg.from === "user" ? "#ffe0ec" : "#b71c4a", marginTop: 4, textAlign: "right" }}>{msg.time}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <div style={{
                background: "#fff0f6",
                color: "#d72660",
                borderRadius: "16px 16px 16px 4px",
                padding: "10px 16px",
                fontSize: 16,
                boxShadow: "0 2px 8px rgba(215,38,96,0.04)"
              }}>
                <span>Thinking…</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your message..." style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #ccc" }} disabled={loading} />
          <button type="submit" style={{ background: "#d72660", color: "#fff", border: "none", borderRadius: 6, padding: "0 18px", fontSize: 16, cursor: "pointer" }} disabled={loading || !input}>{loading ? "..." : "Send"}</button>
        </form>
        {error && <div style={{ color: "#d72660", marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
};

export default Chatbot; 
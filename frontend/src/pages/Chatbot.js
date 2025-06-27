import React, { useState, useRef, useEffect } from "react";
import api from "../api";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! How can I help you today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom on new message
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognitionRef.current.onend = () => {
      setListening(false);
    };
    recognitionRef.current.onerror = () => {
      setListening(false);
    };
  }, []);

  // Play audio from /voice-chat endpoint
  const playVoiceResponse = async (text) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/voice-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ text })
      });
      if (!response.ok) throw new Error('Failed to get audio');
      const audioData = await response.arrayBuffer();
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error('Voice playback error:', err);
    }
  };

  const handleSend = async e => {
    if (e) e.preventDefault();
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
      const botText = res.data.response || JSON.stringify(res.data);
      setMessages(prev => [
        ...prev,
        { from: "bot", text: botText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      // Play voice if present
      if (res.data.voice_base64) {
        const audio = new window.Audio("data:audio/mp3;base64," + res.data.voice_base64);
        audio.play();
      }
    } catch (err) {
      setError("Failed to get AI response.");
    } finally {
      setLoading(false);
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setListening(true);
      setInput("");
      recognitionRef.current.start();
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)" }}>
      <div style={{ background: "#fff", padding: 36, borderRadius: 18, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", minWidth: 340, maxWidth: 420, width: "100%" }}>
        <h2 style={{ color: "#d72660", marginBottom: 24 }}>SheBot</h2>
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
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your message... or use the mic" style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #ccc" }} disabled={loading} />
          <button type="button" onClick={handleMicClick} style={{ background: listening ? "#b71c4a" : "#fff", color: listening ? "#fff" : "#d72660", border: `2px solid #d72660`, borderRadius: 6, padding: "0 12px", fontSize: 18, cursor: "pointer" }} disabled={loading} title="Speak">
            {listening ? <span role="img" aria-label="Stop">🛑</span> : <span role="img" aria-label="Mic">🎤</span>}
          </button>
          <button type="submit" style={{ background: "#d72660", color: "#fff", border: "none", borderRadius: 6, padding: "0 18px", fontSize: 16, cursor: "pointer" }} disabled={loading || !input}>{loading ? "..." : "Send"}</button>
        </form>
        {error && <div style={{ color: "#d72660", marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
};

export default Chatbot; 
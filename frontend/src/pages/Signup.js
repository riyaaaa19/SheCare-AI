import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as api from "../api";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/signup", { full_name: name, email, password });
      setLoading(false);
      // Redirect to login page after successful signup
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 36, borderRadius: 18, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", minWidth: 340 }}>
        <h2 style={{ color: "#d72660", marginBottom: 24 }}>Sign Up for SheCare AI</h2>
        {error && <div style={{ color: "#d72660", marginBottom: 12 }}>{error}</div>}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }} disabled={loading} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }} disabled={loading} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }} disabled={loading} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Confirm Password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }} disabled={loading} />
        </div>
        <button type="submit" style={{ width: "100%", background: "#d72660", color: "#fff", border: "none", borderRadius: 6, padding: 12, fontSize: 16, cursor: "pointer", marginBottom: 12 }} disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</button>
        <div style={{ textAlign: "center", color: "#555" }}>
          Already have an account? <Link to="/login" style={{ color: "#d72660" }}>Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;
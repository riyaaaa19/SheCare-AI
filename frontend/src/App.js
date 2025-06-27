import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import PCOSChecker from "./pages/PCOSChecker";
import CycleTracker from "./pages/CycleTracker";
import Journal from "./pages/Journal";
import Chatbot from "./pages/Chatbot";
import Recommendations from "./pages/Recommendations";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";

const Landing = () => (
  <div style={{
    minHeight: "100vh",
    background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    position: "relative"
  }}>
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        background: "#fff",
        borderRadius: 24,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        padding: 40,
        maxWidth: 600,
        textAlign: "center"
      }}
    >
      <img src="/logo1.png" alt="SheCare AI Logo" style={{ width: 280, marginBottom: 35}} />
      <h1 style={{ fontSize: 36, color: "#d72660", marginBottom: 12 }}>SheCare AI</h1>
      <h2 style={{ fontWeight: 400, color: "#333", marginBottom: 24 }}>
        Empowering Women Through AI-Powered Health Insights
      </h2>
      <p style={{ color: "#555", fontSize: 18, marginBottom: 32 }}>
        SheCare AI is your smart, web-based wellness assistant. Get holistic, personalized health insights using the power of Machine Learning and Natural Language Processing. Understand your physical and emotional health—every day.
      </p>
      <Link to="/signup">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: "#d72660",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "14px 32px",
            fontSize: 18,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(215,38,96,0.08)"
          }}
        >
          Get Started
        </motion.button>
      </Link>
      <div className="feature-cards" style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
        <Feature icon="💡" title="Personalized Insights" />
        <Feature icon="🤖" title="AI Chatbot" />
        <Feature icon="🩺" title="PCOS Risk Checker" />
        <Feature icon="📅" title="Cycle Tracker" />
        <Feature icon="📝" title="Emotional Journal" />
      </div>
    </motion.div>
    <footer style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      background: "#fff0f6",
      color: "#d72660",
      textAlign: "center",
      padding: 16,
      fontSize: 16,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      boxShadow: "0 -2px 8px rgba(215,38,96,0.04)"
    }}>
      © {new Date().getFullYear()} SheCare AI. Empowering Women Everywhere.
    </footer>
  </div>
);

const Feature = ({ icon, title }) => (
  <motion.div
    whileHover={{ scale: 1.07, boxShadow: "0 4px 16px rgba(215,38,96,0.12)" }}
    style={{
      background: "#fce4ec",
      borderRadius: 12,
      padding: "18px 24px",
      minWidth: 120,
      textAlign: "center",
      fontSize: 20,
      color: "#d72660",
      fontWeight: 500,
      boxShadow: "0 2px 8px rgba(215,38,96,0.04)",
      marginBottom: 12,
      cursor: "pointer",
      transition: "box-shadow 0.2s"
    }}
  >
    <span style={{ fontSize: 28 }}>{icon}</span>
    <div>{title}</div>
  </motion.div>
);

function App() {
  return (
    <Router>
      <nav style={{ padding: 10, borderBottom: "1px solid #ccc" }}>
        <Link to="/" style={{ margin: 5 }}>Home</Link>
        <Link to="/login" style={{ margin: 5 }}>Login</Link>
        <Link to="/signup" style={{ margin: 5 }}>Signup</Link>
        <Link to="/dashboard" style={{ margin: 5 }}>Dashboard</Link>
        <Link to="/profile" style={{ margin: 5 }}>Profile</Link>
        <Link to="/pcos-checker" style={{ margin: 5 }}>PCOS Checker</Link>
        <Link to="/cycle-tracker" style={{ margin: 5 }}>Cycle Tracker</Link>
        <Link to="/journal" style={{ margin: 5 }}>Journal</Link>
        <Link to="/chatbot" style={{ margin: 5 }}>Chatbot</Link>
        <Link to="/recommendations" style={{ margin: 5 }}>Recommendations</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/pcos-checker" element={<PCOSChecker />} />
        <Route path="/cycle-tracker" element={<CycleTracker />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;

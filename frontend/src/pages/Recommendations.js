import React, { useEffect, useState } from "react";
import api from "../api";

const GROUPS = [
  { key: "pcos", label: "PCOS Guidance", icon: "🩺", color: "#ffb6c1" },
  { key: "mood", label: "Emotional Wellbeing", icon: "😊", color: "#f8bbd0" },
  { key: "cycle", label: "Cycle Tips", icon: "📅", color: "#ffcdd2" },
  { key: "alerts", label: "Alerts & Reminders", icon: "⏰", color: "#ffe0ec" }
];

const Recommendations = () => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("shecare_token");
    api.get("/recommendations", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => setRecs(res.data))
      .catch(() => setError("Failed to load recommendations."))
      .finally(() => setLoading(false));
  }, []);

  // Check if there are any recommendations
  const hasRecs = GROUPS.some(group => Array.isArray(recs[group.key]) && recs[group.key].length > 0) || (Array.isArray(recs) && recs.length > 0);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f8f9fa 0%, #ffe0ec 100%)", padding: 16 }}>
      <div style={{ background: "#fff", padding: 36, borderRadius: 24, boxShadow: "0 4px 32px rgba(215,38,96,0.10)", minWidth: 320, maxWidth: 480, width: "100%", transition: "box-shadow 0.3s", margin: 8 }}>
        <h2 style={{ color: "#d72660", marginBottom: 24, textAlign: "center", fontWeight: 700, letterSpacing: 1 }}>Personalized Recommendations</h2>
        {loading && <div style={{ textAlign: "center" }}>Loading...</div>}
        {error && <div style={{ color: "#d72660", marginBottom: 12, textAlign: "center" }}>{error}</div>}
        {hasRecs ? (
          GROUPS.map(group => (
            Array.isArray(recs[group.key]) && recs[group.key].length > 0 && (
              <div key={group.key} style={{ marginBottom: 28 }}>
                <h4 style={{ color: "#b71c4a", marginBottom: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{group.icon}</span> {group.label}
                </h4>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {recs[group.key].map((tip, i) => (
                    <li key={i} style={{ background: `linear-gradient(90deg, ${group.color} 60%, #fff0f6 100%)`, borderRadius: 16, padding: 16, marginBottom: 12, color: "#b71c4a", boxShadow: "0 2px 8px #f8bbd0", fontSize: 15, fontWeight: 500, transition: "box-shadow 0.2s" }}>{tip.text}</li>
                  ))}
                </ul>
              </div>
            )
          ))
        ) : (
          <div style={{ textAlign: "center", color: "#b71c4a", marginTop: 32, marginBottom: 24, fontSize: 17, fontWeight: 500, background: "#fff0f6", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px #f8bbd0" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>💡</div>
            No recommendations yet.<br />
            <span style={{ fontSize: 15, color: "#d72660" }}>Log your cycle, mood, and symptoms to unlock personalized insights!</span>
          </div>
        )}
        {/* Fallback if backend returns a flat array */}
        {Array.isArray(recs) && recs.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {recs.map((tip, i) => (
              <li key={i} style={{ background: "linear-gradient(90deg, #f8bbd0 60%, #fff0f6 100%)", borderRadius: 16, padding: 16, marginBottom: 12, color: "#b71c4a", boxShadow: "0 2px 8px #f8bbd0", fontSize: 15, fontWeight: 500, transition: "box-shadow 0.2s" }}>{tip.text}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Recommendations; 
import React, { useState, useEffect } from "react";
import * as api from "../api";
import SymptomForm from './SymptomForm';

const AdminPanel = () => {
  const [tab, setTab] = useState("analytics");
  const [data, setData] = useState({ analytics: null, tips: [], logs: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Health tips CRUD
  const [newTip, setNewTip] = useState("");
  const [editingTip, setEditingTip] = useState(null);
  const [editTipText, setEditTipText] = useState("");

  useEffect(() => {
    fetchTabData(tab);
    // eslint-disable-next-line
  }, [tab]);

  const fetchTabData = (tabName) => {
    setLoading(true);
    setError("");
    let endpoint = "/admin/analytics";
    if (tabName === "tips") endpoint = "/admin/tips";
    if (tabName === "logs") endpoint = "/admin/logs";
    api.get(endpoint)
      .then(res => {
        if (tabName === "tips") {
          setData(prev => ({ ...prev, tips: res.data.tips || res.data || [] }));
        } else {
          setData(prev => ({ ...prev, [tabName]: res.data }));
        }
      })
      .catch(() => setError(`Failed to load ${tabName}.`))
      .finally(() => setLoading(false));
  };

  // CRUD for health tips
  const handleAddTip = e => {
    e.preventDefault();
    if (!newTip) return;
    setLoading(true);
    api.post("/admin/tips", { text: newTip })
      .then(() => {
        setNewTip("");
        fetchTabData("tips");
      })
      .catch(() => setError("Failed to add tip."))
      .finally(() => setLoading(false));
  };
  const handleEditTip = (tip) => {
    setEditingTip(tip.id);
    setEditTipText(tip.text);
  };
  const handleSaveTip = (id) => {
    setLoading(true);
    api.put(`/admin/tips/${id}`, { text: editTipText })
      .then(() => {
        setEditingTip(null);
        setEditTipText("");
        fetchTabData("tips");
      })
      .catch(() => setError("Failed to update tip."))
      .finally(() => setLoading(false));
  };
  const handleDeleteTip = (id) => {
    setLoading(true);
    api.del(`/admin/tips/${id}`)
      .then(() => fetchTabData("tips"))
      .catch(() => setError("Failed to delete tip."))
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)" }}>
      <div style={{ background: "#fff", padding: 36, borderRadius: 18, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", minWidth: 340, maxWidth: 600 }}>
        <h2 style={{ color: "#d72660", marginBottom: 24 }}>Admin Panel</h2>
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <button onClick={() => setTab("analytics")} style={{ background: tab === "analytics" ? "#d72660" : "#fce4ec", color: tab === "analytics" ? "#fff" : "#d72660", border: "none", borderRadius: 6, padding: "8px 18px", cursor: "pointer" }}>Analytics</button>
          <button onClick={() => setTab("tips")} style={{ background: tab === "tips" ? "#d72660" : "#fce4ec", color: tab === "tips" ? "#fff" : "#d72660", border: "none", borderRadius: 6, padding: "8px 18px", cursor: "pointer" }}>Health Tips</button>
          <button onClick={() => setTab("logs")} style={{ background: tab === "logs" ? "#d72660" : "#fce4ec", color: tab === "logs" ? "#fff" : "#d72660", border: "none", borderRadius: 6, padding: "8px 18px", cursor: "pointer" }}>Logs</button>
        </div>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: "#d72660", marginBottom: 12 }}>{error}</div>}
        {tab === "analytics" && (
          <div>
            <h4 style={{ color: "#b71c4a" }}>User Analytics (with Consent)</h4>
            {data.analytics && data.analytics.users ? (
              <table style={{ width: "100%", background: "#fce4ec", borderRadius: 8, marginBottom: 12 }}>
                <thead>
                  <tr style={{ color: "#d72660" }}>
                    <th style={{ padding: 6 }}>User</th>
                    <th style={{ padding: 6 }}>Mood</th>
                    <th style={{ padding: 6 }}>PCOS Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {data.analytics.users.map((u, i) => (
                    <tr key={i}>
                      <td style={{ padding: 6 }}>{u.name || u.email || "-"}</td>
                      <td style={{ padding: 6 }}>{u.mood || "-"}</td>
                      <td style={{ padding: 6 }}>{u.pcosRisk || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>No analytics data.</div>
            )}
          </div>
        )}
        {tab === "tips" && (
          <div>
            <h4 style={{ color: "#b71c4a" }}>Manage Health Tips</h4>
            <form onSubmit={handleAddTip} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input value={newTip} onChange={e => setNewTip(e.target.value)} placeholder="Add new tip..." style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />
              <button type="submit" style={{ background: "#d72660", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontSize: 15, cursor: "pointer" }}>Add</button>
            </form>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {data.tips && data.tips.length > 0 ? data.tips.map(tip => (
                <li key={tip.id} style={{ background: "#fce4ec", borderRadius: 8, padding: 10, marginBottom: 10, color: "#b71c4a", display: "flex", alignItems: "center", gap: 8 }}>
                  {editingTip === tip.id ? (
                    <>
                      <input value={editTipText} onChange={e => setEditTipText(e.target.value)} style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid #ccc" }} />
                      <button onClick={() => handleSaveTip(tip.id)} style={{ background: "#d72660", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 14, cursor: "pointer" }}>Save</button>
                      <button onClick={() => setEditingTip(null)} style={{ background: "#fce4ec", color: "#d72660", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 14, cursor: "pointer" }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1 }}>{tip.text}</span>
                      <button onClick={() => handleEditTip(tip)} style={{ background: "#fff0f6", color: "#d72660", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 14, cursor: "pointer" }}>Edit</button>
                      <button onClick={() => handleDeleteTip(tip.id)} style={{ background: "#fff0f6", color: "#d72660", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 14, cursor: "pointer" }}>Delete</button>
                    </>
                  )}
                </li>
              )) : <li>No tips available.</li>}
            </ul>
          </div>
        )}
        {tab === "logs" && (
          <div>
            <h4 style={{ color: "#b71c4a" }}>Model Logs</h4>
            {data.logs && data.logs.entries ? (
              <table style={{ width: "100%", background: "#fce4ec", borderRadius: 8, marginBottom: 12 }}>
                <thead>
                  <tr style={{ color: "#d72660" }}>
                    <th style={{ padding: 6 }}>Timestamp</th>
                    <th style={{ padding: 6 }}>Event</th>
                    <th style={{ padding: 6 }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {data.logs.entries.map((log, i) => (
                    <tr key={i}>
                      <td style={{ padding: 6 }}>{log.timestamp || "-"}</td>
                      <td style={{ padding: 6 }}>{log.event || "-"}</td>
                      <td style={{ padding: 6 }}>{log.details || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>No logs data.</div>
            )}
          </div>
        )}
        <SymptomForm />
      </div>
    </div>
  );
};

export default AdminPanel;
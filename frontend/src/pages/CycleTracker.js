import React, { useState, useEffect } from "react";
import api from "../api";

function formatDate(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

function getFertileAndOvulation(startDate, cycleLength = 28) {
  const ovulationDay = addDays(startDate, cycleLength - 14);
  const fertileStart = addDays(startDate, cycleLength - 19);
  const fertileEnd = addDays(startDate, cycleLength - 10);
  return { ovulationDay, fertileStart, fertileEnd };
}

function getNextPeriodDate(events, cycleLength) {
  if (!events.length) return null;
  // Assume events are sorted by start_date descending
  const lastStart = new Date(events[0].start_date);
  const nextPeriod = new Date(lastStart);
  nextPeriod.setDate(lastStart.getDate() + cycleLength);
  return nextPeriod.toISOString().slice(0, 10);
}

const CycleTracker = () => {
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState({ cycleLength: 28, age: "", weight: "" });
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");

  // Load user data (cycleLength, age, weight) on mount
  useEffect(() => {
    setUserLoading(true);
    setUserError("");
    const token = localStorage.getItem("shecare_token");
    api.get("/profile", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        setUserData({
          cycleLength: res.data.cycle_length || 28,
          age: res.data.age || "",
          weight: res.data.weight || ""
        });
      })
      .catch(() => setUserError("Failed to load user data."))
      .finally(() => setUserLoading(false));
  }, []);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("shecare_token");
    api
      .get("/cycle-tracker", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      .then((res) => setEvents(res.data))
      .catch(() => setError("Failed to load cycle data."))
      .finally(() => setLoading(false));
  };

  const handleAddStartDate = (e) => {
    e.preventDefault();
    if (!startDate) return;
    setLoading(true);
    setError("");
    const token = localStorage.getItem("shecare_token");
    const isoDate = new Date(startDate).toISOString();
    api
      .post("/cycle-tracker", { start_date: isoDate }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      .then(() => {
        setStartDate("");
        fetchEntries();
      })
      .catch(() => setError("Failed to add period start date."))
      .finally(() => setLoading(false));
  };

  const handleDelete = (id) => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("shecare_token");
    api
      .delete(`/cycle-tracker/${id}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )
      .then(() => fetchEntries())
      .catch(() => setError("Failed to delete period start date."))
      .finally(() => setLoading(false));
  };

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) =>
    formatDate(new Date(year, month, i + 1))
  );

  const periodDates = new Set();
  const ovulationDates = new Set();
  const fertileDates = new Set();

  events.forEach((e) => {
    const start = formatDate(e.start_date);
    for (let i = 0; i < 5; i++) {
      periodDates.add(addDays(start, i));
    }
    const { ovulationDay, fertileStart, fertileEnd } = getFertileAndOvulation(start, userData.cycleLength);
    ovulationDates.add(ovulationDay);
    const range = new Date(fertileEnd) - new Date(fertileStart);
    for (let i = 0; i <= range / (1000 * 60 * 60 * 24); i++) {
      fertileDates.add(addDays(fertileStart, i));
    }
  });

  const getDateColor = (date) => {
    if (periodDates.has(date)) return "#d72660";
    if (ovulationDates.has(date)) return "#66bb6a";
    if (fertileDates.has(date)) return "#42a5f5";
    return "#fce4ec";
  };

  const getTextColor = (date) => {
    if (periodDates.has(date) || ovulationDates.has(date) || fertileDates.has(date)) return "#fff";
    return "#d72660";
  };

  const nextPeriod = getNextPeriodDate(events, userData.cycleLength);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)"
    }}>
      <div style={{
        background: "#fff",
        padding: 36,
        borderRadius: 18,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        minWidth: 340,
        maxWidth: 480,
        textAlign: "center"
      }}>
        <h2 style={{ color: "#d72660", marginBottom: 24 }}>🌸 Cycle Tracker</h2>
        {userLoading && <div style={{ color: "#d72660", marginBottom: 12 }}>Loading user data...</div>}
        {userError && <div style={{ color: "#d72660", marginBottom: 12 }}>{userError}</div>}
        <div style={{ marginBottom: 12, color: "#b71c4a", fontSize: 15 }}>
          <b>Cycle Length:</b> {userData.cycleLength} days<br />
          <b>Age:</b> {userData.age} &nbsp; <b>Weight:</b> {userData.weight} kg
        </div>
        <form onSubmit={handleAddStartDate} style={{
          marginBottom: 18,
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "center"
        }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ccc"
            }}
          />
          <button type="submit" style={{
            background: "#d72660",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 18px",
            fontSize: 16,
            cursor: "pointer"
          }} disabled={loading || !startDate}>
            Add
          </button>
        </form>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: "#d72660", marginBottom: 12 }}>{error}</div>}
        {nextPeriod && (
          <div style={{ color: "#b71c4a", marginBottom: 12 }}>
            <b>Next Period Expected:</b> {nextPeriod}
          </div>
        )}
        <div style={{ marginBottom: 18 }}>
          <h4 style={{ color: "#b71c4a", marginBottom: 8 }}>📅 This Month</h4>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            justifyContent: "center"
          }}>
            {calendarDays.map((day) => (
              <div key={day} style={{
                width: 32,
                height: 32,
                lineHeight: "32px",
                borderRadius: "50%",
                textAlign: "center",
                background: getDateColor(day),
                color: getTextColor(day),
                fontWeight: "bold"
              }}
                title={
                  periodDates.has(day) ? "Period" :
                    ovulationDates.has(day) ? "Ovulation" :
                      fertileDates.has(day) ? "Fertile Window" : ""
                }>
                {parseInt(day.slice(-2))}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 14, textAlign: "left" }}>
            <div><span style={{ background: "#d72660", color: "#fff", padding: "2px 6px", borderRadius: 4 }}>⬤</span> Period</div>
            <div><span style={{ background: "#66bb6a", color: "#fff", padding: "2px 6px", borderRadius: 4 }}>⬤</span> Ovulation</div>
            <div><span style={{ background: "#42a5f5", color: "#fff", padding: "2px 6px", borderRadius: 4 }}>⬤</span> Fertile Window</div>
          </div>
        </div>

        <div>
          <h4 style={{ color: "#b71c4a", marginBottom: 8 }}>📌 Your Entries</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {events.map((e, i) => (
              <li key={i} style={{
                background: "#fce4ec",
                borderRadius: 8,
                padding: 10,
                marginBottom: 8,
                color: "#b71c4a",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <span>{formatDate(e.start_date)}</span>
                <button onClick={() => handleDelete(e.id)} style={{
                  background: "#d72660",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: 14,
                  cursor: "pointer"
                }}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CycleTracker; 
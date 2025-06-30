import React, { useState } from "react";
import { checkPCOS } from "../api"; // <-- Add this line

const SYMPTOMS = [
  "Irregular periods",
  "Excess hair growth",
  "Acne or oily skin",
  "Weight gain",
  "Hair loss",
  "Mood changes",
  "Difficulty getting pregnant"
];

const SymptomForm = () => {
  const [form, setForm] = useState({
    age: "",
    weight: "",
    symptoms: []
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSymptomChange = e => {
    const { value, checked } = e.target;
    setForm(prev => ({
      ...prev,
      symptoms: checked
        ? [...prev.symptoms, value]
        : prev.symptoms.filter(s => s !== value)
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const result = await checkPCOS(form);
      alert("Result: " + JSON.stringify(result, null, 2));
    } catch (err) {
      alert("Failed to submit: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#fff",
        padding: 36,
        borderRadius: 18,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        minWidth: 340,
        maxWidth: 420,
        margin: "0 auto"
      }}
    >
      <h2 style={{ color: "#d72660", marginBottom: 24 }}>Health Questionnaire</h2>
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Age</label>
        <input
          name="age"
          type="number"
          value={form.age}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc"
          }}
        />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Weight (kg)</label>
        <input
          name="weight"
          type="number"
          value={form.weight}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc"
          }}
        />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Symptoms</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SYMPTOMS.map(symptom => (
            <label
              key={symptom}
              style={{
                fontSize: 14,
                color: "#d72660",
                background: form.symptoms.includes(symptom) ? "#fce4ec" : "#fff",
                borderRadius: 6,
                padding: "4px 10px",
                cursor: "pointer"
              }}
            >
              <input
                type="checkbox"
                value={symptom}
                checked={form.symptoms.includes(symptom)}
                onChange={handleSymptomChange}
                style={{ marginRight: 6 }}
              />
              {symptom}
            </label>
          ))}
        </div>
      </div>
      <button
        type="submit"
        style={{
          width: "100%",
          background: "#d72660",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: 12,
          fontSize: 16,
          cursor: "pointer",
          marginBottom: 12
        }}
      >
        Submit
      </button>
    </form>
  );
};

export default SymptomForm;
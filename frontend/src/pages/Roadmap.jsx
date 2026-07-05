import { useState } from "react";
import { api } from "../api.js";

export default function Roadmap() {
  const [form, setForm] = useState({ goal: "Java Full Stack Developer", timeAvailable: "60 Days", currentSkill: "Intermediate" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await api.generateRoadmap({ ...form, userId: "demo-user" });
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>AI Roadmap Generator</h1>
      <p className="muted">Turn a goal and a timeframe into a day-by-day study plan.</p>

      <form className="card form" onSubmit={submit}>
        <label>
          Goal
          <input value={form.goal} onChange={update("goal")} required />
        </label>
        <label>
          Time Available
          <input value={form.timeAvailable} onChange={update("timeAvailable")} placeholder="e.g. 60 Days" required />
        </label>
        <label>
          Current Skill Level
          <select value={form.currentSkill} onChange={update("currentSkill")}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Roadmap"}
        </button>
      </form>

      {error && <div className="card error">{error}</div>}

      {result && (
        <div className="card">
          <h3>Your Roadmap</h3>
          {result.phases?.map((p, i) => (
            <div key={i} className="phase">
              <h4>{p.range} — {p.focus}</h4>
              <p><strong>Topics:</strong> {p.topics?.join(", ")}</p>
              <p><strong>Coding Problems:</strong> {p.codingProblems?.join(", ")}</p>
              <p><strong>Interview Questions:</strong> {p.interviewQuestions?.join(", ")}</p>
            </div>
          ))}
          <p><strong>Revision Plan:</strong> {result.revisionPlan?.join(", ")}</p>
        </div>
      )}
    </div>
  );
}

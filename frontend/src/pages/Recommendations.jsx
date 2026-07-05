import { useState } from "react";
import { api } from "../api.js";

export default function Recommendations() {
  const [form, setForm] = useState({ company: "TCS", language: "Java", difficulty: "Medium", weakTopic: "Graphs" });
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
      const data = await api.recommend({ ...form, userId: "demo-user" });
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>AI Coding Recommendations</h1>
      <p className="muted">Get problems tailored to your target company, language, and weak topics.</p>

      <form className="card form" onSubmit={submit}>
        <label>
          Target Company
          <input value={form.company} onChange={update("company")} placeholder="e.g. Amazon" required />
        </label>
        <label>
          Programming Language
          <input value={form.language} onChange={update("language")} placeholder="e.g. Java" required />
        </label>
        <label>
          Difficulty
          <select value={form.difficulty} onChange={update("difficulty")}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </label>
        <label>
          Weak Topic
          <input value={form.weakTopic} onChange={update("weakTopic")} placeholder="e.g. Graphs" required />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Get Recommendations"}
        </button>
      </form>

      {error && <div className="card error">{error}</div>}

      {result && (
        <div className="card">
          <h3>Today's Recommendation</h3>
          <ul>
            {result.problems?.map((p, i) => (
              <li key={i}>
                <strong>{p.name}</strong> — {p.platform} · {p.difficulty} · {p.topic}
                <div className="muted">Concepts: {p.concepts?.join(", ")}</div>
                {p.leetcodeLink && (
                  <div>
                    <a href={p.leetcodeLink} target="_blank" rel="noopener noreferrer">
                      {p.onLeetCode ? "Practice on LeetCode →" : "Search this problem on LeetCode →"}
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <p><strong>Estimated Total Time:</strong> {result.estimatedTotalTime}</p>
          <p><strong>Concept Revision:</strong> {result.conceptRevision?.join(", ")}</p>
        </div>
      )}
    </div>
  );
}

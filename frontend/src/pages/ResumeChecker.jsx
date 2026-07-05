import { useState } from "react";
import { api } from "../api.js";

export default function ResumeChecker() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await api.analyzeResume({ file, resumeText, targetRole });
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => (score >= 75 ? "#22d3ee" : score >= 50 ? "#facc15" : "#f87171");

  return (
    <div className="page">
      <h1>Resume ATS Score Checker</h1>
      <p className="muted">Upload your resume (PDF or text) and see how it scores against ATS systems.</p>

      <form className="card form neon-card" onSubmit={submit}>
        <label>
          Target Role
          <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Backend Developer" />
        </label>

        <label>
          Upload Resume (PDF or .txt)
          <input type="file" accept=".pdf,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>

        <label>
          Or paste resume text
          <textarea
            rows={6}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content here if you don't want to upload a file..."
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Check ATS Score"}
        </button>
      </form>

      {error && <div className="card error">{error}</div>}

      {result && (
        <div className="card neon-card">
          <div className="ats-score-ring" style={{ "--score-color": scoreColor(result.atsScore) }}>
            <div className="ats-score-value">{result.atsScore}%</div>
            <div className="muted">ATS Score</div>
          </div>

          <p style={{ marginTop: 16 }}>{result.summary}</p>

          <h4>Missing Skills</h4>
          <ul>{result.missingSkills?.map((s, i) => <li key={i}>{s}</li>)}</ul>

          <h4>Improvement Suggestions</h4>
          <ul>{result.improvementSuggestions?.map((s, i) => <li key={i}>{s}</li>)}</ul>

          <h4>Matched Companies</h4>
          <div className="chip-row">
            {result.matchedCompanies?.map((c, i) => <span key={i} className="chip">{c}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

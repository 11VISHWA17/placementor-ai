import { useEffect, useState } from "react";
import { api } from "../api.js";
import KittyChat from "../components/KittyChat.jsx";

const DEMO_USER_ID = "demo-user";

export default function Dashboard() {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getProgress(DEMO_USER_ID)
      .then(setProgress)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="dashboard-layout">
      <div className="page">
        <h1>Student Dashboard</h1>
        <p className="muted">Your placement preparation, at a glance.</p>

        {error && <div className="card error">{error}</div>}

        {progress && (
          <div className="grid">
            <div className="card stat neon-card">
              <div className="stat-value">{progress.readinessScore}%</div>
              <div className="stat-label">Placement Readiness Score</div>
            </div>
            <div className="card stat neon-card">
              <div className="stat-value">{progress.solvedProblems?.length || 0}</div>
              <div className="stat-label">Problems Solved</div>
            </div>
            <div className="card stat neon-card">
              <div className="stat-value">{progress.avgInterviewScore}/100</div>
              <div className="stat-label">Avg. Mock Interview Score</div>
            </div>
            <div className="card stat neon-card">
              <div className="stat-value">{progress.avgAtsScore}%</div>
              <div className="stat-label">Avg. Resume ATS Score</div>
            </div>
          </div>
        )}

        
      </div>

      <KittyChat />
    </div>
  );
}

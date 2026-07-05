import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.getAdminStats(), api.getAdminMembers()])
      .then(([statsData, membersData]) => {
        setStats(statsData);
        setMembers(membersData.members);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <p className="muted">Member counts and app usage — visible to your admin account only.</p>

      {error && <div className="card error">{error}</div>}

      {stats && (
        <div className="grid">
          <div className="card stat">
            <div className="stat-value">{stats.totalMembers}</div>
            <div className="stat-label">Total Members</div>
          </div>
          <div className="card stat">
            <div className="stat-value">{stats.totalLogins}</div>
            <div className="stat-label">Total Logins (all time)</div>
          </div>
          <div className="card stat">
            <div className="stat-value">{stats.activeToday}</div>
            <div className="stat-label">Active Today</div>
          </div>
          <div className="card stat">
            <div className="stat-value">{stats.usage.recommendationsGenerated}</div>
            <div className="stat-label">Recommendations Generated</div>
          </div>
          <div className="card stat">
            <div className="stat-value">{stats.usage.mockInterviewsCompleted}</div>
            <div className="stat-label">Mock Interviews Completed</div>
          </div>
          <div className="card stat">
            <div className="stat-value">{stats.usage.resumesAnalyzed}</div>
            <div className="stat-label">Resumes Analyzed</div>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Members</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Logins</th>
              <th>Last Login</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td>{m.loginCount}</td>
                <td>{m.lastLogin ? new Date(m.lastLogin).toLocaleString() : "—"}</td>
                <td>{new Date(m.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">No members have registered yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

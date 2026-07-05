import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState("");
  const [prep, setPrep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getCompanies().then((d) => setCompanies(d.companies)).catch((e) => setError(e.message));
  }, []);

  const loadPrep = async (company) => {
    setSelected(company);
    setLoading(true);
    setError("");
    setPrep(null);
    try {
      const data = await api.getCompanyPrep(company);
      setPrep(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Company-wise Preparation</h1>
      <p className="muted">Select a company to see focused coding, technical, and HR questions.</p>

      <div className="chip-row">
        {companies.map((c) => (
          <button key={c} className={`chip ${selected === c ? "active" : ""}`} onClick={() => loadPrep(c)}>
            {c}
          </button>
        ))}
      </div>

      {error && <div className="card error">{error}</div>}
      {loading && <div className="card">Loading {selected} preparation content...</div>}

      {prep && (
        <div className="card">
          <h3>{prep.company}</h3>
          <p>{prep.interviewExperienceSummary}</p>

          <h4>Coding Questions</h4>
          <ul>{prep.codingQuestions?.map((q, i) => <li key={i}>{q}</li>)}</ul>

          <h4>Technical Questions</h4>
          <ul>{prep.technicalQuestions?.map((q, i) => <li key={i}>{q}</li>)}</ul>

          <h4>HR Questions</h4>
          <ul>{prep.hrQuestions?.map((q, i) => <li key={i}>{q}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

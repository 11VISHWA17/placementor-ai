import { useState } from "react";
import { api } from "../api.js";

export default function MockInterview() {
  const [role, setRole] = useState("Software Engineer");
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState([]);
  const [final, setFinal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const start = async () => {
    setLoading(true);
    setError("");
    setFinal(null);
    setHistory([]);
    try {
      const data = await api.startInterview({ userId: "demo-user", role });
      setSessionId(data.sessionId);
      setQuestion(data.question);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.answerInterview(sessionId, answer);
      setHistory((h) => [...h, { question, answer, evaluation: data.evaluation }]);
      setAnswer("");
      if (data.isFinal) {
        setFinal({ score: data.finalScore, strength: data.strength, weakness: data.weakness });
        setQuestion("");
      } else {
        setQuestion(data.nextQuestion);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>AI Mock Interview</h1>
      <p className="muted">A live, adaptive interviewer that scores each answer.</p>

      {!sessionId && (
        <div className="card form">
          <label>
            Target Role
            <input value={role} onChange={(e) => setRole(e.target.value)} />
          </label>
          <button onClick={start} disabled={loading}>
            {loading ? "Starting..." : "Start Mock Interview"}
          </button>
        </div>
      )}

      {error && <div className="card error">{error}</div>}

      {history.map((turn, i) => (
        <div className="card" key={i}>
          <p><strong>Q:</strong> {turn.question}</p>
          <p><strong>Your Answer:</strong> {turn.answer}</p>
          {turn.evaluation && (
            <div className="muted">
              Technical: {turn.evaluation.technicalAccuracy} · Communication: {turn.evaluation.communication} ·
              Confidence: {turn.evaluation.confidence}
              <br />
              Suggestion: {turn.evaluation.suggestions}
            </div>
          )}
        </div>
      ))}

      {sessionId && question && !final && (
        <form className="card form" onSubmit={submitAnswer}>
          <p><strong>Q:</strong> {question}</p>
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} placeholder="Type your answer..." />
          <button type="submit" disabled={loading}>
            {loading ? "Evaluating..." : "Submit Answer"}
          </button>
        </form>
      )}

      {final && (
        <div className="card">
          <h3>Interview Complete</h3>
          <p><strong>Overall Score:</strong> {final.score}/100</p>
          <p><strong>Strength:</strong> {final.strength}</p>
          <p><strong>Weakness:</strong> {final.weakness}</p>
          <button onClick={() => setSessionId(null)}>Start Another Interview</button>
        </div>
      )}
    </div>
  );
}

import { Link } from "react-router-dom";

const GRAPH_WEEKS = [
  { label: "Wk 1", score: 12 },
  { label: "Wk 2", score: 22 },
  { label: "Wk 3", score: 31 },
  { label: "Wk 4", score: 40 },
  { label: "Wk 5", score: 52 },
  { label: "Wk 6", score: 63 },
  { label: "Wk 7", score: 74 },
  { label: "Wk 8", score: 88 }
];

function ImprovementGraph() {
  const width = 640;
  const height = 260;
  const padding = 40;
  const maxScore = 100;

  const points = GRAPH_WEEKS.map((d, i) => {
    const x = padding + (i * (width - padding * 2)) / (GRAPH_WEEKS.length - 1);
    const y = height - padding - (d.score / maxScore) * (height - padding * 2);
    return { x, y, ...d };
  });

  const linePath = points.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="improvement-graph">
      <defs>
        <linearGradient id="graphFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="graphLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="100%" stopColor="#ff4fd8" />
        </linearGradient>
      </defs>

      {[0, 25, 50, 75, 100].map((g) => {
        const y = height - padding - (g / maxScore) * (height - padding * 2);
        return (
          <g key={g}>
            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#232a4d" strokeWidth="1" />
            <text x={padding - 10} y={y + 4} fill="#8b93b8" fontSize="11" textAnchor="end">{g}%</text>
          </g>
        );
      })}

      <path d={areaPath} fill="url(#graphFill)" />
      <path d={linePath} fill="none" stroke="url(#graphLine)" strokeWidth="3" />

      {points.map((pt, i) => (
        <g key={i}>
          <circle cx={pt.x} cy={pt.y} r="5" fill="#0b0e1c" stroke="#00f0ff" strokeWidth="2" />
          <text x={pt.x} y={height - padding + 20} fill="#8b93b8" fontSize="11" textAnchor="middle">{pt.label}</text>
        </g>
      ))}
    </svg>
  );
}

const FEATURES = [
  { icon: "💻", title: "AI Coding Recommendations", desc: "Personalized problems by company, language, difficulty & weak topic, with direct LeetCode links." },
  { icon: "🎤", title: "AI Mock Interview", desc: "A live, adaptive interviewer that scores Technical Accuracy, Communication & Confidence." },
  { icon: "📄", title: "Resume ATS Checker", desc: "Upload your resume and get an ATS score, missing skills, and improvement suggestions." },
  { icon: "🗺️", title: "AI Roadmap Generator", desc: "Turn any goal and timeframe into a day-by-day preparation plan." },
  { icon: "🏢", title: "Company-wise Prep", desc: "Coding, technical & HR questions tailored to TCS, Amazon, Google, and more." },
  { icon: "🐱", title: "Kitty AI Assistant", desc: "A friendly in-app chatbot for quick help, right on your dashboard." }
];

export default function Home() {
  return (
    <div className="home-page">
      <CursorlessNav />

      <section className="hero">
        <div className="hero-badge">🎓 AI-Powered Placement Preparation</div>
        <h1 className="hero-title">
          Get Placement-Ready with <span className="hero-gradient-text">PlaceMentor AI</span>
        </h1>
        <p className="hero-subtitle">
          Personalized coding practice, AI mock interviews, resume ATS scoring, and a roadmap
          built just for you — all in one platform.
        </p>
        <div className="hero-actions">
          <Link to="/login?mode=register" className="hero-btn-primary">Get Started Free</Link>
          <Link to="/login" className="hero-btn-secondary">I already have an account</Link>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Everything you need to crack placements</h2>
        <p className="section-subtitle">One platform, six AI-powered tools, zero guesswork.</p>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card neon-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p className="muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="graph-section neon-card">
          <div>
            <h2 className="section-title" style={{ textAlign: "left" }}>See your readiness score climb</h2>
            <p className="muted" style={{ maxWidth: 420 }}>
              Every problem solved, every mock interview completed, and every resume fix moves your
              Placement Readiness Score forward. Here's what consistent practice looks like over 8 weeks.
            </p>
            <div className="graph-stats">
              <div>
                <div className="stat-value">88%</div>
                <div className="stat-label">Avg. score after 8 weeks</div>
              </div>
              <div>
                <div className="stat-value">3x</div>
                <div className="stat-label">Faster improvement vs. unguided prep</div>
              </div>
            </div>
          </div>
          <ImprovementGraph />
        </div>
      </section>

      <section className="cta-section">
        <h2 className="section-title">Ready to start your placement journey?</h2>
        <Link to="/login?mode=register" className="hero-btn-primary">Create your free account</Link>
      </section>

      <footer className="home-footer muted">
        © 2026 PlaceMentor AI — By VishwaSelvanathan It Built with React, Node.js & Groq LLM
      </footer>
    </div>
  );
}

function CursorlessNav() {
  return (
    <nav className="home-nav">
      <div className="brand">🎓 PlaceMentor AI</div>
      <div className="home-nav-actions">
        <Link to="/login" className="nav-login-btn">Log In</Link>
        <Link to="/login?mode=register" className="nav-signup-btn">Sign Up</Link>
      </div>
    </nav>
  );
}

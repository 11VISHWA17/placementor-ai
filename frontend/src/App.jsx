import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import MockInterview from "./pages/MockInterview.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import Companies from "./pages/Companies.jsx";
import ResumeChecker from "./pages/ResumeChecker.jsx";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import { useAuth } from "./AuthContext.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import CursorGlow from "./components/CursorGlow.jsx";

export default function App() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const showSidebar = !!user;

  return (
    <div className={showSidebar ? "app-shell" : ""}>
      <CursorGlow />

      {showSidebar && (
        <aside className="sidebar">
          <div className="brand">🎓 PlaceMentor AI</div>
          <nav>
            {!isAdmin && (
              <>
                <NavLink to="/" end>📊 Dashboard</NavLink>
                <NavLink to="/recommendations">💻 Coding</NavLink>
                <NavLink to="/interview">🎤 Mock Interview</NavLink>
                <NavLink to="/roadmap">🗺️ Roadmap</NavLink>
                <NavLink to="/companies">🏢 Companies</NavLink>
                <NavLink to="/resume">📄 Resume ATS Checker</NavLink>
              </>
            )}
            {isAdmin && <NavLink to="/admin">🛡️ Admin Dashboard</NavLink>}
          </nav>
          <div className="sidebar-footer">
            <button className="link-btn" onClick={handleLogout}>
              Log out ({user.name})
            </button>
          </div>
        </aside>
      )}

      <main className={showSidebar ? "content" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={user ? <ProtectedRoute><Dashboard /></ProtectedRoute> : <Home />} />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <MockInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roadmap"
            element={
              <ProtectedRoute>
                <Roadmap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <ProtectedRoute>
                <Companies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <ResumeChecker />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

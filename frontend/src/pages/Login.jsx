import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = mode === "login" ? await api.login(form) : await api.register(form);
      login(data.token, data.user);
      navigate(data.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1>{mode === "login" ? "Log In" : "Create Account"}</h1>
      <p className="muted">
        One login page for everyone. Your admin account (set via <code>ADMIN_EMAIL</code> /{" "}
        <code>ADMIN_PASSWORD</code> in the backend) automatically lands on the Admin Dashboard;
        every other account is a regular member.
      </p>

      <form className="card form" onSubmit={submit}>
        {mode === "register" && (
          <label>
            Name
            <input value={form.name} onChange={update("name")} required />
          </label>
        )}
        <label>
          Email
          <input type="email" value={form.email} onChange={update("email")} required />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={update("password")} required minLength={6} />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Log In" : "Register"}
        </button>
      </form>

      {error && <div className="card error">{error}</div>}

      <p className="muted" style={{ marginTop: 16 }}>
        {mode === "login" ? (
          <>
            New here?{" "}
            <button type="button" className="link-btn" onClick={() => setMode("register")}>
              Create a member account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button type="button" className="link-btn" onClick={() => setMode("login")}>
              Log in instead
            </button>
          </>
        )}
      </p>
    </div>
  );
}

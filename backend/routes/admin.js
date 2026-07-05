import express from "express";
import { db } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require a valid token AND the "admin" role
router.use(requireAuth, requireAdmin);

// Overview stats: total members, total logins, active-today count, per-feature usage
router.get("/stats", (req, res) => {
  const members = db.data.users.filter((u) => u.role !== "admin");
  const totalMembers = members.length;
  const totalLogins = db.data.loginHistory.length;

  const today = new Date().toISOString().slice(0, 10);
  const activeToday = new Set(
    db.data.loginHistory.filter((l) => l.loginAt.slice(0, 10) === today).map((l) => l.userId)
  ).size;

  const usage = {
    recommendationsGenerated: db.data.recommendations.length,
    mockInterviewsStarted: db.data.mockInterviews.length,
    mockInterviewsCompleted: db.data.mockInterviews.filter((s) => s.isFinal).length,
    resumesAnalyzed: db.data.resumeAnalysis.length
  };

  res.json({ totalMembers, totalLogins, activeToday, usage });
});

// List every member with their login count and last login time
router.get("/members", (req, res) => {
  const members = db.data.users
    .filter((u) => u.role !== "admin")
    .map((u) => {
      const logins = db.data.loginHistory.filter((l) => l.userId === u.id);
      const lastLogin = logins.length ? logins[logins.length - 1].loginAt : null;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        loginCount: logins.length,
        lastLogin
      };
    })
    .sort((a, b) => (b.lastLogin || "").localeCompare(a.lastLogin || ""));

  res.json({ members });
});

// Full raw login history, most recent first
router.get("/login-history", (req, res) => {
  const history = [...db.data.loginHistory].reverse();
  res.json({ history });
});

export default router;

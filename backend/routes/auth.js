import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { db } from "../db.js";

const router = express.Router();

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );
}

// One-time seed: creates a single admin account from env vars if it doesn't exist yet.
// Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env to control the credentials.
export async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) return;

  const existing = db.data.users.find((u) => u.email === adminEmail);
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await db.write();
    }
    return;
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(adminPassword, salt);

  db.data.users.push({
    id: nanoid(),
    name: "Admin",
    email: adminEmail,
    salt,
    passwordHash,
    role: "admin",
    createdAt: new Date().toISOString()
  });

  await db.write();
  console.log(`✅ Admin account ready: ${adminEmail}`);
}

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required" });
  }

  const existing = db.data.users.find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ error: "A user with this email already exists" });
  }

  // Members can never self-register as admin; admin is only created via seedAdmin().
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);

  const user = {
    id: nanoid(),
    name,
    email,
    salt,
    passwordHash,
    role: "member",
    createdAt: new Date().toISOString()
  };

  db.data.users.push(user);
  db.data.progress.push({
    userId: user.id,
    readinessScore: 0,
    solvedProblems: [],
    weakTopics: [],
    streak: 0
  });
  await db.write();

  const token = signToken(user);
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.data.users.find((u) => u.email === email);

  if (!user || hashPassword(password, user.salt) !== user.passwordHash) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  db.data.loginHistory.push({
    id: nanoid(),
    userId: user.id,
    email: user.email,
    role: user.role,
    loginAt: new Date().toISOString()
  });
  await db.write();

  const token = signToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

export default router;

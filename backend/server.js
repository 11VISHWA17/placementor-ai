import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes, { seedAdmin } from "./routes/auth.js";
import recommendRoutes from "./routes/recommend.js";
import interviewRoutes from "./routes/interview.js";
import roadmapRoutes from "./routes/roadmap.js";
import resumeRoutes from "./routes/resume.js";
import companiesRoutes from "./routes/companies.js";
import progressRoutes from "./routes/progress.js";
import adminRoutes from "./routes/admin.js";
import chatRoutes from "./routes/chat.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "PlaceMentor AI Backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/recommend", recommendRoutes);
app.use("/api/mockInterview", interviewRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/resumeAnalysis", resumeRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 8080;

seedAdmin().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ PlaceMentor AI backend running on http://localhost:${PORT}`);
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
      console.warn("⚠️  GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys");
    }
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.warn("⚠️  ADMIN_EMAIL / ADMIN_PASSWORD not set. Add them to .env to create your admin login.");
    }
  });
});

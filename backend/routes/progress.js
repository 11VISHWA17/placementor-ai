import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  let progress = db.data.progress.find((p) => p.userId === userId);

  if (!progress) {
    progress = { userId, readinessScore: 0, solvedProblems: [], weakTopics: [], streak: 0 };
    db.data.progress.push(progress);
  }

  const interviews = db.data.mockInterviews.filter((s) => s.userId === userId && s.isFinal);
  const avgInterviewScore = interviews.length
    ? Math.round(interviews.reduce((sum, s) => sum + (s.finalScore || 0), 0) / interviews.length)
    : 0;

  const resumeRecords = db.data.resumeAnalysis.filter((r) => r.userId === userId);
  const avgAtsScore = resumeRecords.length
    ? Math.round(resumeRecords.reduce((sum, r) => sum + (r.result?.atsScore || 0), 0) / resumeRecords.length)
    : 0;

  const readinessScore = Math.round(
    progress.solvedProblems.length * 2 * 0.4 + avgInterviewScore * 0.4 + avgAtsScore * 0.2
  );

  res.json({
    ...progress,
    readinessScore: Math.min(readinessScore, 100),
    avgInterviewScore,
    avgAtsScore,
    interviewsCompleted: interviews.length
  });
});

router.post("/:userId/solve", async (req, res) => {
  const { userId } = req.params;
  const { problemName, topic } = req.body;

  let progress = db.data.progress.find((p) => p.userId === userId);
  if (!progress) {
    progress = { userId, readinessScore: 0, solvedProblems: [], weakTopics: [], streak: 0 };
    db.data.progress.push(progress);
  }

  progress.solvedProblems.push({ problemName, topic, solvedAt: new Date().toISOString() });
  db.data.codingHistory.push({ userId, problemName, topic, solvedAt: new Date().toISOString() });

  await db.write();
  res.json(progress);
});

export default router;

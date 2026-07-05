import express from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { callGroq } from "../groqClient.js";

const router = express.Router();

const SYSTEM_PROMPT = `You are a DSA mentor and career coach.
Generate a day-by-day (or weekly, if the timeframe is long) roadmap based on:
- Current Skill level
- Target Company or Goal
- Available Time

Respond ONLY with a JSON object, no markdown:
{
  "phases": [
    { "range": "Day 1-5", "focus": "", "topics": [""], "codingProblems": [""], "interviewQuestions": [""] }
  ],
  "revisionPlan": [""]
}`;

router.post("/", async (req, res) => {
  try {
    const { goal, timeAvailable, currentSkill, userId } = req.body;

    if (!goal || !timeAvailable) {
      return res.status(400).json({ error: "goal and timeAvailable are required" });
    }

    const userPrompt = `Goal: ${goal}\nAvailable Time: ${timeAvailable}\nCurrent Skill: ${currentSkill || "Beginner"}`;
    const raw = await callGroq({ systemPrompt: SYSTEM_PROMPT, userPrompt, jsonMode: true });
    const parsed = JSON.parse(raw);

    const record = {
      id: nanoid(),
      userId: userId || "anonymous",
      goal,
      timeAvailable,
      currentSkill: currentSkill || "Beginner",
      result: parsed,
      createdAt: new Date().toISOString()
    };

    db.data.recommendations.push(record);
    await db.write();

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

import express from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { callGroq } from "../groqClient.js";

const router = express.Router();

const SYSTEM_PROMPT = `You are an experienced placement mentor.
Recommend coding problems based on:
- Programming Language
- Difficulty
- Target Company
- Weak Topic

Prefer well-known problems that actually exist on LeetCode whenever possible.

For every problem, include a "leetcodeLink" field:
- If the problem is a well-known LeetCode problem, use its real URL in the form
  "https://leetcode.com/problems/<problem-slug>/" (lowercase, words separated by hyphens).
- If you are not confident the problem exists on LeetCode under that exact name, instead return
  a LeetCode search link in the form "https://leetcode.com/problemset/?search=<url-encoded-name>"
  and set "onLeetCode" to false. Otherwise set "onLeetCode" to true.

Respond ONLY with a JSON object in this exact shape, no markdown, no extra text:
{
  "problems": [
    { "topic": "", "name": "", "difficulty": "", "platform": "LeetCode|GeeksforGeeks|HackerRank", "estimatedMinutes": 0, "concepts": [""], "leetcodeLink": "", "onLeetCode": true }
  ],
  "estimatedTotalTime": "",
  "conceptRevision": [""]
}`;

router.post("/", async (req, res) => {
  try {
    const { company, language, difficulty, weakTopic, userId } = req.body;

    if (!company || !language || !difficulty || !weakTopic) {
      return res.status(400).json({ error: "company, language, difficulty and weakTopic are required" });
    }

    const userPrompt = `Company: ${company}\nLanguage: ${language}\nDifficulty: ${difficulty}\nWeak Topic: ${weakTopic}\n\nRecommend 4-6 problems.`;

    const raw = await callGroq({ systemPrompt: SYSTEM_PROMPT, userPrompt, jsonMode: true });
    const parsed = JSON.parse(raw);

    const record = {
      id: nanoid(),
      userId: userId || "anonymous",
      company,
      language,
      difficulty,
      weakTopic,
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

router.get("/history/:userId", (req, res) => {
  const items = db.data.recommendations.filter((r) => r.userId === req.params.userId);
  res.json(items);
});

export default router;

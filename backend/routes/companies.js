import express from "express";
import { callGroq } from "../groqClient.js";

const router = express.Router();

const SUPPORTED_COMPANIES = ["Amazon", "Google", "Infosys", "Accenture", "TCS", "Zoho", "Microsoft"];

const SYSTEM_PROMPT = `You are a placement preparation mentor with knowledge of company-specific interview patterns.
Respond ONLY with a JSON object, no markdown:
{
  "codingQuestions": [""],
  "hrQuestions": [""],
  "technicalQuestions": [""],
  "interviewExperienceSummary": ""
}`;

router.get("/", (req, res) => {
  res.json({ companies: SUPPORTED_COMPANIES });
});

router.get("/:company/prep", async (req, res) => {
  try {
    const { company } = req.params;
    const userPrompt = `Generate placement preparation content for: ${company}`;
    const raw = await callGroq({ systemPrompt: SYSTEM_PROMPT, userPrompt, jsonMode: true });
    const parsed = JSON.parse(raw);
    res.json({ company, ...parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

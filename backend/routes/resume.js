import express from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import pdfParse from "pdf-parse";
import { db } from "../db.js";
import { callGroq } from "../groqClient.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const SYSTEM_PROMPT = `You are an ATS (Applicant Tracking System) and career expert.
Analyze the resume text provided and return ONLY a JSON object, no markdown:
{
  "atsScore": 0,
  "missingSkills": [""],
  "improvementSuggestions": [""],
  "matchedCompanies": [""],
  "summary": ""
}`;

router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const { userId, targetRole } = req.body;
    let resumeText = req.body.resumeText || "";

    if (req.file) {
      if (req.file.mimetype === "application/pdf") {
        const parsed = await pdfParse(req.file.buffer);
        resumeText = parsed.text;
      } else {
        resumeText = req.file.buffer.toString("utf-8");
      }
    }

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ error: "Please provide resume text or upload a PDF/text file" });
    }

    const userPrompt = `Target Role: ${targetRole || "Software Engineer"}\n\nResume Text:\n${resumeText.slice(0, 6000)}`;
    const raw = await callGroq({ systemPrompt: SYSTEM_PROMPT, userPrompt, jsonMode: true });
    const parsed = JSON.parse(raw);

    const record = {
      id: nanoid(),
      userId: userId || "anonymous",
      targetRole: targetRole || "Software Engineer",
      result: parsed,
      createdAt: new Date().toISOString()
    };

    db.data.resumeAnalysis.push(record);
    await db.write();

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

import express from "express";
import { callGroq } from "../groqClient.js";

const router = express.Router();

const KITTY_SYSTEM_PROMPT = `You are Kitty, the friendly AI assistant inside PlaceMentor AI, a placement
preparation platform for students. You help with quick questions about coding concepts, interview
prep strategy, resume tips, and how to use the app's features (Coding Recommendations, Mock Interview,
Roadmap Generator, Company Prep, Resume ATS Checker).

Keep replies short, warm, and encouraging - a few sentences at most unless the student asks for a
detailed explanation. Use a light, upbeat tone but stay useful and concrete. Do not pretend to be human;
if asked, you can say you're Kitty, an AI assistant.`;

router.post("/", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
    const conversation = recentHistory
      .map((h) => `${h.role === "user" ? "Student" : "Kitty"}: ${h.content}`)
      .join("\n");

    const userPrompt = conversation
      ? `Conversation so far:\n${conversation}\n\nStudent: ${message}\n\nReply as Kitty.`
      : `Student: ${message}\n\nReply as Kitty.`;

    const reply = await callGroq({
      systemPrompt: KITTY_SYSTEM_PROMPT,
      userPrompt,
      jsonMode: false,
      temperature: 0.7
    });

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

import express from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { callGroq } from "../groqClient.js";

const router = express.Router();

const SYSTEM_PROMPT = `You are an HR interviewer conducting a mock technical interview.
Ask one question at a time.
After every answer, evaluate:
- Technical Accuracy (0-100)
- Communication (0-100)
- Confidence (0-100)
- Suggestions (short text)

Respond ONLY with a JSON object, no markdown:
{
  "evaluation": { "technicalAccuracy": 0, "communication": 0, "confidence": 0, "suggestions": "" } | null,
  "nextQuestion": "",
  "isFinal": false,
  "finalScore": null,
  "strength": null,
  "weakness": null
}
Set "evaluation" to null only for the very first question (no prior answer to evaluate).
Set "isFinal" to true and fill "finalScore" (0-100), "strength", and "weakness" after 5 questions have been answered.`;

// Start a new interview session
router.post("/start", async (req, res) => {
  try {
    const { userId, role } = req.body;
    const sessionId = nanoid();

    const userPrompt = `Start a mock interview for the role: ${role || "Software Engineer"}. This is question 1 of 5. Ask the first question ("Tell me about yourself" or similar).`;
    const raw = await callGroq({ systemPrompt: SYSTEM_PROMPT, userPrompt, jsonMode: true });
    const parsed = JSON.parse(raw);

    const session = {
      id: sessionId,
      userId: userId || "anonymous",
      role: role || "Software Engineer",
      turns: [{ question: parsed.nextQuestion, answer: null, evaluation: null }],
      isFinal: false,
      finalScore: null,
      createdAt: new Date().toISOString()
    };

    db.data.mockInterviews.push(session);
    await db.write();

    res.json({ sessionId, question: parsed.nextQuestion, questionNumber: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit an answer, get evaluation + next question (or final score)
router.post("/:sessionId/answer", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { answer } = req.body;

    const session = db.data.mockInterviews.find((s) => s.id === sessionId);
    if (!session) return res.status(404).json({ error: "Interview session not found" });
    if (session.isFinal) return res.status(400).json({ error: "This interview has already finished" });

    const currentTurn = session.turns[session.turns.length - 1];
    currentTurn.answer = answer;

    const questionNumber = session.turns.length;
    const userPrompt = `Role: ${session.role}
This is question ${questionNumber} of 5.
Question asked: "${currentTurn.question}"
Candidate's answer: "${answer}"

Evaluate this answer. If questionNumber < 5, provide the next question. If questionNumber === 5, set isFinal true with the final score, strength, and weakness instead of a next question.`;

    const raw = await callGroq({ systemPrompt: SYSTEM_PROMPT, userPrompt, jsonMode: true });
    const parsed = JSON.parse(raw);

    currentTurn.evaluation = parsed.evaluation;

    if (parsed.isFinal) {
      session.isFinal = true;
      session.finalScore = parsed.finalScore;
      session.strength = parsed.strength;
      session.weakness = parsed.weakness;
    } else {
      session.turns.push({ question: parsed.nextQuestion, answer: null, evaluation: null });
    }

    await db.write();

    res.json({
      evaluation: parsed.evaluation,
      isFinal: session.isFinal,
      nextQuestion: session.isFinal ? null : parsed.nextQuestion,
      finalScore: session.finalScore,
      strength: session.strength,
      weakness: session.weakness
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:sessionId", (req, res) => {
  const session = db.data.mockInterviews.find((s) => s.id === req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Not found" });
  res.json(session);
});

export default router;

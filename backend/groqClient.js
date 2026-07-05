import "dotenv/config";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Calls the free Groq API (OpenAI-compatible chat completions endpoint).
 * Get a free key at https://console.groq.com/keys
 */
export async function callGroq({ systemPrompt, userPrompt, jsonMode = false, temperature = 0.6 }) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === "your_groq_api_key_here") {
    throw new Error(
      "GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys and add it to backend/.env"
    );
  }

  const body = {
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    temperature,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

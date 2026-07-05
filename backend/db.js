import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "data", "db.json");

const defaultData = {
  users: [],
  progress: [],
  codingHistory: [],
  mockInterviews: [],
  resumeAnalysis: [],
  recommendations: [],
  loginHistory: [],
  chatHistory: []
};

export const db = await JSONFilePreset(dbPath, defaultData);

// Self-healing: if db.json already existed from an older version of the app,
// patch in any newly added collections instead of crashing on undefined.push().
let patched = false;
for (const key of Object.keys(defaultData)) {
  if (!Array.isArray(db.data[key])) {
    db.data[key] = [];
    patched = true;
  }
}
if (patched) {
  await db.write();
  console.log("🔧 db.json was missing some fields from a newer version — patched automatically.");
}

export async function saveDb() {
  await db.write();
}

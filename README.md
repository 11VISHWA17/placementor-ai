# PlaceMentor AI — Full Working Project (Free API + Free Cloud)

A complete, runnable placement-preparation AI agent: coding recommendations, mock interviews,
resume analysis, company prep, and roadmap generation — built entirely on **free** services.

- **AI:** [Groq API](https://console.groq.com/keys) — free tier, `llama-3.3-70b-versatile`
- **Database:** File-based (lowdb) — zero signup, zero cost. Swap in MongoDB Atlas free tier later if you want.
- **Backend:** Node.js + Express
- **Frontend:** React + Vite
- **Deployment:** Docker Compose (local) or free hosting (Render / Railway / Fly.io — see below)

---

## 1. Get your free Groq API key

1. Go to https://console.groq.com/keys
2. Sign up (free, no credit card required)
3. Create an API key
4. Copy `backend/.env.example` to `backend/.env` and paste your key:

```bash
cd backend
cp .env.example .env
# edit .env and set GROQ_API_KEY=gsk_xxxxxxxx
```

---

## 2. Run locally (no Docker)

**Backend:**
```bash
cd backend
npm install
npm start
# → running on http://localhost:8080
```

**Frontend (new terminal):**
```bash
cd frontend
npm install
npm run dev
# → running on http://localhost:3000
```

Open http://localhost:3000 — the frontend automatically proxies `/api` calls to the backend.

---

## 3. Run with Docker (recommended for "cloud-like" local setup)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080

Data persists in `backend/data/db.json` via a mounted volume — no external database needed.

---

## 4. Deploy to the cloud for free

Any of these have generous free tiers and work with this project as-is:

### Option A — Render (easiest)
1. Push this project to a GitHub repo
2. Create a **Web Service** on [render.com](https://render.com) pointed at `/backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Add env var `GROQ_API_KEY`
3. Create a **Static Site** pointed at `/frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
   - Add env var to rewrite `/api` calls to your backend URL (or edit `vite.config.js` proxy target before building)

### Option B — Railway
1. `railway init` in the project root
2. Deploy `backend/` as one service, `frontend/` as another (Railway free tier covers both)
3. Set `GROQ_API_KEY` in the backend service's variables

### Option C — Fly.io
1. `fly launch` inside `backend/` (uses the provided Dockerfile)
2. `fly launch` inside `frontend/` (uses the provided Dockerfile)
3. `fly secrets set GROQ_API_KEY=...` on the backend app

All three have free tiers sufficient for a demo/portfolio deployment.

---

## 5. Admin login vs. member login

There's a single `/login` page, but who you are is decided by your credentials:

1. In `backend/.env`, set:
   ```
   ADMIN_EMAIL=you@example.com
   ADMIN_PASSWORD=some_strong_password
   ```
2. Restart the backend. On startup it auto-creates (or upgrades) that one account to role `admin`.
3. Log in on the same page everyone else uses, with those credentials — you'll be redirected to
   `/admin` automatically instead of the regular student dashboard.
4. Anyone else who registers through the "Create a member account" link gets role `member` and
   only ever sees the regular app (Dashboard, Coding, Mock Interview, Roadmap, Companies).
   Members can never make themselves admin — that only happens via the `.env` values above.

**Admin Dashboard shows:**
- Total members registered
- Total logins (all-time) and how many members were active today
- Per-feature usage counts (recommendations generated, interviews completed, resumes analyzed)
- A full member table: name, email, login count, last login, join date

## 5b. LeetCode links in recommendations

Every recommended problem now includes a `leetcodeLink`:
- If the AI is confident the problem exists on LeetCode under that name, it links straight to
  `https://leetcode.com/problems/<slug>/`.
- Otherwise it falls back to a LeetCode **search** link for that problem name, and marks
  `onLeetCode: false` so the frontend labels it as "Search this problem on LeetCode →" instead of
  "Practice on LeetCode →". This avoids showing broken/wrong links for less common problems.

## 6. What's implemented

| Feature | Endpoint | Status |
|---|---|---|
| Register / Login | `POST /api/auth/register`, `/login` | ✅ Working (JWT-based) |
| Coding Recommendations | `POST /api/recommend` | ✅ Working (Groq, JSON mode) |
| Mock Interview | `POST /api/mockInterview/start`, `/:id/answer` | ✅ Working, 5-question flow with scoring |
| Resume Analyzer | `POST /api/resumeAnalysis` | ✅ Working (PDF or plain text upload) |
| Company-wise Prep | `GET /api/companies`, `/:company/prep` | ✅ Working |
| Roadmap Generator | `POST /api/roadmap` | ✅ Working |
| Progress Dashboard | `GET /api/progress/:userId` | ✅ Working (aggregates the above) |

The frontend has pages for Dashboard, Coding Recommendations, Mock Interview (chat-style),
Roadmap Generator, and Company-wise Preparation.

---

## 6. Project structure

```
placementor-ai/
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── recommend.js
│   │   ├── interview.js
│   │   ├── roadmap.js
│   │   ├── resume.js
│   │   ├── companies.js
│   │   └── progress.js
│   ├── data/db.json          ← auto-created local database
│   ├── db.js                 ← lowdb setup
│   ├── groqClient.js         ← Groq API wrapper (the "AI agent" brain)
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/             Dashboard, Recommendations, MockInterview, Roadmap, Companies
│   │   ├── api.js             API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
└── README.md
```

---

## 7. Swapping in MongoDB Atlas (optional, still free)

The project ships with a zero-config file database so it runs instantly. If you want a real
cloud database later:

1. Create a free cluster at https://www.mongodb.com/cloud/atlas/register
2. Get your connection string and put it in `backend/.env` as `MONGODB_URI`
3. Replace the contents of `backend/db.js` with a Mongoose/MongoDB client connection — the rest
   of the route files can stay mostly the same since they just call `db.data.<collection>`.

---

## 8. Notes

- All AI calls go through `backend/groqClient.js` — swap the `GROQ_MODEL` env var or point it at
  Google Gemini's OpenAI-compatible endpoint if you prefer.
- The mock interview and recommendation prompts are the same "Prompt Engineering" templates from
  the project design doc, wired up to return structured JSON so the frontend can render them directly.
- This is a functional starting point, not a production-hardened app — add rate limiting, input
  validation, and proper secrets management before shipping it publicly.

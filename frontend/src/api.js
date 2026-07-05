const BASE_URL = "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`https://placementor-ai.onrender.com/${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data;
}

export const api = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  recommend: (body) => request("/recommend", { method: "POST", body: JSON.stringify(body) }),

  startInterview: (body) => request("/mockInterview/start", { method: "POST", body: JSON.stringify(body) }),
  answerInterview: (sessionId, answer) =>
    request(`/mockInterview/${sessionId}/answer`, { method: "POST", body: JSON.stringify({ answer }) }),

  generateRoadmap: (body) => request("/roadmap", { method: "POST", body: JSON.stringify(body) }),

  getCompanies: () => request("/companies"),
  getCompanyPrep: (company) => request(`/companies/${encodeURIComponent(company)}/prep`),

  getProgress: (userId) => request(`/progress/${userId}`),

  // Admin-only endpoints (require an admin JWT, attached automatically from localStorage)
  getAdminStats: () => request("/admin/stats"),
  getAdminMembers: () => request("/admin/members"),
  getAdminLoginHistory: () => request("/admin/login-history"),

  // Kitty chatbot
  chatWithKitty: (message, history) => request("/chat", { method: "POST", body: JSON.stringify({ message, history }) }),

  // Resume ATS checker (multipart upload, so this bypasses the JSON request() helper)
  analyzeResume: async ({ file, resumeText, targetRole }) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    if (file) formData.append("resume", file);
    if (resumeText) formData.append("resumeText", resumeText);
    formData.append("targetRole", targetRole || "Software Engineer");
    formData.append("userId", "demo-user");

    const res = await fetch(`https://placementor-ai.onrender.com/resumeAnalysis`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    return data;
  }
};

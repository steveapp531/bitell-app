import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (
    import.meta.env.PROD
      ? "https://fintrack-server-gr6j.onrender.com/api"
      : "/api"
  ),
  timeout: 600000,
});

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bitell_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear stored session so ProtectedRoute can redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("bitell_token");
      localStorage.removeItem("bitell_user");
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => api.post("/auth/reset-password", { token, password }),
};

// ── Upload ────────────────────────────────────────────────────
export async function uploadStatement(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/upload", formData, {
    timeout: 600000,
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded * 100) / e.total));
    },
  });
  return response.data;
}

export async function getStatementHistory() {
  const res = await api.get("/upload/history");
  return res.data;
}

export async function getStatementById(id) {
  const res = await api.get(`/upload/${id}`);
  return res.data;
}

// ── Stats ─────────────────────────────────────────────────────
export async function getPublicStats() {
  try {
    const res = await api.get("/stats/public");
    return res.data;
  } catch {
    return { statementsAnalysed: 2000 };
  }
}

export async function checkHealth() {
  try {
    const res = await api.get("/health");
    return res.data.status === "ok";
  } catch { return false; }
}

export default api;

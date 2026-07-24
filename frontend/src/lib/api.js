import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API_BASE });

client.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("echosplit_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const api = {
  // Auth
  register: (data) => client.post("/auth/register", data).then((r) => r.data),
  login: (data) => client.post("/auth/login", data).then((r) => r.data),
  me: () => client.get("/auth/me").then((r) => r.data),
  githubStatus: () => client.get("/auth/github/status").then((r) => r.data),

  // Jobs
  languages: () => client.get("/jobs/languages").then((r) => r.data),
  stages: () => client.get("/jobs/stages").then((r) => r.data),
  createJob: (formData, onUploadProgress) =>
    client
      .post("/jobs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
      })
      .then((r) => r.data),
  getJob: (id, guestToken) =>
    client
      .get(`/jobs/${id}`, { params: guestToken ? { guest_token: guestToken } : {} })
      .then((r) => r.data),
  listJobs: (guestToken) =>
    client
      .get(`/jobs`, { params: guestToken ? { guest_token: guestToken } : {} })
      .then((r) => r.data),
  deleteJob: (id, guestToken) =>
    client
      .delete(`/jobs/${id}`, { params: guestToken ? { guest_token: guestToken } : {} })
      .then((r) => r.data),
  translate: (id, lang_code, guestToken) =>
    client
      .post(
        `/jobs/${id}/translate`,
        { lang_code },
        { params: guestToken ? { guest_token: guestToken } : {} }
      )
      .then((r) => r.data),

  // Dashboard
  stats: () => client.get("/dashboard/stats").then((r) => r.data),
};

export const downloadUrl = (jobId, kind) => `${API_BASE}/jobs/${jobId}/download/${kind}`;
export const mediaUrl = (path) => `${BACKEND_URL}${path}`;

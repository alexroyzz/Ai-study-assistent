import axios from "axios";
import toast from "react-hot-toast";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 60000, // 60 seconds (AI calls can be slow)
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor: Attach JWT token ────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor: Handle errors globally ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error || error.message || "Something went wrong";

    // Handle token expiry - redirect to login
    if (error.response?.status === 401) {
      const isAuthRoute =
        window.location.pathname.includes("/login") ||
        window.location.pathname.includes("/register");
      if (!isAuthRoute) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        toast.error("Session expired. Please login again.");
      }
    }

    return Promise.reject(new Error(message));
  },
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

// ─── User API ─────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  changePassword: (data) => api.put("/users/change-password", data),
  getStats: () => api.get("/users/stats"),
};

// ─── Document API ─────────────────────────────────────────────────────────────
export const documentAPI = {
  upload: (formData) =>
    api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progress) => {
        const percent = Math.round((progress.loaded * 100) / progress.total);
        return percent;
      },
    }),
  getAll: (params) => api.get("/documents", { params }),
  getOne: (id) => api.get(`/documents/${id}`),
  delete: (id) => api.delete(`/documents/${id}`),
};

// ─── Note API ─────────────────────────────────────────────────────────────────
export const noteAPI = {
  generate: (data) => api.post("/notes/generate", data),
  getAll: (params) => api.get("/notes", { params }),
  getOne: (id) => api.get(`/notes/${id}`),
  delete: (id) => api.delete(`/notes/${id}`),
};

// ─── Quiz API ─────────────────────────────────────────────────────────────────
export const quizAPI = {
  generate: (data) => api.post("/quizzes/generate", data),
  getAll: (params) => api.get("/quizzes", { params }),
  getOne: (id) => api.get(`/quizzes/${id}`),
  submit: (id, data) => api.post(`/quizzes/${id}/submit`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
};

// ─── Chat API ─────────────────────────────────────────────────────────────────
export const chatAPI = {
  sendMessage: (data) => api.post("/chats/message", data),
  getAll: (params) => api.get("/chats", { params }),
  getOne: (id) => api.get(`/chats/${id}`),
  delete: (id) => api.delete(`/chats/${id}`),
};

export default api;

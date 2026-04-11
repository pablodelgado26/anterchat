import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../config/environment";

const api = axios.create({
  ...API_CONFIG,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(["token", "user"]);
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (data) => api.post("/auth/register", data),
  logout: async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
  },
};

export const postsAPI = {
  getAll: (params) => api.get("/posts", { params }),
  getById: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post("/posts", data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  share: (id) => api.post(`/posts/${id}/share`),
  addComment: (id, content) => api.post(`/posts/${id}/comments`, { content }),
  deleteComment: (commentId) => api.delete(`/posts/comments/${commentId}`),
};

export const jobsAPI = {
  getAll: (params) => api.get("/jobs", { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post("/jobs", data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  deactivate: (id) => api.patch(`/jobs/${id}/deactivate`),
  apply: (id, data) => api.post(`/jobs/${id}/apply`, data),
  getApplications: (id) => api.get(`/jobs/${id}/applications`),
  updateApplicationStatus: (jobId, applicationId, data) =>
    api.patch(`/jobs/${jobId}/applications/${applicationId}`, data),
};

export const messagesAPI = {
  getConversations: () => api.get("/messages/conversations"),
  getOrCreateConversation: (userId) => api.get(`/messages/conversations/${userId}`),
  sendMessage: (conversationId, data) =>
    api.post(`/messages/conversations/${conversationId}/messages`, data),
  getMessages: (conversationId, params) =>
    api.get(`/messages/conversations/${conversationId}/messages`, { params }),
  markAsRead: (conversationId) =>
    api.patch(`/messages/conversations/${conversationId}/read`),
  getUnreadCount: () => api.get("/messages/unread-count"),
};

export const profileAPI = {
  getProfile: (id) => api.get(`/profile/${id}`),
  updateProfile: (data) => api.put("/profile", data),
  searchUsers: (q, params) =>
    api.get("/profile/search", { params: { q, ...params } }),
  getUserPosts: (id, params) => api.get(`/profile/${id}/posts`, { params }),
  follow: (id) => api.post(`/profile/${id}/follow`),
  unfollow: (id) => api.delete(`/profile/${id}/follow`),
  getFollowers: (id, params) => api.get(`/profile/${id}/followers`, { params }),
  getFollowing: (id, params) => api.get(`/profile/${id}/following`, { params }),
  addExperience: (data) => api.post("/profile/experiences", data),
  updateExperience: (id, data) => api.put(`/profile/experiences/${id}`, data),
  deleteExperience: (id) => api.delete(`/profile/experiences/${id}`),
  addEducation: (data) => api.post("/profile/educations", data),
  deleteEducation: (id) => api.delete(`/profile/educations/${id}`),
  addSkill: (skillName) => api.post("/profile/skills", { skillName }),
  removeSkill: (id) => api.delete(`/profile/skills/${id}`),
};

export const notificationsAPI = {
  getAll: (params) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default api;

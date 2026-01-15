import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/environment';

// Criar instância do axios
const api = axios.create({
  ...API_CONFIG,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Redirecionar para login
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH
// ============================================
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },
};

// ============================================
// POSTS
// ============================================
export const postsAPI = {
  getAll: (params) => api.get('/posts', { params }),
  getById: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  addComment: (id, content) => api.post(`/posts/${id}/comments`, { content }),
  deleteComment: (commentId) => api.delete(`/posts/comments/${commentId}`),
};

// ============================================
// JOBS
// ============================================
export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  deactivate: (id) => api.patch(`/jobs/${id}/deactivate`),
};

// ============================================
// MESSAGES
// ============================================
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getOrCreateConversation: (userId) => api.get(`/messages/conversations/${userId}`),
  sendMessage: (conversationId, data) => 
    api.post(`/messages/conversations/${conversationId}/messages`, data),
  getMessages: (conversationId, params) => 
    api.get(`/messages/conversations/${conversationId}/messages`, { params }),
  markAsRead: (conversationId) => 
    api.patch(`/messages/conversations/${conversationId}/read`),
  getUnreadCount: () => api.get('/messages/unread-count'),
};

// ============================================
// CONNECTIONS
// ============================================
export const connectionsAPI = {
  sendRequest: (receiverId) => api.post('/connections', { receiverId }),
  getAll: (params) => api.get('/connections', { params }),
  getPending: () => api.get('/connections/pending'),
  getStatus: (userId) => api.get(`/connections/status/${userId}`),
  accept: (id) => api.patch(`/connections/${id}/accept`),
  reject: (id) => api.patch(`/connections/${id}/reject`),
  remove: (id) => api.delete(`/connections/${id}`),
};

// ============================================
// PROFILE
// ============================================
export const profileAPI = {
  getProfile: (id) => api.get(`/profile/${id}`),
  updateProfile: (data) => api.put('/profile', data),
  searchUsers: (q, params) => api.get('/profile/search', { params: { q, ...params } }),
  
  // Experiências
  addExperience: (data) => api.post('/profile/experiences', data),
  updateExperience: (id, data) => api.put(`/profile/experiences/${id}`, data),
  deleteExperience: (id) => api.delete(`/profile/experiences/${id}`),
  
  // Educação
  addEducation: (data) => api.post('/profile/educations', data),
  deleteEducation: (id) => api.delete(`/profile/educations/${id}`),
  
  // Skills
  addSkill: (skillName) => api.post('/profile/skills', { skillName }),
  removeSkill: (id) => api.delete(`/profile/skills/${id}`),
};

// ============================================
// COMPANIES
// ============================================
export const companiesAPI = {
  getAll: (params) => api.get('/companies', { params }),
  getById: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
};

export default api;

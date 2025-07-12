import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (courseData) => api.post('/courses', courseData),
  update: (id, courseData) => api.put(`/courses/${id}`, courseData),
  delete: (id) => api.delete(`/courses/${id}`),
  getPublic: (params) => api.get('/courses/public', { params }),
};

export const enrollmentsAPI = {
  getAll: () => api.get('/enrollments'),
  create: (enrollmentData) => api.post('/enrollments', enrollmentData),
  update: (id, data) => api.put(`/enrollments/${id}`, data),
  approve: (id) => api.put(`/enrollments/${id}/approve`),
  reject: (id) => api.put(`/enrollments/${id}/reject`),
  getMyEnrollments: () => api.get('/enrollments/my'),
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updateProfile: (userData) => api.put('/users/profile', userData),
};

export const announcementsAPI = {
  getAll: () => api.get('/announcements'),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const contactAPI = {
  submit: (contactData) => api.post('/contact', contactData),
  getAll: () => api.get('/contact'),
  markAsRead: (id) => api.put(`/contact/${id}/read`),
  delete: (id) => api.delete(`/contact/${id}`),
};

export const liveSessionsAPI = {
  getAll: () => api.get('/live-sessions'),
  create: (sessionData) => api.post('/live-sessions', sessionData),
  update: (id, sessionData) => api.put(`/live-sessions/${id}`, sessionData),
  delete: (id) => api.delete(`/live-sessions/${id}`),
  join: (id) => api.post(`/live-sessions/${id}/join`),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;

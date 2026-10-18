import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach active session headers and admin token
api.interceptors.request.use(
  (config) => {
    // Admin token
    const adminToken = localStorage.getItem('scp_admin_token');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }

    // Session headers (if set)
    const sessionId = sessionStorage.getItem('scp_session_id');
    const sessionToken = sessionStorage.getItem('scp_session_token');

    if (sessionId && !config.headers['x-session-id']) {
      config.headers['x-session-id'] = sessionId;
    }
    if (sessionToken && !config.headers['x-session-token']) {
      config.headers['x-session-token'] = sessionToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Server request failed';
    return Promise.reject(new Error(errorMsg));
  }
);

export default api;

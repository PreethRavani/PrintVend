import axios from 'axios';

// Dynamically determine the API base URL
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  // In the browser, detect if accessed from a non-localhost device (e.g. mobile phone on LAN)
  if (typeof window !== 'undefined' && window.location) {
    const { hostname } = window.location;
    const isLoopback = hostname === 'localhost' || hostname === '127.0.0.1';

    // If client is accessed via a real IP / LAN address (like phone scanning QR code),
    // NEVER point to localhost because localhost would target the phone itself!
    if (!isLoopback) {
      if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
        return '/api';
      }
    }
  }

  // If explicit relative or valid external URL is provided, use it
  if (envUrl && envUrl.trim() !== '' && !envUrl.includes('localhost:5000')) {
    return envUrl;
  }

  // Default to relative '/api', proxied by Vite dev/preview server and Vercel routing
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

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

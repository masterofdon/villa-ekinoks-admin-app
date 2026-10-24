import axios from 'axios';
import { API_BASE_URL, ensureValidSession, forceLogout } from '@/lib/auth-session';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      // Renews the session through the mirror endpoint when the access token expired
      await ensureValidSession();
      const token = localStorage.getItem('accesstoken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401: unauthorized, 407: the backend requires re-authorization (e.g. permissions changed)
    const status = error.response?.status;
    if (status === 401 || status === 407) {
      forceLogout();
    }
    // Backend in maintenance/overloaded: show the 503 page and let the user come back
    if (status === 503 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/503')) {
      const from = window.location.pathname + window.location.search;
      // Full navigation on purpose: resets any broken client state
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      globalThis.location.href = `/503?from=${encodeURIComponent(from)}`;
    }
    return Promise.reject(error);
  }
);

export default api;
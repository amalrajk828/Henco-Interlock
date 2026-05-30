import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request Interceptor: Automatically inject Auth JWT Token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('henco_admin_user');
    if (userInfo) {
      try {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error('Failed to parse local admin session:', err.message);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Intercept Session Expirations
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized (401), clean credentials if active admin route
    if (error.response && error.response.status === 401) {
      const isLogged = localStorage.getItem('henco_admin_user');
      if (isLogged) {
        localStorage.removeItem('henco_admin_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getImageUrl = (image) => {
  if (!image) return '';
  if (typeof image === 'object') {
    return image.url || image.imageUrl || '';
  }
  if (typeof image === 'string') {
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `${api.defaults.baseURL.replace('/api', '')}${image}`;
  }
  return '';
};

export default api;

import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT token into authorization header of requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eyecare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global response interceptor for session expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear credentials if token expired
      localStorage.removeItem('eyecare_token');
      localStorage.removeItem('eyecare_user');
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;

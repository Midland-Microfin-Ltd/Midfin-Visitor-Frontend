import axios from 'axios';
import { determineHost, redirectOnTokenExpiry } from './commonutilities';
import { retrieveFromLocalStorage } from './localStorageUtils';

const host = determineHost();

// Create axios instance
const apiClient = axios.create({
  baseURL: host,
  timeout: import.meta.env.VITE_API_TIMEOUT ? parseInt(import.meta.env.VITE_API_TIMEOUT) : 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = retrieveFromLocalStorage('token');
    // ownAuth requests (the guard page) bring their own token.
    if (token && !config.ownAuth) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (!error.response) {
      // Network error
      return Promise.reject({ 
        errorCode: "networkError", 
        errorDescription: "Please check your internet connection!" 
      });
    }

    // ownAuth requests handle their own 401 (expired guard session, wrong PIN) and need the status (429 lockout).
    if (error.config?.ownAuth) {
      const data = typeof error.response.data === 'object' ? error.response.data : {};
      return Promise.reject({ status: error.response.status, ...data });
    }

    if (error.response.status === 401) {
      // Token expired
      redirectOnTokenExpiry();
    }

    // Return the error response data
    return Promise.reject(error.response.data || error);
  }
);

export default apiClient;
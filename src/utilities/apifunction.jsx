import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, {
        data: config.data,
        headers: config.headers
      });
    }
    
    return config;
  },
  (error) => {
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }
    return response.data;
  },
  (error) => {
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.error('[API Response Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }

    let errorMessage = 'An unexpected error occurred';
    let errorStatus = 500;
    let errorData = {};

    if (error.response) {
      errorStatus = error.response.status;
      errorData = error.response.data || {};
      
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.status === 401) {
        errorMessage = 'Unauthorized access. Please login again.';
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
      } else if (error.response.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.response.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection.';
    } else {
      errorMessage = error.message || errorMessage;
    }

    const formattedError = {
      status: errorStatus,
      message: errorMessage,
      data: errorData,
      originalError: error,
    };

    return Promise.reject(formattedError);
  }
);


export const loginUser = async (username, password) => {
  if (!username?.trim() || !password?.trim()) {
    throw new Error('Username and password are required');
  }

  const response = await apiClient.post('/api/v1/auth/login', {
    username: username.trim(),
    password: password.trim(),
  });

  return response;
};
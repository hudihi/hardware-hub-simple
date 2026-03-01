import type { InternalAxiosRequestConfig } from 'axios';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = 'https://api.pahala.store';
const TOKEN_KEY = 'pahala_admin_token';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: `${config.baseURL}${config.url}`,
      hasAuth: !!localStorage.getItem(TOKEN_KEY)
    });
    
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase()
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      // Token expired or invalid - clear it and redirect to login
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Helper functions for token management
export const tokenManager = {
  getStoredToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  clearToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};

export default apiClient;
export { API_BASE_URL, TOKEN_KEY };


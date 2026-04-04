import type { InternalAxiosRequestConfig } from 'axios';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = 'https://api.pahala.store';
const ADMIN_TOKEN_KEY = 'pahala_admin_token';
const CUSTOMER_TOKEN_KEY = 'pahala_customer_token';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// Request interceptor to attach auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Determine which token to use based on the endpoint
    let token = null;
    let tokenType = 'none';
    
    if (config.url?.includes('/admin/')) {
      token = localStorage.getItem(ADMIN_TOKEN_KEY);
      tokenType = 'admin';
    } else if (config.url?.includes('/customer/')) {
      token = localStorage.getItem(CUSTOMER_TOKEN_KEY);
      tokenType = 'customer';
    } else if (config.url?.includes('/payments/upload-proof')) {
      // Customer upload must not use admin token when both are stored
      token = localStorage.getItem(CUSTOMER_TOKEN_KEY);
      tokenType = 'customer';
    } else if (config.url?.includes('/payments/proofs/')) {
      token = localStorage.getItem(ADMIN_TOKEN_KEY);
      tokenType = 'admin';
    } else {
      token = localStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(CUSTOMER_TOKEN_KEY);
      tokenType = token === localStorage.getItem(ADMIN_TOKEN_KEY) ? 'admin' : 'customer';
    }
    
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: `${config.baseURL}${config.url}`,
      tokenType,
      hasAuth: !!token
    });
    
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
      const url = error.config?.url || '';
      // Token expired or invalid - clear appropriate token and redirect
      if (url.includes('/admin/')) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        window.location.href = '/admin/login';
      } else if (url.includes('/customer/') || (url.includes('/payments/') && !url.includes('/admin/'))) {
        localStorage.removeItem(CUSTOMER_TOKEN_KEY);
        window.location.href = '/track-order';
      } else {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(CUSTOMER_TOKEN_KEY);
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Helper functions for token management
export const tokenManager = {
  getAdminToken: (): string | null => {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },
  
  getCustomerToken: (): string | null => {
    return localStorage.getItem(CUSTOMER_TOKEN_KEY);
  },
  
  setAdminToken: (token: string): void => {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },
  
  setCustomerToken: (token: string): void => {
    localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  },
  
  clearAdminToken: (): void => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },
  
  clearCustomerToken: (): void => {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  },
  
  clearAllTokens: (): void => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  },
  
  isAdminAuthenticated: (): boolean => {
    return !!localStorage.getItem(ADMIN_TOKEN_KEY);
  },
  
  isCustomerAuthenticated: (): boolean => {
    return !!localStorage.getItem(CUSTOMER_TOKEN_KEY);
  },
  
  isAuthenticated: (): boolean => {
    return !!(localStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(CUSTOMER_TOKEN_KEY));
  }
};

export default apiClient;
export { ADMIN_TOKEN_KEY, API_BASE_URL, CUSTOMER_TOKEN_KEY };


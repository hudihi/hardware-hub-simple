import apiClient, { CUSTOMER_TOKEN_KEY } from './api';

// Types for authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface JWTPayload {
  sub: string;
  role: string;
  exp: number;
  iat?: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

// OTP Types
export interface OTPRequest {
  phone: string;
}

export interface OTPResponse {
  message: string;
}

export interface OTPVerifyRequest {
  phone: string;
  code: string;
}

export interface OTPVerifyResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// JWT Helper Functions
export const jwtUtils = {
  /**
   * Decode JWT token without verification (client-side only)
   * @param token - JWT token string
   * @returns Decoded payload or null if invalid
   */
  decodeToken: (token: string): JWTPayload | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded) as JWTPayload;
    } catch (error) {
      console.error('JWT decode error:', error);
      return null;
    }
  },

  /**
   * Check if token is expired
   * @param payload - Decoded JWT payload
   * @returns true if token is expired
   */
  isTokenExpired: (payload: JWTPayload): boolean => {
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  },

  /**
   * Validate admin role
   * @param payload - Decoded JWT payload
   * @returns true if role is admin
   */
  isAdminRole: (payload: JWTPayload): boolean => {
    return payload.role === 'admin';
  },

  /**
   * Validate token (not expired and admin role)
   * @param token - JWT token string
   * @returns true if token is valid for admin
   */
  validateAdminToken: (token: string): boolean => {
    const payload = jwtUtils.decodeToken(token);
    if (!payload) return false;

    return !jwtUtils.isTokenExpired(payload) && jwtUtils.isAdminRole(payload);
  }
};

// Token storage key
const TOKEN_KEY = 'pahala_admin_token';

// Admin authentication service
export const authService = {
  /**
   * Admin login function
   * @param credentials - Email and password
   * @returns Promise<LoginResponse>
   */
  loginAdmin: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post('/api/v1/admin/auth/login', credentials);
      
      // Extract access_token from response
      const { access_token } = response.data;
      
      if (!access_token) {
        throw new Error('No access token received from server');
      }

      // Validate the token contains admin role
      if (!jwtUtils.validateAdminToken(access_token)) {
        throw new Error('Invalid admin credentials');
      }

      // Store token
      localStorage.setItem(TOKEN_KEY, access_token);

      return response.data;
    } catch (error: any) {
      // Extract error message from response or use default
      const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Login failed. Please try again.';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Admin logout function
   */
  logoutAdmin: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Get stored authentication token
   */
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Set authentication token
   */
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Remove authentication token
   */
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Check if admin is authenticated with valid token
   */
  isAuthenticated: (): boolean => {
    const token = authService.getToken();
    if (!token) return false;

    return jwtUtils.validateAdminToken(token);
  },

  /**
   * Get decoded token payload
   */
  getTokenPayload: (): JWTPayload | null => {
    const token = authService.getToken();
    if (!token) return null;

    return jwtUtils.decodeToken(token);
  },

  /**
   * Request OTP for phone number
   * @param phone - Phone number to send OTP to
   * @returns Promise<OTPResponse>
   */
  requestOTP: async (phone: string): Promise<OTPResponse> => {
    try {
      const response = await apiClient.post('/api/v1/customer/auth/request-otp', { phone });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Failed to send OTP. Please try again.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Verify OTP code
   * @param phone - Phone number
   * @param code - OTP code to verify
   * @returns Promise<OTPVerifyResponse>
   */
  verifyOTP: async (phone: string, code: string): Promise<OTPVerifyResponse> => {
    try {
      const response = await apiClient.post('/api/v1/customer/auth/verify-otp', { phone, otp: code });
      
      // Extract access token from response
      const { access_token, token_type, expires_in } = response.data;
      
      if (!access_token) {
        throw new Error('No access token received from server');
      }

      // Store the customer token (different from admin token)
      localStorage.setItem(CUSTOMER_TOKEN_KEY, access_token);

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'OTP verification failed. Please try again.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Get stored customer authentication token
   */
  getCustomerToken: (): string | null => {
    return localStorage.getItem(CUSTOMER_TOKEN_KEY);
  },

  /**
   * Set customer authentication token
   */
  setCustomerToken: (token: string): void => {
    localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  },

  /**
   * Remove customer authentication token
   */
  removeCustomerToken: (): void => {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  },

  /**
   * Check if customer is authenticated
   */
  isCustomerAuthenticated: (): boolean => {
    const token = authService.getCustomerToken();
    return !!token;
  }
};

export default authService;

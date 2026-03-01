import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, LoginRequest, JWTPayload } from '../services/auth.service';

interface UseAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: JWTPayload | null;
}

interface UseAuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshToken: () => boolean;
}

export const useAuth = (): UseAuthState & UseAuthActions => {
  const navigate = useNavigate();
  
  const [state, setState] = useState<UseAuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    user: null,
  });

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuthenticated = authService.isAuthenticated();
        const payload = authService.getTokenPayload();
        
        setState({
          isAuthenticated,
          isLoading: false,
          error: null,
          user: payload,
        });
      } catch (error) {
        setState({
          isAuthenticated: false,
          isLoading: false,
          error: null,
          user: null,
        });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await authService.loginAdmin(credentials);
      
      const payload = authService.getTokenPayload();
      
      setState({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        user: payload,
      });

      // Redirect to admin dashboard
      navigate('/admin');
    } catch (error: any) {
      setState({
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Login failed',
        user: null,
      });
    }
  }, [navigate]);

  // Logout function
  const logout = useCallback((): void => {
    authService.logoutAdmin();
    
    setState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: null,
    });

    // Redirect to login page
    navigate('/admin/login');
  }, [navigate]);

  // Clear error function
  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Refresh token validation
  const refreshToken = useCallback((): boolean => {
    const isAuthenticated = authService.isAuthenticated();
    const payload = authService.getTokenPayload();
    
    setState(prev => ({
      ...prev,
      isAuthenticated,
      user: payload,
    }));

    return isAuthenticated;
  }, []);

  return {
    ...state,
    login,
    logout,
    clearError,
    refreshToken,
  };
};

export default useAuth;

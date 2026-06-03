/**
 * Authentication Context
 * Provides centralized authentication state management
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  User,
  AuthContextType,
  LoginRequest,
  RegisterRequest,
  PasswordResetRequest,
  PasswordResetConfirmation,
  AuthError,
  AuthErrorType,
} from '../types/auth';
import { AuthService } from './AuthService';
import { SecureTokenService } from './SecureTokenService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 * Wraps the app and provides authentication state
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize auth state on app load
   * Check if user has valid tokens
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Check if we have valid tokens
        const isAuth = await AuthService.isAuthenticated();

        if (isAuth) {
          // Try to load user from storage
          const cachedUser = await AuthService.getCurrentUser();
          setUser(cachedUser);
          setIsAuthenticated(true);
        } else {
          // Clear everything if tokens are invalid
          await SecureTokenService.clearTokens();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Auto-refresh token before expiration
   * OWASP: Proactive token refresh prevents session expiration
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkAndRefreshToken = async () => {
      try {
        const isExpired = await SecureTokenService.isTokenExpired(300); // 5 min buffer

        if (isExpired) {
          const newAccessToken = await AuthService.refreshAccessToken();
          console.log('[AuthContext] Token refreshed successfully');
        }
      } catch (error) {
        console.error('[AuthContext] Token refresh failed:', error);
        // Force logout if refresh fails
        await handleLogout();
      }
    };

    // Check token every 5 minutes
    const interval = setInterval(checkAndRefreshToken, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  /**
   * Login handler
   */
  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        setIsLoading(true);

        const result = await AuthService.login({ email, password });
        setUser(result.user);
        setIsAuthenticated(true);
      } catch (err: any) {
        const authError = err as AuthError;
        const errorMessage =
          authError.message || 'Login failed. Please try again.';
        setError(errorMessage);
        setIsAuthenticated(false);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Register handler
   */
  const handleRegister = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        setError(null);
        setIsLoading(true);

        const newUser = await AuthService.register({
          email,
          password,
          name,
          acceptTerms: true,
        });

        setUser(newUser);
        setIsAuthenticated(true);
      } catch (err: any) {
        const authError = err as AuthError;
        const errorMessage =
          authError.message || 'Registration failed. Please try again.';
        setError(errorMessage);
        setIsAuthenticated(false);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Logout handler
   */
  const handleLogout = useCallback(async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout even if backend call fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh token handler
   */
  const handleRefreshAccessToken = useCallback(async () => {
    try {
      const newAccessToken = await AuthService.refreshAccessToken();
      return newAccessToken;
    } catch (err: any) {
      setError('Session expired. Please login again.');
      setIsAuthenticated(false);
      throw err;
    }
  }, []);

  /**
   * Password reset request handler
   */
  const handleResetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      await AuthService.requestPasswordReset({ email });
    } catch (err: any) {
      const authError = err as AuthError;
      setError(authError.message || 'Password reset failed');
      throw err;
    }
  }, []);

  /**
   * Confirm password reset handler
   */
  const handleConfirmPasswordReset = useCallback(
    async (token: string, newPassword: string) => {
      try {
        setError(null);
        await AuthService.confirmPasswordReset({
          token,
          newPassword,
          confirmPassword: newPassword,
        });
      } catch (err: any) {
        const authError = err as AuthError;
        setError(authError.message || 'Password reset failed');
        throw err;
      }
    },
    []
  );

  /**
   * Update user profile
   */
  const handleUpdateUserProfile = useCallback(
    async (updates: Partial<User>) => {
      try {
        setError(null);
        const updatedUser = await AuthService.updateUserProfile(updates);
        setUser(updatedUser);
      } catch (err: any) {
        const authError = err as AuthError;
        setError(authError.message || 'Profile update failed');
        throw err;
      }
    },
    []
  );

  /**
   * Verify email
   */
  const handleVerifyEmail = useCallback(async (token: string) => {
    try {
      setError(null);
      await AuthService.verifyEmail(token);
    } catch (err: any) {
      const authError = err as AuthError;
      setError(authError.message || 'Email verification failed');
      throw err;
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshAccessToken: handleRefreshAccessToken,
    resetPassword: handleResetPassword,
    confirmPasswordReset: handleConfirmPasswordReset,
    updateUserProfile: handleUpdateUserProfile,
    verifyEmail: handleVerifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

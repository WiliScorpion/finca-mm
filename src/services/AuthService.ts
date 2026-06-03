/**
 * Authentication Service
 * Handles login, registration, token refresh, and session management
 */

import { ApiClient } from './ApiClient';
import { SecureTokenService } from './SecureTokenService';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  PasswordResetRequest,
  PasswordResetConfirmation,
  AuthError,
  AuthErrorType,
  JWTPayload,
} from '../types/auth';
import { jwtDecode } from 'jwt-decode';

export class AuthService {
  /**
   * Login with email and password
   */
  static async login(request: LoginRequest): Promise<{ user: User; tokens: any }> {
    try {
      const response = await ApiClient.post<AuthResponse>('/auth/login', {
        email: request.email,
        password: request.password,
        rememberMe: request.rememberMe,
      });

      if (response.data.success && response.data.data) {
        const authResponse = response.data.data;

        // Save tokens securely
        await SecureTokenService.saveTokens({
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
          expiresAt: Math.floor(Date.now() / 1000) + authResponse.expiresIn,
        });

        // Save user info
        await SecureTokenService.saveUserInfo(JSON.stringify(authResponse.user));

        return {
          user: authResponse.user,
          tokens: authResponse,
        };
      }

      throw new Error('Invalid login response');
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Register new user
   */
  static async register(request: RegisterRequest): Promise<User> {
    try {
      const response = await ApiClient.post<AuthResponse>('/auth/register', {
        email: request.email,
        password: request.password,
        name: request.name,
        acceptTerms: request.acceptTerms,
      });

      if (response.data.success && response.data.data) {
        const authResponse = response.data.data;

        // Save tokens securely
        await SecureTokenService.saveTokens({
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
          expiresAt: Math.floor(Date.now() / 1000) + authResponse.expiresIn,
        });

        // Save user info
        await SecureTokenService.saveUserInfo(JSON.stringify(authResponse.user));

        return authResponse.user;
      }

      throw new Error('Invalid registration response');
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    try {
      const response = await ApiClient.post('/auth/password-reset/request', {
        email: request.email,
      });

      if (!response.data.success) {
        throw new Error('Failed to request password reset');
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Confirm password reset
   */
  static async confirmPasswordReset(request: PasswordResetConfirmation): Promise<void> {
    try {
      if (request.newPassword !== request.confirmPassword) {
        throw {
          type: AuthErrorType.WEAK_PASSWORD,
          message: 'Passwords do not match',
        };
      }

      const response = await ApiClient.post('/auth/password-reset/confirm', {
        token: request.token,
        newPassword: request.newPassword,
      });

      if (!response.data.success) {
        throw new Error('Failed to reset password');
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(): Promise<string> {
    try {
      const refreshToken = await SecureTokenService.getRefreshToken();

      if (!refreshToken) {
        throw {
          type: AuthErrorType.TOKEN_EXPIRED,
          message: 'No refresh token available',
        };
      }

      const response = await ApiClient.post<any>('/auth/refresh-token', {
        refreshToken,
      });

      if (response.data.success && response.data.data) {
        const { accessToken, expiresIn, refreshToken: newRefreshToken } =
          response.data.data;

        // Update tokens
        await SecureTokenService.rotateTokens({
          accessToken,
          refreshToken: newRefreshToken || refreshToken,
          expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
        });

        return accessToken;
      }

      throw new Error('Token refresh failed');
    } catch (error: any) {
      // Clear tokens if refresh fails
      await SecureTokenService.clearTokens();
      throw this.handleAuthError(error);
    }
  }

  /**
   * Logout - clear local tokens and notify backend
   */
  static async logout(): Promise<void> {
    try {
      // Optional: Notify backend about logout
      try {
        await ApiClient.post('/auth/logout', {});
      } catch (error) {
        // Continue logout even if backend call fails
        console.warn('Backend logout failed, proceeding with local logout');
      }

      // Clear tokens locally
      await Promise.all([
        SecureTokenService.clearTokens(),
        SecureTokenService.clearUserInfo(),
      ]);
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear tokens even if there's an error
      await SecureTokenService.clearTokens();
      throw error;
    }
  }

  /**
   * Get current user from stored info
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await SecureTokenService.getUserInfo();
      if (!userJson) return null;
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Verify email token
   */
  static async verifyEmail(token: string): Promise<void> {
    try {
      const response = await ApiClient.post('/auth/verify-email', { token });

      if (!response.data.success) {
        throw new Error('Email verification failed');
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await ApiClient.put<User>('/auth/profile', updates);

      if (response.data.success && response.data.data) {
        // Update cached user info
        await SecureTokenService.saveUserInfo(
          JSON.stringify(response.data.data)
        );
        return response.data.data;
      }

      throw new Error('Failed to update profile');
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Check if user has valid tokens
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const accessToken = await SecureTokenService.getAccessToken();
      if (!accessToken) return false;

      const isExpired = await SecureTokenService.isTokenExpired();
      return !isExpired;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get JWT claims from token
   * Used to extract user info without backend call
   */
  static async getTokenClaims(): Promise<JWTPayload | null> {
    try {
      const accessToken = await SecureTokenService.getAccessToken();
      if (!accessToken) return null;

      const decoded = jwtDecode<JWTPayload>(accessToken);
      return decoded;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * OWASP: Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Handle authentication errors
   * Maps API errors to auth error types
   */
  private static handleAuthError(error: any): AuthError {
    // Handle API client errors
    if (error.statusCode) {
      switch (error.statusCode) {
        case 401:
          return {
            type: AuthErrorType.INVALID_CREDENTIALS,
            message: 'Invalid email or password',
          };
        case 409:
          return {
            type: AuthErrorType.EMAIL_ALREADY_EXISTS,
            message: 'Email already registered',
          };
        case 400:
          if (error.code === 'WEAK_PASSWORD') {
            return {
              type: AuthErrorType.WEAK_PASSWORD,
              message: 'Password does not meet security requirements',
            };
          }
          return {
            type: AuthErrorType.INVALID_CREDENTIALS,
            message: error.message || 'Invalid request',
          };
        default:
          return {
            type: AuthErrorType.UNKNOWN_ERROR,
            message: error.message || 'An error occurred',
          };
      }
    }

    // Handle network errors
    if (error.message === 'Network Error') {
      return {
        type: AuthErrorType.NETWORK_ERROR,
        message: 'Network error. Please check your connection.',
      };
    }

    return {
      type: AuthErrorType.UNKNOWN_ERROR,
      message: error.message || 'An unknown error occurred',
    };
  }
}

/**
 * Secure Token Storage Service - WEB VERSION
 * Uses localStorage for web (not as secure as native SecureStore, but necessary for web)
 */

import { TokenStore } from '../types/auth';

const ACCESS_TOKEN_KEY = 'finca_mm_access_token';
const REFRESH_TOKEN_KEY = 'finca_mm_refresh_token';
const TOKEN_EXPIRY_KEY = 'finca_mm_token_expiry';
const USER_KEY = 'finca_mm_user';

export class SecureTokenService {
  /**
   * Save tokens (using localStorage on web)
   */
  static async saveTokens(tokenStore: TokenStore): Promise<void> {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokenStore.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokenStore.refreshToken);
      localStorage.setItem(TOKEN_EXPIRY_KEY, tokenStore.expiresAt.toString());
    } catch (error) {
      console.error('[SecureTokenService] Failed to save tokens:', error);
      throw new Error('Failed to save authentication tokens');
    }
  }

  /**
   * Retrieve access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      return token || null;
    } catch (error) {
      console.error('[SecureTokenService] Failed to retrieve access token:', error);
      return null;
    }
  }

  /**
   * Retrieve refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      const token = localStorage.getItem(REFRESH_TOKEN_KEY);
      return token || null;
    } catch (error) {
      console.error('[SecureTokenService] Failed to retrieve refresh token:', error);
      return null;
    }
  }

  /**
   * Get token expiry time
   */
  static async getTokenExpiry(): Promise<number | null> {
    try {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      return expiry ? parseInt(expiry, 10) : null;
    } catch (error) {
      console.error('[SecureTokenService] Failed to retrieve token expiry:', error);
      return null;
    }
  }

  /**
   * Save user data
   */
  static async saveUser(user: any): Promise<void> {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('[SecureTokenService] Failed to save user:', error);
      throw new Error('Failed to save user data');
    }
  }

  /**
   * Get user data
   */
  static async getUser(): Promise<any | null> {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('[SecureTokenService] Failed to retrieve user:', error);
      return null;
    }
  }

  /**
   * Clear all tokens
   */
  static async clearTokens(): Promise<void> {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('[SecureTokenService] Failed to clear tokens:', error);
      throw new Error('Failed to clear authentication tokens');
    }
  }

  /**
   * Check if tokens exist
   */
  static async hasTokens(): Promise<boolean> {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error('[SecureTokenService] Failed to check tokens:', error);
      return false;
    }
  }
}

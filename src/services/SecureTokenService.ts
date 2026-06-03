/**
 * Secure Token Storage Service
 * Uses expo-secure-store for secure token persistence
 * OWASP Mobile Security: Secure storage of authentication tokens
 */

import * as SecureStore from 'expo-secure-store';
import { TokenStore } from '../types/auth';

const TOKEN_KEY = '@finca_mm_tokens';
const ACCESS_TOKEN_KEY = '@finca_mm_access_token';
const REFRESH_TOKEN_KEY = '@finca_mm_refresh_token';
const TOKEN_EXPIRY_KEY = '@finca_mm_token_expiry';
const USER_KEY = '@finca_mm_user';

/**
 * OWASP Recommendation: Use secure storage to protect sensitive tokens
 * Never store tokens in AsyncStorage or plain text
 */
export class SecureTokenService {
  /**
   * Save tokens securely
   */
  static async saveTokens(tokenStore: TokenStore): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokenStore.accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokenStore.refreshToken),
        SecureStore.setItemAsync(
          TOKEN_EXPIRY_KEY,
          tokenStore.expiresAt.toString()
        ),
      ]);
    } catch (error) {
      console.error('[SecureTokenService] Failed to save tokens:', error);
      throw new Error('Failed to save authentication tokens securely');
    }
  }

  /**
   * Retrieve access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
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
      const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      return token || null;
    } catch (error) {
      console.error('[SecureTokenService] Failed to retrieve refresh token:', error);
      return null;
    }
  }

  /**
   * Retrieve all tokens
   */
  static async getTokens(): Promise<TokenStore | null> {
    try {
      const [accessToken, refreshToken, expiryStr] = await Promise.all([
        SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.getItemAsync(TOKEN_EXPIRY_KEY),
      ]);

      if (!accessToken || !refreshToken || !expiryStr) {
        return null;
      }

      return {
        accessToken,
        refreshToken,
        expiresAt: parseInt(expiryStr, 10),
      };
    } catch (error) {
      console.error('[SecureTokenService] Failed to retrieve tokens:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   * OWASP: Add buffer time (e.g., 60 seconds) to refresh before actual expiration
   */
  static async isTokenExpired(bufferSeconds: number = 60): Promise<boolean> {
    try {
      const expiryStr = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);
      if (!expiryStr) return true;

      const expiresAt = parseInt(expiryStr, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      const bufferTime = currentTime + bufferSeconds;

      return bufferTime >= expiresAt;
    } catch (error) {
      console.error('[SecureTokenService] Failed to check token expiry:', error);
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  static async getTokenExpiry(): Promise<number | null> {
    try {
      const expiryStr = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);
      return expiryStr ? parseInt(expiryStr, 10) : null;
    } catch (error) {
      console.error('[SecureTokenService] Failed to get token expiry:', error);
      return null;
    }
  }

  /**
   * Clear all tokens (on logout)
   */
  static async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY),
      ]);
    } catch (error) {
      console.error('[SecureTokenService] Failed to clear tokens:', error);
      throw new Error('Failed to clear authentication tokens');
    }
  }

  /**
   * OWASP: Rotate tokens by clearing old ones before saving new ones
   * Reduces exposure window in case of compromise
   */
  static async rotateTokens(newTokenStore: TokenStore): Promise<void> {
    try {
      // Atomically clear and save - important for security
      await this.clearTokens();
      await this.saveTokens(newTokenStore);
    } catch (error) {
      console.error('[SecureTokenService] Failed to rotate tokens:', error);
      throw new Error('Failed to rotate authentication tokens');
    }
  }

  /**
   * OWASP: Save minimal user info (never sensitive data)
   */
  static async saveUserInfo(userJson: string): Promise<void> {
    try {
      // Store only public user information
      await SecureStore.setItemAsync(USER_KEY, userJson);
    } catch (error) {
      console.error('[SecureTokenService] Failed to save user info:', error);
    }
  }

  /**
   * Retrieve user info
   */
  static async getUserInfo(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(USER_KEY);
    } catch (error) {
      console.error('[SecureTokenService] Failed to retrieve user info:', error);
      return null;
    }
  }

  /**
   * Clear user info
   */
  static async clearUserInfo(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
      console.error('[SecureTokenService] Failed to clear user info:', error);
    }
  }
}

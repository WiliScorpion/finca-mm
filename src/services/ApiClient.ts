/**
 * Secure API Client
 * Axios-based HTTP client with JWT token management and interceptors
 * OWASP Mobile Security: Centralized API request/response handling
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { SecureTokenService } from './SecureTokenService';
import { ApiResponse, ApiError, AuthErrorType } from '../types';

/**
 * API Configuration
 * Use environment variables in production
 */
export const API_CONFIG = {
  // Development
  development: {
    baseURL: 'http://localhost:3000/api',
    timeout: 15000,
  },
  // Production
  production: {
    baseURL: process.env.REACT_APP_API_URL || 'https://api.example.com/api',
    timeout: 30000,
  },
  // Staging
  staging: {
    baseURL: process.env.REACT_APP_STAGING_API_URL || 'https://staging-api.example.com/api',
    timeout: 20000,
  },
};

type EnvironmentType = 'development' | 'staging' | 'production';
const ENVIRONMENT: EnvironmentType = (process.env.NODE_ENV as EnvironmentType) || 'development';

/**
 * Request queue for token refresh
 * Prevents multiple simultaneous refresh attempts
 */
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

/**
 * Secure API Client Service
 */
export class ApiClient {
  private static instance: AxiosInstance;

  /**
   * Initialize API client with interceptors
   */
  static initialize(): AxiosInstance {
    const config = API_CONFIG[ENVIRONMENT];

    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor: Add JWT token to headers
    this.instance.interceptors.request.use(
      async (config) => {
        const accessToken = await SecureTokenService.getAccessToken();

        if (accessToken) {
          // OWASP: Use Bearer scheme for JWT tokens
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // OWASP: Add security headers
        config.headers['X-Content-Type-Options'] = 'nosniff';
        config.headers['X-Frame-Options'] = 'DENY';
        config.headers['X-XSS-Protection'] = '1; mode=block';

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor: Handle tokens and errors
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<any>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - Token might be expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            // Queue the request to retry after token refresh
            return new Promise((resolve) => {
              subscribeTokenRefresh((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.instance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const refreshToken = await SecureTokenService.getRefreshToken();

            if (!refreshToken) {
              // No refresh token available - force logout
              throw new Error('No refresh token available');
            }

            // Call backend to refresh token
            const response = await axios.post(
              `${config.baseURL}/auth/refresh-token`,
              { refreshToken },
              { timeout: 10000 }
            );

            const { accessToken, expiresIn } = response.data;

            // Save new tokens
            await SecureTokenService.saveTokens({
              accessToken,
              refreshToken: response.data.refreshToken || refreshToken,
              expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
            });

            // Update the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            isRefreshing = false;
            onRefreshed(accessToken);

            // Retry original request with new token
            return this.instance(originalRequest);
          } catch (refreshError) {
            isRefreshing = false;
            refreshSubscribers = [];

            // Refresh failed - clear tokens and force logout
            await SecureTokenService.clearTokens();

            // Dispatch logout event or navigate to login
            // This should be handled by AuthContext
            return Promise.reject({
              type: AuthErrorType.TOKEN_EXPIRED,
              message: 'Session expired. Please login again.',
              statusCode: 401,
            });
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );

    return this.instance;
  }

  /**
   * Get the axios instance
   */
  static getInstance(): AxiosInstance {
    if (!this.instance) {
      return this.initialize();
    }
    return this.instance;
  }

  /**
   * Make GET request
   */
  static async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.getInstance().get<ApiResponse<T>>(url, config);
  }

  /**
   * Make POST request
   */
  static async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.getInstance().post<ApiResponse<T>>(url, data, config);
  }

  /**
   * Make PUT request
   */
  static async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.getInstance().put<ApiResponse<T>>(url, data, config);
  }

  /**
   * Make PATCH request
   */
  static async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.getInstance().patch<ApiResponse<T>>(url, data, config);
  }

  /**
   * Make DELETE request
   */
  static async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.getInstance().delete<ApiResponse<T>>(url, config);
  }

  /**
   * Handle API errors
   * OWASP: Don't expose sensitive error information to users
   */
  private static handleError(error: AxiosError<any>): ApiError {
    const response = error.response;
    const status = response?.status || 0;
    const data = response?.data;

    // Log error for debugging (don't log sensitive data)
    console.error(
      `[ApiClient] Error: ${status} - ${data?.message || error.message}`
    );

    // OWASP: Return generic error messages to users
    const genericMessages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Unauthorized. Please login again.',
      403: 'Access denied.',
      404: 'Resource not found.',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
      503: 'Service unavailable. Please try again later.',
    };

    return {
      code: data?.code || `HTTP_${status}`,
      message: genericMessages[status] || data?.message || 'An error occurred',
      statusCode: status,
      details: process.env.NODE_ENV === 'development' ? data?.details : undefined,
    };
  }
}

// Initialize API client on module load
ApiClient.initialize();

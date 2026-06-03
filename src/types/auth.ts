/**
 * Authentication Types
 * Comprehensive TypeScript interfaces for authentication flows
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export interface UserPreferences {
  notifications: boolean;
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  theme?: 'light' | 'dark';
}

/**
 * JWT Token Payload
 */
export interface JWTPayload {
  sub: string; // User ID
  email: string;
  iat: number; // Issued at
  exp: number; // Expiration
  role: UserRole;
  sessionId: string;
}

/**
 * Refresh Token Payload
 */
export interface RefreshTokenPayload {
  sub: string;
  jti: string; // JWT ID (unique token identifier)
  iat: number;
  exp: number;
}

/**
 * Authentication Response from backend
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Seconds
  user: User;
}

/**
 * Auth Context State
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

/**
 * Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Register Request
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  acceptTerms: boolean;
}

/**
 * Password Reset Request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password Reset Confirmation
 */
export interface PasswordResetConfirmation {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Session Information
 */
export interface Session {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  createdAt: number;
  lastActivityAt: number;
  deviceInfo?: DeviceInfo;
}

/**
 * Device Information for session tracking
 */
export interface DeviceInfo {
  userAgent?: string;
  platform?: string;
  osVersion?: string;
  appVersion?: string;
  deviceId?: string;
}

/**
 * Token Storage Interface
 */
export interface TokenStore {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Auth Errors
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  statusCode?: number;
}

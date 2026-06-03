/**
 * Biometric Authentication Types
 */

export enum BiometricType {
  FACE_ID = 'faceId',
  FINGERPRINT = 'fingerprint',
  IRIS = 'iris',
  FACE = 'face',
  UNDEFINED = 'undefined',
}

export interface BiometricCapabilities {
  available: boolean;
  supportedTypes: BiometricType[];
  canAuthenticate: boolean;
  isDeviceSecure: boolean;
}

export interface BiometricAuthRequest {
  reason?: string;
  fallbackToPassword?: boolean;
  disableDeviceFallback?: boolean;
}

export interface BiometricAuthResult {
  success: boolean;
  biometricType?: BiometricType;
  token?: string;
  error?: BiometricError;
  timestamp: string;
}

export interface BiometricError {
  code: BiometricErrorCode;
  message: string;
  userCancelled?: boolean;
  fallbackPassword?: boolean;
}

export enum BiometricErrorCode {
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  NOT_ENROLLED = 'NOT_ENROLLED',
  HARDWARE_NOT_PRESENT = 'HARDWARE_NOT_PRESENT',
  USER_CANCELLED = 'USER_CANCELLED',
  USER_FALLBACK = 'USER_FALLBACK',
  SYSTEM_CANCELLED = 'SYSTEM_CANCELLED',
  LOCKOUT = 'LOCKOUT',
  GENERIC_ERROR = 'GENERIC_ERROR',
}

/**
 * API Response & Error Types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

/**
 * Pagination
 */
export interface PaginationParams {
  limit: number;
  offset: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Request Configuration
 */
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

/**
 * Notification Types (for push notifications)
 */
export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  timestamp: string;
  read: boolean;
}

/**
 * Device Binding for additional security
 */
export interface DeviceBinding {
  deviceId: string;
  fingerprint: string;
  createdAt: string;
  lastUsedAt: string;
  isActive: boolean;
  platform: 'ios' | 'android' | 'web';
  osVersion: string;
  appVersion: string;
}

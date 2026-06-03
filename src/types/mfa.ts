/**
 * Multi-Factor Authentication (MFA) Types
 * Support for OTP and TOTP authentication
 */

/**
 * MFA Method Types
 */
export enum MFAMethodType {
  EMAIL_OTP = 'email_otp',
  SMS_OTP = 'sms_otp',
  TOTP = 'totp', // Authenticator app (TOTP - Time-based One-Time Password)
  BACKUP_CODES = 'backup_codes',
}

/**
 * MFA Configuration
 */
export interface MFAConfig {
  id: string;
  userId: string;
  method: MFAMethodType;
  isEnabled: boolean;
  isVerified: boolean;
  createdAt: string;
  lastUsedAt?: string;
  metadata?: Record<string, any>;
}

/**
 * TOTP Configuration (Authenticator App)
 */
export interface TOTPConfig extends MFAConfig {
  secret: string; // Base32 encoded secret
  qrCodeUrl?: string; // QR code data URL for scanning
  backupCodes?: string[];
  window?: number; // Time window in seconds (default 30)
}

/**
 * Email OTP Configuration
 */
export interface EmailOTPConfig extends MFAConfig {
  email: string;
  otpLength?: number;
  expiresIn?: number; // in seconds
}

/**
 * MFA Challenge
 */
export interface MFAChallenge {
  id: string;
  userId: string;
  method: MFAMethodType;
  createdAt: string;
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
  metadata?: Record<string, any>;
}

/**
 * MFA Challenge Response
 */
export interface MFAChallengeResponse {
  challengeId: string;
  method: MFAMethodType;
  destination?: string; // For email/SMS, shows masked destination (e.g., "user***@example.com")
  expiresIn: number; // seconds
}

/**
 * MFA Verification Request
 */
export interface MFAVerificationRequest {
  challengeId: string;
  code: string;
  rememberDevice?: boolean;
}

/**
 * Backup Codes
 */
export interface BackupCodes {
  codes: string[];
  generatedAt: string;
  usedCodes: string[];
  remainingCount: number;
}

/**
 * MFA Status
 */
export interface MFAStatus {
  enabled: boolean;
  methods: MFAConfig[];
  primaryMethod?: MFAMethodType;
  backupCodesRemaining?: number;
  enrolledAt?: string;
}

/**
 * MFA Context Type
 */
export interface MFAContextType {
  mfaStatus: MFAStatus | null;
  isLoading: boolean;
  error: string | null;
  enrollMFA: (method: MFAMethodType) => Promise<TOTPConfig | EmailOTPConfig>;
  verifyMFAEnrollment: (code: string, method: MFAMethodType) => Promise<void>;
  disableMFA: (method: MFAMethodType, password: string) => Promise<void>;
  generateBackupCodes: () => Promise<BackupCodes>;
  verifyBackupCode: (code: string) => Promise<void>;
  requestMFAChallenge: () => Promise<MFAChallengeResponse>;
  verifyMFAChallenge: (request: MFAVerificationRequest) => Promise<void>;
  updatePrimaryMFAMethod: (method: MFAMethodType) => Promise<void>;
}

/**
 * MFA Enrollment Request
 */
export interface MFAEnrollmentRequest {
  method: MFAMethodType;
  phoneNumber?: string; // For SMS OTP
}

/**
 * MFA Enrollment Response
 */
export interface MFAEnrollmentResponse {
  secret?: string; // For TOTP
  qrCode?: string; // QR code image or data URL
  backupCodes?: string[];
  email?: string; // For email OTP
  phoneNumber?: string; // For SMS OTP
  expiresIn?: number;
}

/**
 * TOTP Secret for QR Code Generation
 */
export interface TOTPSecret {
  secret: string;
  otpauth_url: string;
  qrCodeUrl?: string;
}

/**
 * MFA Session
 */
export interface MFASession {
  challengeId: string;
  userId: string;
  method: MFAMethodType;
  verified: boolean;
  verifiedAt?: string;
  rememberDevice: boolean;
}

/**
 * MFA Error Types
 */
export enum MFAErrorType {
  INVALID_CODE = 'INVALID_CODE',
  CODE_EXPIRED = 'CODE_EXPIRED',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  MFA_NOT_ENROLLED = 'MFA_NOT_ENROLLED',
  INVALID_METHOD = 'INVALID_METHOD',
  ENROLLMENT_FAILED = 'ENROLLMENT_FAILED',
  DEVICE_NOT_SUPPORTED = 'DEVICE_NOT_SUPPORTED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface MFAError {
  type: MFAErrorType;
  message: string;
  remainingAttempts?: number;
}

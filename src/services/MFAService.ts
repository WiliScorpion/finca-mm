/**
 * Multi-Factor Authentication (MFA) Service
 * Supports Email OTP and TOTP (Authenticator Apps)
 * OWASP Mobile Security: MFA for enhanced security
 */

import { ApiClient } from './ApiClient';
import * as speakeasy from 'speakeasy';
import {
  MFAConfig,
  TOTPConfig,
  EmailOTPConfig,
  MFAChallenge,
  MFAChallengeResponse,
  MFAVerificationRequest,
  MFAStatus,
  BackupCodes,
  MFAMethodType,
  MFAEnrollmentResponse,
  MFAError,
  MFAErrorType,
} from '../types/mfa';

export class MFAService {
  /**
   * Get MFA status for current user
   */
  static async getMFAStatus(): Promise<MFAStatus> {
    try {
      const response = await ApiClient.get<MFAStatus>('/auth/mfa/status');

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to get MFA status');
    } catch (error: any) {
      throw this.handleMFAError(error);
    }
  }

  /**
   * Enroll in Email OTP
   */
  static async enrollEmailOTP(email: string): Promise<EmailOTPConfig> {
    try {
      const response = await ApiClient.post<EmailOTPConfig>(
        '/auth/mfa/enroll/email-otp',
        { email }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to enroll in email OTP');
    } catch (error: any) {
      throw this.handleMFAError(error);
    }
  }

  /**
   * Enroll in TOTP (Authenticator App)
   * Returns secret and QR code for scanning
   */
  static async enrollTOTP(): Promise<MFAEnrollmentResponse> {
    try {
      const response = await ApiClient.post<any>('/auth/mfa/enroll/totp', {});

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to enroll in TOTP');
    } catch (error: any) {
      throw this.handleMFAError(error);
    }
  }

  /**
   * Generate TOTP secret locally for preview
   * Returns secret and otpauth_url for QR code generation
   */
  static generateTOTPSecret(name: string, issuer: string = 'FinCA-MM'): any {
    try {
      const secret = speakeasy.generateSecret({
        name: `${issuer} (${name})`,
        issuer,
        length: 32,
      });

      return {
        secret: secret.base32,
        otpauth_url: secret.otpauth_url,
      };
    } catch (error) {
      console.error('[MFAService] Failed to generate TOTP secret:', error);
      throw new Error('Failed to generate TOTP secret');
    }
  }

  /**
   * Verify TOTP code locally
   * Useful for client-side validation before sending to backend
   */
  static verifyTOTPCode(secret: string, code: string, window: number = 2): boolean {
    try {
      const result = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: code,
        window,
      });
      return result === true;
    } catch (error) {
      console.error('[MFAService] Failed to verify TOTP code:', error);
      return false;
    }
  }

  /**
   * Verify TOTP code locally
   * Returns remaining time in seconds
   */
  static getTOTPTimeRemaining(): number {
    // TOTP uses 30-second windows
    const now = Date.now();
    const window = Math.floor((now / 1000) % 30);
    return 30 - window;
  }

  /**
   * Verify MFA enrollment
   */
  static async verifyMFAEnrollment(
    method: MFAMethodType,
    code: string
  ): Promise<void> {
    try {
      const response = await ApiClient.post('/auth/mfa/verify-enrollment', {
        method,
        code,
      });

      if (!response.data.success) {
        throw new Error('Failed to verify MFA enrollment');
      }
    } catch (error: any) {
      throw this.handleMFAError(error);
    }
  }

  /**
   * Request MFA challenge (for login flow)
   */
  static async requestMFAChallenge(): Promise<MFAChallengeResponse> {
    try {
      const response = await ApiClient.post<MFAChallengeResponse>(
        '/auth/mfa/challenge',
        {}
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to request MFA challenge');
    } catch (error: any) {
      throw this.handleMFAError(error);
    }
  }

  /**
   * Verify MFA challenge
   */
  static async verifyMFAChallenge(
    request: MFAVerificationRequest
  ): Promise<any> {
    try {
      const response = await ApiClient.post<any>('/auth/mfa/verify-challenge', {
        challengeId: request.challengeId,
        code: request.code,
        rememberDevice: request.rememberDevice,
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to verify MFA challenge');
    } catch (error: any) {
      throw this.handleMFAError(error);
    }
  }

  /**
   * Disable MFA method
   */
  static async disableMFA(method: MFAMethodType, password: string): Promise<void> {
    try {
      const response = await ApiClient.post(
        '/auth/mfa/disable',
        { method, password }
      );

      if (!response.data.success) {
        throw new Error('Failed to disable MFA');
      }
    } catch (error: any) {
      throw this.handleMFAError(error);
    }
  }

  /**
   * Generate backup codes
   * OWASP: Provide backup codes for account recovery
   */
  static async generateBackupCodes(): Promise<BackupCodes> {
    try {
      const response = await ApiClient.post<BackupCodes>(
        '/auth/mfa/backup-codes/generate',
        {}
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to generate backup codes');
    } catch (error: any) {
      throw this.handleMFAError(error);
    }
  }

  /**
   * Get backup codes
   */
  static async getBackupCodes(): Promise<BackupCodes> {
    try {
      const response = await ApiClient.get<BackupCodes>(
        '/auth/mfa/backup-codes'
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to get backup codes');
    } catch (error: any) {
      throw this.handleMFAError(error);
    }
  }

  /**
   * Verify backup code
   */
  static async verifyBackupCode(code: string): Promise<void> {
    try {
      const response = await ApiClient.post('/auth/mfa/backup-codes/verify', {
        code,
      });

      if (!response.data.success) {
        throw new Error('Invalid backup code');
      }
    } catch (error: any) {
      throw this.handleMFAError(error);
    }
  }

  /**
   * Update primary MFA method
   */
  static async updatePrimaryMFAMethod(
    method: MFAMethodType
  ): Promise<void> {
    try {
      const response = await ApiClient.put(
        '/auth/mfa/primary-method',
        { method }
      );

      if (!response.data.success) {
        throw new Error('Failed to update primary MFA method');
      }
    } catch (error: any) {
      throw this.handleMFAError(error);
    }
  }

  /**
   * OWASP: Generate secure OTP code locally
   * For testing purposes only - in production, OTPs are sent via email/SMS
   */
  static generateOTPCode(length: number = 6): string {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += digits.charAt(Math.floor(Math.random() * 10));
    }
    return code;
  }

  /**
   * Validate OTP code format
   */
  static isValidOTPCode(code: string, expectedLength: number = 6): boolean {
    const regex = new RegExp(`^\\d{${expectedLength}}$`);
    return regex.test(code);
  }

  /**
   * Get MFA enrollment status
   */
  static async getMFAEnrollmentStatus(method: MFAMethodType): Promise<boolean> {
    try {
      const status = await this.getMFAStatus();
      return status.methods.some((m) => m.method === method && m.isVerified);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get list of enrolled MFA methods
   */
  static async getEnrolledMFAMethods(): Promise<MFAMethodType[]> {
    try {
      const status = await this.getMFAStatus();
      return status.methods
        .filter((m) => m.isVerified)
        .map((m) => m.method);
    } catch (error) {
      return [];
    }
  }

  /**
   * OWASP: Format masked email for display
   */
  static maskEmail(email: string): string {
    const [name, domain] = email.split('@');
    if (!name || name.length < 2) {
      return email;
    }
    return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
  }

  /**
   * Handle MFA errors
   */
  private static handleMFAError(error: any): MFAError {
    if (error.statusCode) {
      switch (error.statusCode) {
        case 400:
          if (error.code === 'INVALID_CODE') {
            return {
              type: MFAErrorType.INVALID_CODE,
              message: 'Invalid verification code',
              remainingAttempts: error.remainingAttempts,
            };
          }
          if (error.code === 'CODE_EXPIRED') {
            return {
              type: MFAErrorType.CODE_EXPIRED,
              message: 'Verification code has expired',
            };
          }
          break;
        case 429:
          return {
            type: MFAErrorType.TOO_MANY_ATTEMPTS,
            message: 'Too many failed attempts. Please try again later.',
            remainingAttempts: 0,
          };
        case 404:
          return {
            type: MFAErrorType.MFA_NOT_ENROLLED,
            message: 'MFA method not enrolled',
          };
      }
    }

    return {
      type: MFAErrorType.UNKNOWN_ERROR,
      message: error.message || 'MFA operation failed',
    };
  }
}

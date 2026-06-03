/**
 * Custom Hooks
 * Reusable hooks for authentication, biometric auth, and MFA
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../services/AuthContext';
import {
  BiometricAuthResult,
  BiometricCapabilities,
  BiometricType,
  BiometricAuthRequest,
} from '../types/api';
import {
  MFAStatus,
  MFAMethodType,
  MFAChallengeResponse,
  MFAVerificationRequest,
} from '../types/mfa';
import { BiometricAuthService } from '../services/BiometricAuthService';
import { MFAService } from '../services/MFAService';
import { AuthService } from '../services/AuthService';

/**
 * Hook for biometric authentication
 */
export const useBiometricAuth = () => {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  // Get biometric capabilities on mount
  useEffect(() => {
    const getCapabilities = async () => {
      try {
        const caps = await BiometricAuthService.getCapabilities();
        setCapabilities(caps);
      } catch (err: any) {
        setError(err.message);
      }
    };

    getCapabilities();
  }, []);

  /**
   * Authenticate with biometrics
   */
  const authenticate = useCallback(
    async (
      email: string,
      password: string,
      request?: BiometricAuthRequest
    ): Promise<BiometricAuthResult> => {
      try {
        setError(null);
        setIsLoading(true);

        // First authenticate with biometrics
        const bioResult = await BiometricAuthService.authenticate(request);

        if (!bioResult.success) {
          throw bioResult.error;
        }

        // Then login with credentials
        await login(email, password);

        return bioResult;
      } catch (err: any) {
        const errorMessage = err.message || 'Biometric authentication failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  /**
   * Enable biometric auth
   */
  const enableBiometric = useCallback(
    async (userId: string, password: string) => {
      try {
        setError(null);
        setIsLoading(true);

        await BiometricAuthService.enableBiometric(userId, password);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to enable biometric auth';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Disable biometric auth
   */
  const disableBiometric = useCallback(async (userId: string) => {
    try {
      setError(null);
      setIsLoading(true);

      await BiometricAuthService.disableBiometric(userId);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to disable biometric auth';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    capabilities,
    isLoading,
    error,
    authenticate,
    enableBiometric,
    disableBiometric,
  };
};

/**
 * Hook for MFA management
 */
export const useMFA = () => {
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null);
  const [challenge, setChallenge] = useState<MFAChallengeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch MFA status
   */
  const fetchMFAStatus = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const status = await MFAService.getMFAStatus();
      setMfaStatus(status);
      return status;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch MFA status';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Enroll in TOTP
   */
  const enrollTOTP = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const enrollment = await MFAService.enrollTOTP();
      return enrollment;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to enroll TOTP';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Enroll in Email OTP
   */
  const enrollEmailOTP = useCallback(async (email: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const enrollment = await MFAService.enrollEmailOTP(email);
      return enrollment;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to enroll Email OTP';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verify MFA enrollment
   */
  const verifyEnrollment = useCallback(async (method: MFAMethodType, code: string) => {
    try {
      setError(null);
      setIsLoading(true);

      await MFAService.verifyMFAEnrollment(method, code);

      // Refresh MFA status
      await fetchMFAStatus();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to verify MFA enrollment';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMFAStatus]);

  /**
   * Request MFA challenge for login
   */
  const requestChallenge = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const mfaChallenge = await MFAService.requestMFAChallenge();
      setChallenge(mfaChallenge);
      return mfaChallenge;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to request MFA challenge';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verify MFA challenge
   */
  const verifyChallenge = useCallback(
    async (request: MFAVerificationRequest) => {
      try {
        setError(null);
        setIsLoading(true);

        const result = await MFAService.verifyMFAChallenge(request);
        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to verify MFA challenge';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Disable MFA method
   */
  const disableMFA = useCallback(async (method: MFAMethodType, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      await MFAService.disableMFA(method, password);

      // Refresh MFA status
      await fetchMFAStatus();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to disable MFA';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMFAStatus]);

  /**
   * Generate backup codes
   */
  const generateBackupCodes = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const backupCodes = await MFAService.generateBackupCodes();
      return backupCodes;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate backup codes';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mfaStatus,
    challenge,
    isLoading,
    error,
    fetchMFAStatus,
    enrollTOTP,
    enrollEmailOTP,
    verifyEnrollment,
    requestChallenge,
    verifyChallenge,
    disableMFA,
    generateBackupCodes,
  };
};

/**
 * Hook for password validation
 */
export const usePasswordValidation = () => {
  const [password, setPassword] = useState('');
  const [validation, setValidation] = useState<{
    isValid: boolean;
    errors: string[];
  }>({ isValid: false, errors: [] });

  /**
   * Validate password strength
   */
  const validate = useCallback((pwd: string) => {
    setPassword(pwd);
    const result = AuthService.validatePasswordStrength(pwd);
    setValidation(result);
    return result;
  }, []);

  return {
    password,
    validation,
    validate,
  };
};

/**
 * Hook for session timeout
 */
export const useSessionTimeout = (timeoutMinutes: number = 15) => {
  const { logout } = useAuth();
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      setLastActivity(Date.now());

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        logout();
      }, timeoutMinutes * 60 * 1000);
    };

    // Listen to user activity
    const handleActivity = () => {
      resetTimeout();
    };

    // You would attach these to global event listeners
    // For React Native, you might use AppState or react-native-events

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutMinutes, logout]);

  return { lastActivity };
};

/**
 * Hook for form validation
 */
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  onValidate: (values: T) => Record<string, string>
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      const newValues = { ...values, [field]: value };
      setValues(newValues);

      // Validate on change if field was touched
      if (touched[field as string]) {
        const newErrors = onValidate(newValues);
        setErrors(newErrors);
      }
    },
    [values, touched, onValidate]
  );

  const handleBlur = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    const newErrors = onValidate(values);
    setErrors(newErrors);
  }, [values, onValidate]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    resetForm,
    setValues,
  };
};

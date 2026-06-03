# OWASP Mobile Security Best Practices

This document outlines how the FinCA-MM application implements OWASP Mobile Top 10 security recommendations.

## OWASP Mobile Top 10

### 1. Improper Platform Usage

**Risk**: Misuse of platform features, data exposure

**Implementation**:
- ✓ Use secure storage (`expo-secure-store`) for tokens
- ✓ Proper permission handling in manifest
- ✓ Don't expose sensitive data in logs
- ✓ Use HTTPS only for network communication

```typescript
// Good: Use secure store for tokens
import * as SecureStore from 'expo-secure-store';
await SecureStore.setItemAsync('token', accessToken);

// Bad: Don't do this (tokens saved to AsyncStorage)
// AsyncStorage.setItem('token', accessToken);
```

### 2. Insecure Data Storage

**Risk**: Sensitive data exposed on device

**Implementation**:
- ✓ Tokens stored in `expo-secure-store` (encrypted)
- ✓ User sensitive data never stored locally
- ✓ No plaintext API keys or secrets in code
- ✓ Implement certificate pinning for critical endpoints

```typescript
// SecureTokenService handles all token storage
static async saveTokens(tokenStore: TokenStore): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokenStore.accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokenStore.refreshToken);
}
```

### 3. Insecure Communication

**Risk**: Data interception during transmission

**Implementation**:
- ✓ HTTPS only (enforced in production)
- ✓ Certificate pinning (optional, highly recommended)
- ✓ No hardcoded IP addresses in production
- ✓ Security headers added to requests

```typescript
// ApiClient adds security headers to all requests
config.headers['X-Content-Type-Options'] = 'nosniff';
config.headers['X-Frame-Options'] = 'DENY';
config.headers['X-XSS-Protection'] = '1; mode=block';
```

### 4. Insecure Authentication

**Risk**: Weak user authentication, session hijacking

**Implementation**:
- ✓ JWT-based authentication with refresh tokens
- ✓ Password strength validation (8+ chars, mixed case, numbers, special chars)
- ✓ Biometric authentication support
- ✓ Session timeout (15 minutes default)
- ✓ Token rotation on refresh

```typescript
// Password validation
static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  // Enforces 8+ chars, uppercase, lowercase, digit, special char
}

// Automatic token refresh with buffer time
const isExpired = await SecureTokenService.isTokenExpiry(60); // 60 sec buffer
```

### 5. Insufficient Cryptography

**Risk**: Weak encryption, hardcoded keys

**Implementation**:
- ✓ Use platform-provided encryption (`expo-secure-store`)
- ✓ Never hardcode encryption keys
- ✓ Use strong algorithms (HS256 or RS256 for JWT)
- ✓ Generate cryptographically secure random tokens

```typescript
// Don't do this: hardcoded keys
const KEY = 'my-secret-key-123'; // WRONG!

// Do this: use secure storage and platform encryption
await SecureStore.setItemAsync(TOKEN_KEY, token);
```

### 6. Insecure Authorization

**Risk**: Users access resources they shouldn't

**Implementation**:
- ✓ Role-based access control (RBAC)
- ✓ Protected routes based on user role
- ✓ Verify authorization on backend for all operations
- ✓ Don't trust client-side authorization alone

```typescript
// Protected routes
{isAuthenticated && user?.role === 'admin' ? (
  <AdminNavigator />
) : (
  <UserNavigator />
)}
```

### 7. Client Code Quality

**Risk**: Logic flaws, security bypasses

**Implementation**:
- ✓ TypeScript for type safety
- ✓ Input validation on all user inputs
- ✓ Secure error handling (no sensitive info in errors)
- ✓ Code obfuscation in production builds

```typescript
// Input validation example
static validatePaymentAmount(amount: number): boolean {
  // Minimum: $0.50, Maximum: $999,999.99
  return amount >= 50 && amount <= 99999999;
}
```

### 8. Code Tampering

**Risk**: Malicious modifications to app code

**Implementation**:
- ✓ Code signing for all builds
- ✓ Use EAS Build for managed builds
- ✓ Enable App Attestation (iOS DeviceCheck, Android Play Integrity)
- ✓ Code obfuscation in production

```bash
# Sign and build with EAS
eas build --platform ios --auto-submit
eas build --platform android
```

### 9. Reverse Engineering

**Risk**: Attackers extract app logic or credentials

**Implementation**:
- ✓ Code obfuscation with ProGuard (Android) and encryption (iOS)
- ✓ No sensitive strings in code
- ✓ Use environment variables for configuration
- ✓ Runtime checks for rooted/jailbroken devices

```typescript
// Check for jailbreak/root (third-party library recommended)
// import { isJailbroken } from 'react-native-jailbreak-monkey';
// if (await isJailbroken()) { logout(); }
```

### 10. Extraneous Functionality

**Risk**: Debug features or backdoors left in production

**Implementation**:
- ✓ No debug logs with sensitive data in production
- ✓ No test accounts or credentials in production
- ✓ Remove all console.log statements from production builds
- ✓ Disable React Native debugger in production

```typescript
// Conditional logging
if (process.env.NODE_ENV === 'development') {
  console.log('[DEBUG]', message);
}
```

## Security Hardening Checklist

### Before Each Build

- [ ] No hardcoded secrets in code
- [ ] All tokens use secure storage
- [ ] HTTPS configured for production
- [ ] Error messages are generic (don't leak info)
- [ ] All inputs are validated
- [ ] Rate limiting configured on backend
- [ ] CORS properly configured
- [ ] Environment variables set correctly

### Authentication Security

- [ ] Password requirements enforced (min 8 chars, complexity)
- [ ] JWT tokens include exp and iat claims
- [ ] Refresh tokens stored securely
- [ ] Automatic token refresh implemented
- [ ] Session timeout enforced
- [ ] Logout clears all tokens
- [ ] Password reset uses secure tokens

### API Security

- [ ] HTTPS only in production
- [ ] SSL/TLS certificate valid
- [ ] Certificate pinning implemented (optional)
- [ ] Request signing implemented
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] Output sanitization enabled

### Storage Security

- [ ] No sensitive data in AsyncStorage
- [ ] Tokens use expo-secure-store
- [ ] User cache cleared on logout
- [ ] No plaintext passwords anywhere
- [ ] Sensitive data encrypted at rest (if applicable)

### Build Security

- [ ] Code obfuscation enabled
- [ ] ProGuard configured (Android)
- [ ] Bitcode enabled (iOS)
- [ ] Debug symbols removed
- [ ] No test data in production build
- [ ] App signed with production certificate

### Testing Security

- [ ] Security testing completed
- [ ] Penetration testing performed
- [ ] OWASP Mobile Top 10 review completed
- [ ] Code review for security issues
- [ ] Dependency scanning for vulnerabilities
- [ ] No hardcoded credentials in tests

## Secure Development Practices

### 1. Input Validation

Always validate user input:

```typescript
// Email validation
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Payment amount validation
const validateAmount = (amount: number): boolean => {
  return amount >= 50 && amount <= 99999999;
};
```

### 2. Output Encoding

Always encode sensitive output:

```typescript
// Don't expose internal errors
try {
  // operation
} catch (error) {
  // Generic message to user
  return 'An error occurred. Please try again.';
  // Log detailed error on backend only
}
```

### 3. Secure Comparisons

Use constant-time comparisons for sensitive data:

```typescript
// Don't use == for security comparisons
// if (code == userCode) // WRONG - timing attacks possible

// Use constant-time comparison
import crypto from 'crypto';
crypto.timingSafeEqual(Buffer.from(code), Buffer.from(userCode));
```

### 4. Dependency Management

Keep dependencies updated:

```bash
# Check for vulnerabilities
npm audit

# Update packages safely
npm update
npm audit fix
```

### 5. Code Review

Security-focused code review checklist:
- [ ] No hardcoded secrets
- [ ] Proper error handling
- [ ] Input validation present
- [ ] Authentication/authorization correct
- [ ] No timing attacks possible
- [ ] Secure random generation used
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities (web)

## Incident Response

### If Tokens are Compromised

1. Revoke all tokens immediately
2. Force logout all users
3. Prompt password reset
4. Check for unauthorized access
5. Notify affected users
6. Audit access logs

```typescript
// Backend should implement
async function revokeAllUserTokens(userId: string) {
  await db.refreshTokens.deleteMany({ userId });
  await invalidateAllActiveSessions(userId);
}
```

### If API Key is Exposed

1. Rotate the key immediately
2. Revoke old key
3. Update all services using old key
4. Monitor for abuse
5. Audit recent access

## Additional Resources

- [OWASP Mobile Security](https://owasp.org/www-project-mobile-top-10/)
- [Stripe Security](https://stripe.com/docs/security)
- [Expo Security](https://docs.expo.dev/distribution/security/)
- [React Native Security](https://reactnative.dev/docs/security)
- [NIST Mobile Security Guidelines](https://csrc.nist.gov/publications/detail/sp/800-163/final)

## Security Contact

For security issues, please email: security@example.com

Do NOT open public issues for security vulnerabilities.

---

**Last Updated**: June 2024
**Version**: 1.0

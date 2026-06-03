# Backend API Contract Documentation

This document specifies all required backend API endpoints for the React Native Expo application.

## Base Configuration

- **BASE_URL**: `/api`
- **Authentication**: JWT Bearer Token in Authorization header
- **Content-Type**: `application/json`
- **Protocol**: HTTPS only in production
- **CORS**: Configured for app domains
- **Rate Limiting**: Enabled on all endpoints
- **Input Validation**: Required on all endpoints
- **Error Messages**: Sanitized to prevent information leakage

---

## Authentication Endpoints

### POST /auth/login

Login user with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": false
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "emailVerified": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Error:** `401 Unauthorized`
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "statusCode": 401
  }
}
```

**Backend Implementation Notes:**
- Use bcrypt for password hashing (cost factor: 12+)
- Check if email exists first (prevent timing attacks)
- Compare hashes securely
- Generate JWT with HS256 or RS256
- Access token expiry: 15-60 minutes
- Refresh token expiry: 7-30 days
- Store refresh token hash in database (not plain text)
- Implement rate limiting: 5 failed attempts per 15 minutes

---

### POST /auth/register

Register new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "acceptTerms": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "emailVerified": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Error:** `409 Conflict`
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "Email already registered",
    "statusCode": 409
  }
}
```

**Backend Implementation Notes:**
- Validate password strength (min 8 chars, uppercase, lowercase, digit, special char)
- Check email format (RFC 5322)
- Send verification email immediately
- Store password hash, never plain text
- Create user in transaction
- Log registration for security auditing

---

### POST /auth/refresh-token

Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

**Error:** `401 Unauthorized`
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Refresh token is invalid or expired",
    "statusCode": 401
  }
}
```

**Backend Implementation Notes:**
- Verify refresh token signature and expiry
- Check if refresh token is in database (not revoked)
- Generate new access token
- Optionally rotate refresh token
- Update last activity timestamp
- Implement refresh token rotation every 7 days

---

### POST /auth/logout

Logout user - revoke refresh token.

**Headers:** `Authorization: Bearer <token>`

**Request:** `{}`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Backend Implementation Notes:**
- Mark refresh token as revoked in database
- Clear session if using sessions
- Log logout event for security

---

### POST /auth/password-reset/request

Request password reset.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK` (always, don't leak if email exists)
```json
{
  "success": true,
  "message": "If email exists, reset link sent"
}
```

**Backend Implementation Notes:**
- Don't reveal if email exists
- Generate secure token (random, min 32 bytes)
- Token expiry: 1 hour
- Send reset link via email
- Store token hash in database
- Hash with bcrypt or similar (never plain text)
- Log password reset requests for security

---

### POST /auth/password-reset/confirm

Confirm password reset with token.

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error:** `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Reset token is invalid or expired",
    "statusCode": 400
  }
}
```

**Backend Implementation Notes:**
- Verify token signature and expiry
- Check if token has been used already
- Hash new password with bcrypt
- Mark token as used/revoked
- Invalidate all existing sessions/refresh tokens
- Send notification email about password change
- Log password change for security audit

---

### POST /auth/verify-email

Verify email address.

**Request:**
```json
{
  "token": "email-verification-token"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Backend Implementation Notes:**
- Verify token signature and expiry
- Update user.emailVerified = true
- Mark token as used
- Token expiry: 24 hours

---

### GET /auth/profile

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### PUT /auth/profile

Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "New Name",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "New Name",
    "avatar": "https://example.com/avatar.jpg",
    "role": "user",
    "emailVerified": true,
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Backend Implementation Notes:**
- Validate input length
- Don't allow email change here (separate endpoint)
- Validate avatar URL
- Update updatedAt timestamp

---

## MFA Endpoints

### GET /auth/mfa/status

Get MFA status.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "methods": [
      {
        "id": "uuid",
        "userId": "uuid",
        "method": "totp",
        "isEnabled": true,
        "isVerified": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "primaryMethod": "totp",
    "backupCodesRemaining": 8,
    "enrolledAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### POST /auth/mfa/enroll/totp

Initiate TOTP enrollment.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "otpauth_url": "otpauth://totp/app...",
    "qrCode": "data:image/png;base64,..."
  }
}
```

**Backend Implementation Notes:**
- Generate secret using speakeasy or similar
- Return base32 encoded secret
- Return otpauth_url for QR code generation
- Don't enable until verified

---

### POST /auth/mfa/verify-enrollment

Verify MFA enrollment with code.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "method": "totp",
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "backupCodes": ["CODE1", "CODE2", "CODE3", "CODE4", "CODE5"]
  }
}
```

**Backend Implementation Notes:**
- Verify TOTP code with time window of ±1 minute
- Generate backup codes (10 codes, 8 characters each)
- Store backup codes hash
- Mark MFA as verified
- Send notification email

---

### POST /auth/mfa/challenge

Request MFA challenge for login.

**Headers:** `Authorization: Bearer <temporary_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "challengeId": "uuid",
    "method": "totp",
    "expiresIn": 300
  }
}
```

**Backend Implementation Notes:**
- Create challenge record in database
- Expiry: 5 minutes
- Track failed attempts
- Return different message if MFA not enrolled

---

### POST /auth/mfa/verify-challenge

Verify MFA challenge.

**Headers:** `Authorization: Bearer <temporary_token>`

**Request:**
```json
{
  "challengeId": "uuid",
  "code": "123456",
  "rememberDevice": false
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "mfaVerified": true,
    "deviceBindingToken": "token"
  }
}
```

**Backend Implementation Notes:**
- Verify TOTP code
- Check if challenge exists and not expired
- Mark challenge as verified
- If rememberDevice=true, create device binding
- Return device binding token for future skips
- Track attempt for rate limiting

---

## Payment Endpoints

### POST /payments/create-intent

Create Stripe PaymentIntent.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "amount": 5000,
  "currency": "USD",
  "description": "Studio booking",
  "metadata": {
    "bookingId": "uuid",
    "studioId": "123"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "pi_xxx",
    "clientSecret": "pi_xxx_secret_xxx",
    "amount": 5000,
    "currency": "USD",
    "status": "requires_payment_method",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Backend Implementation Notes:**
- Call Stripe API: https://api.stripe.com/v1/payment_intents
- Use Stripe secret key (never expose to frontend)
- Create transaction record in database
- Store PaymentIntent ID and clientSecret
- Set return_url for 3D Secure redirects
- Validate amount (min $0.50)
- Implement idempotency with idempotency_key

---

### POST /payments/confirm

Confirm payment.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "paymentIntentId": "pi_xxx",
  "paymentMethodId": "pm_xxx"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "status": "succeeded",
    "transactionId": "uuid"
  }
}
```

**Backend Implementation Notes:**
- Retrieve PaymentIntent from Stripe
- Verify payment is authorized by user
- Check amount matches transaction
- Update transaction status
- Handle webhooks separately for async updates
- Create receipt record

---

### GET /payments/transactions

Fetch transaction history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional, default: 20)
- `offset` (optional, default: 0)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "amount": 5000,
      "currency": "USD",
      "status": "succeeded",
      "paymentMethodId": "pm_xxx",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### GET /payments/receipts/:transactionId

Get receipt for transaction.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "transactionId": "uuid",
    "receiptNumber": "REC-12345",
    "amountCharged": 5000,
    "currency": "USD",
    "issuedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### GET /payments/receipts/:transactionId/download

Download receipt as PDF.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK` (application/pdf)
```
[Binary PDF data]
```

---

## Webhook Endpoints

### POST /webhooks/stripe

Stripe webhook for async payment updates.

**Headers:** `X-Stripe-Signature: <signature>`

**Events to handle:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `charge.refunded`

**Backend Implementation Notes:**
- Verify webhook signature
- Update transaction status based on event
- Send user notifications
- Log webhook events
- Implement idempotency (handle duplicate events)
- Return 200 OK immediately, process async

---

## Security Requirements

### Authentication
- All endpoints except `/auth/login`, `/auth/register`, `/auth/password-reset/*`, `/auth/verify-email` require Bearer token
- JWT signature algorithm: HS256 or RS256
- Access token expiry: 15-60 minutes
- Refresh token expiry: 7-30 days

### Password Security
- Minimum 8 characters
- Require uppercase letter
- Require lowercase letter
- Require number
- Require special character
- Hash with bcrypt (cost factor 12+)
- Never store plain text passwords

### Rate Limiting
- Login attempts: 5 failed per 15 minutes
- Password reset: 3 requests per hour
- MFA verification: 10 failed per 15 minutes
- General API: 100 requests per minute per user

### HTTPS
- Mandatory in production
- Certificate pinning recommended for mobile
- All HTTP requests redirect to HTTPS

### Data Protection
- Encrypt sensitive fields at rest (passwords, tokens, PII)
- Use HTTPS for all communication
- Implement CORS for app domains only
- Sanitize error messages to prevent information leakage

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "statusCode": 400
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| INVALID_CREDENTIALS | 401 | Email or password incorrect |
| EMAIL_ALREADY_EXISTS | 409 | Email already registered |
| USER_NOT_FOUND | 404 | User does not exist |
| INVALID_TOKEN | 401 | Token is invalid or expired |
| WEAK_PASSWORD | 400 | Password does not meet requirements |
| UNAUTHORIZED | 401 | User not authenticated |
| FORBIDDEN | 403 | User lacks permission |
| TOO_MANY_REQUESTS | 429 | Rate limit exceeded |

---

## Deployment Checklist

- [ ] HTTPS configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Error messages sanitized
- [ ] Database encryption at rest
- [ ] Tokens encrypted in storage
- [ ] CORS properly configured
- [ ] Stripe webhooks configured
- [ ] Email service configured
- [ ] Logging and monitoring setup
- [ ] Database backups configured
- [ ] Security headers added
- [ ] Authentication mechanisms tested
- [ ] Payment flow tested with Stripe test keys

---

**Last Updated:** June 2024
**Version:** 1.0

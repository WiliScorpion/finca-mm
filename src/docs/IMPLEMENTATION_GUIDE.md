# Production-Ready React Native Expo Security & Payments Guide

## Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Environment Variables](#environment-variables)
3. [Authentication Implementation](#authentication-implementation)
4. [Biometric Authentication](#biometric-authentication)
5. [Multi-Factor Authentication (MFA)](#multi-factor-authentication-mfa)
6. [Stripe Payments](#stripe-payments)
7. [OWASP Mobile Security](#owasp-mobile-security)
8. [Deployment Checklist](#deployment-checklist)

## Installation & Setup

### Step 1: Install Dependencies

```bash
cd finca-mm
npm install
```

All required packages are already in `package.json`:
- `@stripe/stripe-react-native` - Stripe payments
- `expo-secure-store` - Secure token storage
- `expo-local-authentication` - Biometric auth
- `speakeasy` - TOTP generation
- `jwt-decode` - JWT token parsing
- `axios` - HTTP client

### Step 2: Configure Expo Plugins

Update `app.json` to include Stripe plugin:

```json
{
  "plugins": [
    [
      "@stripe/stripe-react-native",
      {
        "merchantIdentifier": "your-merchant-id",
        "enableStripeSdk": true
      }
    ]
  ]
}
```

### Step 3: Set Up Environment Variables

Create `.env.local` (development) and `.env.production`:

```env
# API Configuration
REACT_APP_API_URL=https://api.example.com/api
REACT_APP_ENV=production

# Stripe (PUBLIC key only - never expose SECRET key to frontend)
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx

# Feature Flags
REACT_APP_ENABLE_MFA=true
REACT_APP_ENABLE_BIOMETRIC=true
```

**SECURITY WARNING**: Never commit `.env` files or expose secret keys in frontend code.

## Environment Variables

### Required Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://api.example.com/api` |
| `REACT_APP_STRIPE_PUBLIC_KEY` | Stripe public key | `pk_live_xxxxx` |
| `REACT_APP_ENV` | Environment | `production`, `staging`, `development` |

### Development Variables

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
REACT_APP_ENV=development
```

### Production Variables

```env
REACT_APP_API_URL=https://api.production.example.com/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
REACT_APP_ENV=production
```

## Authentication Implementation

### Basic Login Flow

```typescript
import { useAuth } from './services/AuthContext';

function LoginScreen() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      // Navigation handled by AuthContext
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <View>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <Button
        onPress={handleLogin}
        title={isLoading ? 'Logging in...' : 'Login'}
        disabled={isLoading}
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
```

### Protected Routes

```typescript
import { useAuth } from './services/AuthContext';

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AppNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
```

### Token Refresh Automatic

Tokens are automatically refreshed before expiration:
- Check happens every 5 minutes
- 5-minute buffer before actual expiration
- Transparent to user

## Biometric Authentication

### Enable Biometric Login

```typescript
import { useBiometricAuth } from './hooks';

function BiometricLoginScreen() {
  const { capabilities, authenticate, isLoading, error } = useBiometricAuth();

  useEffect(() => {
    // Check if biometric is available
    if (capabilities?.canAuthenticate) {
      console.log('Supported types:', capabilities.supportedTypes);
      // Show biometric button
    }
  }, [capabilities]);

  const handleBiometricAuth = async () => {
    try {
      const result = await authenticate(
        email,
        password,
        { reason: 'Authenticate to access your account' }
      );

      if (result.success) {
        console.log('Authenticated with:', result.biometricType);
        // Navigate to home
      }
    } catch (err) {
      console.error('Biometric auth failed:', err);
    }
  };

  return (
    <View>
      {capabilities?.canAuthenticate && (
        <Button
          onPress={handleBiometricAuth}
          title={`Login with ${capabilities.supportedTypes[0]}`}
          disabled={isLoading}
        />
      )}
    </View>
  );
}
```

### Device Requirements

- Face ID: iOS 11+, Android 7+
- Fingerprint: iOS 9+, Android 6+
- Device must have biometric hardware
- User must have enrolled biometrics

## Multi-Factor Authentication (MFA)

### Enroll in TOTP

```typescript
import { useMFA } from './hooks';
import QRCode from 'qrcode.react';

function MFAEnrollScreen() {
  const { enrollTOTP, verifyEnrollment, isLoading, error } = useMFA();
  const [totpSecret, setTotpSecret] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');

  const handleEnrollTOTP = async () => {
    try {
      const enrollment = await enrollTOTP();
      setTotpSecret(enrollment);
    } catch (err) {
      console.error('TOTP enrollment failed:', err);
    }
  };

  const handleVerifyCode = async () => {
    try {
      await verifyEnrollment('totp', verificationCode);
      // Show backup codes
    } catch (err) {
      console.error('Verification failed:', err);
    }
  };

  return (
    <View>
      {totpSecret && (
        <>
          <QRCode value={totpSecret.otpauth_url} />
          <Text>Scan with Authenticator app</Text>
          
          <TextInput
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="6-digit code"
            keyboardType="number-pad"
            maxLength={6}
          />
          <Button
            onPress={handleVerifyCode}
            title="Verify"
            disabled={isLoading}
          />
        </>
      )}
    </View>
  );
}
```

### Verify MFA During Login

```typescript
function MFAVerificationScreen() {
  const { requestChallenge, verifyChallenge, challenge, isLoading, error } = useMFA();
  const [code, setCode] = useState('');

  useEffect(() => {
    requestChallenge();
  }, []);

  const handleVerify = async () => {
    try {
      await verifyChallenge({
        challengeId: challenge?.challengeId,
        code,
        rememberDevice: true, // Save device for 30 days
      });
      // Navigate to home
    } catch (err) {
      console.error('MFA verification failed:', err);
    }
  };

  return (
    <View>
      <Text>Enter code from your authenticator app or email</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="6-digit code"
        keyboardType="number-pad"
        maxLength={6}
      />
      <Button
        onPress={handleVerify}
        title="Verify"
        disabled={isLoading}
      />
    </View>
  );
}
```

## Stripe Payments

### Initialize Stripe Provider

In your `App.tsx`:

```typescript
import { StripeProvider } from '@stripe/stripe-react-native';
import { PaymentProvider } from './services/PaymentContext';

export default function App() {
  return (
    <StripeProvider
      publishableKey={process.env.REACT_APP_STRIPE_PUBLIC_KEY!}
      stripeAccountId={process.env.REACT_APP_STRIPE_ACCOUNT_ID}
    >
      <AuthProvider>
        <PaymentProvider>
          <RootNavigator />
        </PaymentProvider>
      </AuthProvider>
    </StripeProvider>
  );
}
```

### Payment Flow

```typescript
import { usePayment } from './services/PaymentContext';
import { StripePaymentService } from './services/StripePaymentService';

function PaymentScreen() {
  const { createPaymentIntent, confirmPayment, isLoading, error } = usePayment();

  const handlePayment = async (amount: number) => {
    try {
      // 1. Create payment intent on backend
      const intent = await createPaymentIntent(
        amount * 100, // Convert to cents
        'USD',
        { bookingId: 'booking-123' }
      );

      // 2. Present Stripe payment sheet
      const { error } = await presentPaymentSheet({
        clientSecret: intent.clientSecret,
      });

      if (!error) {
        // 3. Confirm payment
        await confirmPayment(intent.clientSecret);
        Alert.alert('Success', 'Payment completed');
      }
    } catch (err) {
      Alert.alert('Error', error?.message || 'Payment failed');
    }
  };

  return (
    <Button
      onPress={() => handlePayment(50)}
      title="Pay $50"
      disabled={isLoading}
    />
  );
}
```

## OWASP Mobile Security

### Security Checklist

✓ **Token Storage**
- Tokens stored in `expo-secure-store` (not AsyncStorage)
- Never log tokens
- Clear tokens on logout
- Implement token rotation

✓ **Input Validation**
- Validate all user inputs
- Sanitize strings before storage
- Validate payment amounts (min/max)

✓ **Error Handling**
- Don't expose sensitive information in errors
- Use generic messages for users
- Log detailed errors server-side only

✓ **HTTPS Only**
- All API calls use HTTPS in production
- Enable certificate pinning for critical endpoints
- Disable HTTP debugging in production

✓ **Code Obfuscation**
- Use ProGuard/R8 for Android
- Enable code obfuscation in production builds

✓ **Secret Management**
- Never commit `.env` files
- Use CI/CD for environment variable injection
- Rotate secrets regularly

### Secure API Configuration

```typescript
// src/services/ApiClient.ts is already configured with:
// - Request/response interceptors
// - Automatic token refresh
// - Error handling
// - Security headers
// - Rate limiting support
```

### Validate User Input

```typescript
import { usePasswordValidation } from './hooks';

function PasswordInput() {
  const { password, validation, validate } = usePasswordValidation();

  return (
    <View>
      <TextInput
        value={password}
        onChangeText={validate}
        secureTextEntry
        placeholder="Enter password"
      />
      {!validation.isValid && (
        <View>
          {validation.errors.map((error) => (
            <Text key={error} style={{ color: 'red' }}>
              • {error}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
```

### Certificate Pinning (Optional)

For maximum security, implement certificate pinning:

```typescript
// In ApiClient.ts, you can add certificate pinning:
// import { CertificatePinning } from 'react-native-certificate-pinning';

// const instance = axios.create({...});
// Configure certificate pinning for Stripe and your API
```

## Deployment Checklist

### Pre-Production Testing

- [ ] Test all authentication flows
- [ ] Test biometric authentication on real devices
- [ ] Test MFA enrollment and verification
- [ ] Test payment flow with Stripe test keys
- [ ] Test token refresh
- [ ] Test session timeout
- [ ] Test offline error handling
- [ ] Test security headers

### Backend Requirements

Before deploying frontend, ensure backend implements:

- [ ] All endpoints in `BACKEND_API_CONTRACT.ts`
- [ ] Password hashing with bcrypt (cost 12+)
- [ ] JWT token management
- [ ] Refresh token rotation
- [ ] Rate limiting
- [ ] HTTPS with valid certificates
- [ ] CORS configuration
- [ ] Input validation
- [ ] Stripe integration
- [ ] Webhook signing

### iOS Deployment

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

Update `app.json`:
```json
{
  "ios": {
    "bundleIdentifier": "com.yourcompany.finca-mm",
    "infoPlist": {
      "NSFaceIDUsageDescription": "Authenticate to your account",
      "NSLocalNetworkUsageDescription": "...",
      "NSBonjourServiceTypes": ["_http._tcp"]
    }
  }
}
```

### Android Deployment

```bash
eas build --platform android --profile production
eas submit --platform android
```

Update `app.json`:
```json
{
  "android": {
    "package": "com.yourcompany.fincamm",
    "permissions": ["USE_BIOMETRIC", "USE_FINGERPRINT"],
    "googleServicesFile": "./google-services.json"
  }
}
```

### Environment Variables in Production

Use Eas secrets:

```bash
eas secret:create --scope project --name REACT_APP_STRIPE_PUBLIC_KEY
eas secret:create --scope project --name REACT_APP_API_URL
```

Reference in `eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "REACT_APP_STRIPE_PUBLIC_KEY": "@REACT_APP_STRIPE_PUBLIC_KEY",
        "REACT_APP_API_URL": "@REACT_APP_API_URL"
      }
    }
  }
}
```

## Further Security Hardening

### 1. Add Certificate Pinning

```typescript
// For production, implement certificate pinning for Stripe and your API
import { CertificatePinning } from 'react-native-certificate-pinning';
```

### 2. Implement Device Binding

Store device ID and verify during login for additional security layer

### 3. Enable App Attestation

- iOS: Use DeviceCheck framework
- Android: Use Play Integrity API

### 4. Implement Rate Limiting

Already configured in backend API contract

### 5. Add Security Monitoring

Track failed login attempts, suspicious activities, and alert user

## Support & Documentation

- [Stripe React Native Documentation](https://stripe.dev/docs/stripe-react-native)
- [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Expo Local Authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-top-10/)

---

**Last Updated**: June 2024
**Version**: 1.0

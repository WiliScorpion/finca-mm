# Quick Start Guide

## What's Been Implemented

Your React Native Expo application now includes a complete production-ready system with:

1. ✅ Secure JWT Authentication
2. ✅ Biometric Login (Face ID / Fingerprint)
3. ✅ Multi-Factor Authentication (MFA)
4. ✅ Stripe Payment Integration
5. ✅ Secure Token Storage
6. ✅ OWASP Mobile Security Hardening

## Installation

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Environment File
Create `.env.local` in your project root:

```env
# Development
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
REACT_APP_ENV=development
```

For production, update `.env.production`:
```env
REACT_APP_API_URL=https://api.production.com/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
REACT_APP_ENV=production
```

### Step 3: Update app.json
Add Stripe plugin to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": "your-merchant-id-here",
          "enableStripeSdk": true
        }
      ]
    ]
  }
}
```

### Step 4: Start Development
```bash
npm start           # Start Expo
npm run web         # Test in browser
npm run ios         # Build for iOS
npm run android     # Build for Android
```

## File Structure

### New Directories & Files

**Services** (`src/services/`):
- `ApiClient.ts` - Secure HTTP client
- `AuthService.ts` - Authentication logic
- `AuthContext.tsx` - Auth state management
- `SecureTokenService.ts` - Token storage
- `BiometricAuthService.ts` - Biometric auth
- `MFAService.ts` - MFA implementation
- `StripePaymentService.ts` - Payment handling
- `PaymentContext.tsx` - Payment state
- `index.ts` - Export all services

**Types** (`src/types/`):
- `auth.ts` - Authentication types
- `payment.ts` - Payment types
- `mfa.ts` - MFA types
- `api.ts` - API & biometric types
- `index.ts` - Export all types

**Hooks** (`src/hooks/`):
- `index.ts` - Custom React hooks

**Documentation** (`src/docs/`):
- `IMPLEMENTATION_GUIDE.md` - Complete guide
- `BACKEND_API_CONTRACT.ts` - API specs
- `SECURITY_BEST_PRACTICES.md` - Security guide

**Screens**:
- `LoginScreen.tsx` - Complete login implementation
- `PaymentScreen.tsx` - Payment examples

## Implementing the Backend

Your backend needs to implement these endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - Logout user
- `POST /auth/password-reset/request` - Request password reset
- `POST /auth/password-reset/confirm` - Confirm password reset
- `POST /auth/verify-email` - Verify email address
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### MFA
- `GET /auth/mfa/status` - Get MFA status
- `POST /auth/mfa/enroll/totp` - Start TOTP enrollment
- `POST /auth/mfa/verify-enrollment` - Verify TOTP enrollment
- `POST /auth/mfa/challenge` - Request MFA challenge
- `POST /auth/mfa/verify-challenge` - Verify MFA challenge

### Payments
- `POST /payments/create-intent` - Create Stripe PaymentIntent
- `POST /payments/confirm` - Confirm payment
- `GET /payments/transactions` - Get transaction history
- `GET /payments/receipts/:id` - Get receipt

See `src/docs/BACKEND_API_CONTRACT.ts` for complete specifications.

## Usage Examples

### Using Authentication
```typescript
import { useAuth } from './services/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      await login('email@example.com', 'Password123!');
      // Automatically navigated by AuthContext
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <>
      {isAuthenticated && <Text>Welcome {user?.name}</Text>}
      <Button onPress={handleLogin} title="Login" />
      <Button onPress={logout} title="Logout" />
    </>
  );
}
```

### Using Biometric Auth
```typescript
import { useBiometricAuth } from './hooks';

function MyComponent() {
  const { authenticate, capabilities, error } = useBiometricAuth();

  const handleBiometric = async () => {
    const result = await authenticate('email@example.com', 'password', {
      reason: 'Authenticate to continue'
    });
    if (result.success) {
      console.log('Authenticated with:', result.biometricType);
    }
  };

  if (capabilities?.canAuthenticate) {
    return (
      <Button 
        onPress={handleBiometric} 
        title={`Login with ${capabilities.supportedTypes[0]}`}
      />
    );
  }
  return null;
}
```

### Using MFA
```typescript
import { useMFA } from './hooks';

function MFAScreen() {
  const { enrollTOTP, verifyEnrollment, mfaStatus } = useMFA();

  const handleEnrollMFA = async () => {
    const enrollment = await enrollTOTP();
    // Show QR code to user
    // User scans with authenticator app
  };

  const handleVerifyCode = async (code: string) => {
    await verifyEnrollment('totp', code);
    // MFA is now enabled
  };

  return (
    <>
      <Button onPress={handleEnrollMFA} title="Enable Two-Factor Auth" />
      {mfaStatus?.enabled && <Text>MFA is enabled ✓</Text>}
    </>
  );
}
```

### Using Payments
```typescript
import { usePayment } from './services';

function PaymentScreen() {
  const { createPaymentIntent, confirmPayment, transactions } = usePayment();

  const handlePay = async (amount: number) => {
    // Create payment intent on backend
    const intent = await createPaymentIntent(
      amount * 100, // Convert to cents
      'USD',
      { bookingId: 'booking-123' }
    );

    // Confirm payment
    await confirmPayment(intent.clientSecret);
  };

  return (
    <>
      <Button onPress={() => handlePay(50)} title="Pay $50" />
      {transactions.map(tx => (
        <Text key={tx.id}>${tx.amount / 100} - {tx.status}</Text>
      ))}
    </>
  );
}
```

## Security Best Practices

1. **Never expose secrets** to frontend - keep in `.env` and backend
2. **Always use HTTPS** in production
3. **Validate all inputs** on both client and server
4. **Store tokens securely** using `expo-secure-store`
5. **Clear tokens on logout** - already handled
6. **Implement rate limiting** on backend
7. **Don't log sensitive data** like passwords or tokens
8. **Use strong passwords** - 8+ chars, mixed case, numbers, special chars
9. **Enable CORS** only for your domain
10. **Test security** before deployment

## Common Issues & Solutions

### "Module not found" errors
```bash
npm install --legacy-peer-deps
```

### Tokens not persisting
- Check that `expo-secure-store` has permission
- Test on physical device (not simulator)

### Biometric not working
- Ensure device has biometric hardware
- Test on physical device only
- User must enroll fingerprint/face first

### Stripe payments failing
- Verify Stripe public key is correct
- Check backend is creating PaymentIntent
- Use Stripe test keys for development
- Check amount is in cents (minimum 50¢)

### MFA codes not verifying
- Ensure server time is synchronized
- Check that secret is transmitted correctly
- Verify TOTP window is 30 seconds

## Next Steps

1. **Read Documentation**
   - `src/docs/IMPLEMENTATION_GUIDE.md` - Complete setup
   - `src/docs/SECURITY_BEST_PRACTICES.md` - Security guide
   - `src/docs/BACKEND_API_CONTRACT.ts` - API specs

2. **Implement Backend**
   - Create all API endpoints
   - Set up database schema
   - Configure Stripe webhooks

3. **Test Locally**
   ```bash
   npm start
   npm run web
   # Test all auth flows
   # Test all payment flows
   # Test MFA flows
   ```

4. **Deploy to Production**
   ```bash
   eas build --platform ios --profile production
   eas build --platform android --profile production
   ```

5. **Monitor Security**
   - Check logs for unauthorized attempts
   - Monitor failed login attempts
   - Review transaction history

## File Locations Quick Reference

| Feature | Main File | Types | Hook |
|---------|-----------|-------|------|
| Authentication | `AuthService.ts` | `auth.ts` | `useAuth()` |
| Biometric | `BiometricAuthService.ts` | `api.ts` | `useBiometricAuth()` |
| MFA | `MFAService.ts` | `mfa.ts` | `useMFA()` |
| Payments | `StripePaymentService.ts` | `payment.ts` | `usePayment()` |
| API Client | `ApiClient.ts` | `api.ts` | N/A |
| Token Storage | `SecureTokenService.ts` | `auth.ts` | N/A |

## Support Resources

- **TypeScript Issues**: Check `src/types/` for type definitions
- **Service Issues**: Check `src/services/` for implementations
- **Hook Issues**: Check `src/hooks/index.ts` for custom hooks
- **Screen Examples**: Check `src/screens/LoginScreen.tsx` and `PaymentScreen.tsx`
- **Security**: Check `src/docs/SECURITY_BEST_PRACTICES.md`

## Version Information

- **Expo**: ~54.0.33
- **React**: 19.1.0
- **React Native**: 0.81.5
- **TypeScript**: ~5.9.2
- **Stripe**: Latest
- **Implementation**: June 2024

---

You're all set! Start by implementing the backend API endpoints, then test all the auth and payment flows locally. Good luck! 🚀

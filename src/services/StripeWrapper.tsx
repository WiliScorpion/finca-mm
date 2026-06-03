/**
 * Stripe Provider Wrapper
 * Only loaded on native platforms (iOS/Android)
 * On web, renders children directly
 */

import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

interface StripeWrapperProps {
  children: React.ReactNode;
}

export const StripeWrapper: React.FC<StripeWrapperProps> = ({ children }) => {
  return (
    <StripeProvider
      publishableKey={process.env.REACT_APP_STRIPE_PUBLIC_KEY || ''}
      stripeAccountId={process.env.REACT_APP_STRIPE_ACCOUNT_ID}
    >
      {children}
    </StripeProvider>
  );
};

/**
 * Stripe Provider Wrapper - WEB VERSION
 * On web, renders children directly without Stripe
 */

import React from 'react';

interface StripeWrapperProps {
  children: React.ReactNode;
}

export const StripeWrapper: React.FC<StripeWrapperProps> = ({ children }) => {
  return <>{children}</>;
};

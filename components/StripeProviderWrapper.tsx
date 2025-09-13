import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

interface StripeProviderWrapperProps {
  publishableKey: string;
  children: React.ReactNode;
}

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key_here';

export default function StripeProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      {children}
    </StripeProvider>
  );
}
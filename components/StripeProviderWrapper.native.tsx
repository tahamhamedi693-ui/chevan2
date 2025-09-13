import React from 'react';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key_here';

export default function StripeProviderWrapper({ children }: { children: React.ReactNode }) {
  const { StripeProvider } = require('@stripe/stripe-react-native');
  
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      {children}
    </StripeProvider>
  );
}
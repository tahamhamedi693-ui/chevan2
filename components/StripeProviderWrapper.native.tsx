import React from 'react';
import { Platform } from 'react-native';

// Only import Stripe on native platforms
let StripeProvider: any = null;
if (Platform.OS !== 'web') {
  StripeProvider = require('@stripe/stripe-react-native').StripeProvider;
}

interface StripeProviderWrapperProps {
  publishableKey: string;
  children: React.ReactNode;
}

export default function StripeProviderWrapper({ publishableKey, children }: StripeProviderWrapperProps) {
  // Prevent importing Stripe on web platform
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }

  return (
    <StripeProvider publishableKey={publishableKey}>
      {children}
    </StripeProvider>
  );
}
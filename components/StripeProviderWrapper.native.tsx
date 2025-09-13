import React from 'react';
import { Platform } from 'react-native';

interface StripeProviderWrapperProps {
  publishableKey: string;
  children: React.ReactNode;
}

export default function StripeProviderWrapper({ publishableKey, children }: StripeProviderWrapperProps) {
  // Prevent importing Stripe on web platform
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }

  // Dynamic import for native platforms only
  const { StripeProvider } = require('@stripe/stripe-react-native');
  
  return (
    <StripeProvider publishableKey={publishableKey}>
      {children}
    </StripeProvider>
  );
}
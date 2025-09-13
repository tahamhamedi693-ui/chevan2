import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

interface StripeProviderWrapperProps {
  publishableKey: string;
  children: React.ReactNode;
}

export default function StripeProviderWrapper({ publishableKey, children }: StripeProviderWrapperProps) {
  return (
    <StripeProvider publishableKey={publishableKey}>
      {children}
    </StripeProvider>
  );
}
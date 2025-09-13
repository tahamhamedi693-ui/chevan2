import React from 'react';

interface StripeProviderWrapperProps {
  publishableKey: string;
  children: React.ReactNode;
}

export default function StripeProviderWrapper({ publishableKey, children }: StripeProviderWrapperProps) {
  // No-op component for web platform - just renders children
  return <>{children}</>;
}
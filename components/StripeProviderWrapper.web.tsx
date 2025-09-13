import React from 'react';

export default function StripeProviderWrapper({ children }: { children: React.ReactNode }) {
  // No-op component for web platform - just renders children
  return <>{children}</>;
}
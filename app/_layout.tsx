import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { router, useNavigationContainerRef } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useState } from 'react';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key_here';

// No-op component for web platform
const NoOpProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export default function RootLayout() {
  useFrameworkReady();
  const { user, loading } = useAuth();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [StripeProviderComponent, setStripeProviderComponent] = useState<React.ComponentType<any> | null>(null);
  const navigationRef = useNavigationContainerRef();

  // Dynamically import StripeProvider only on native platforms
  useEffect(() => {
    if (Platform.OS === 'web') {
      setStripeProviderComponent(() => NoOpProvider);
    } else {
      import('@stripe/stripe-react-native')
        .then((stripeModule) => {
          setStripeProviderComponent(() => stripeModule.StripeProvider);
        })
        .catch(() => {
          // Fallback to no-op if import fails
          setStripeProviderComponent(() => NoOpProvider);
        });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', () => {
      setIsNavigationReady(true);
    });

    return unsubscribe;
  }, [navigationRef]);

  useEffect(() => {
    if (!loading && isNavigationReady) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [user, loading, isNavigationReady]);

  if (loading || !StripeProviderComponent) {
    return null;
  }

  const AppContent = () => (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );

  return (
    <StripeProviderComponent publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <AppContent />
    </StripeProviderComponent>
  );
}

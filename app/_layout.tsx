import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import { router, useNavigationContainerRef, useSegments } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useState } from 'react';

export default function RootLayout() {
  useFrameworkReady();
  const { user, loading } = useAuth();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const navigationRef = useNavigationContainerRef();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', () => {
      setIsNavigationReady(true);
    });

    return unsubscribe;
  }, [navigationRef]);

  useEffect(() => {
    if (loading) {
      console.log('Auth still loading...');
      return;
    }

    console.log('Auth state changed:', { hasUser: !!user, segments });
    
    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      console.log('No user, redirecting to login');
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      console.log('User authenticated, redirecting to main app');
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(driver)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

import { Stack } from 'expo-router';

export default function DriverLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="earnings" />
      <Stack.Screen name="trips" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
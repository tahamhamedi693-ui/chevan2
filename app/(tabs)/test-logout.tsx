import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';

export default function TestLogoutScreen() {
  const { user, signOut } = useAuth();

  const handleSimpleLogout = async () => {
    console.log('[TEST] Simple logout initiated');
    try {
      const result = await signOut();
      console.log('[TEST] SignOut result:', result);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('[TEST] Logout error:', error);
      router.replace('/(auth)/login');
    }
  };

  const handleLogoutWithAlert = () => {
    console.log('[TEST] Logout with alert initiated');
    Alert.alert(
      'Test Sign Out',
      'Testing logout functionality',
      [
        { 
          text: 'Cancel', 
          onPress: () => console.log('[TEST] Cancelled')
        },
        {
          text: 'Sign Out',
          onPress: handleSimpleLogout,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Logout Test Page</Text>
        <Text style={styles.info}>Current user: {user?.email || 'None'}</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSimpleLogout}
        >
          <Text style={styles.buttonText}>Direct Logout (No Alert)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.alertButton]} 
          onPress={handleLogoutWithAlert}
        >
          <Text style={styles.buttonText}>Logout with Alert</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
  },
  button: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  alertButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

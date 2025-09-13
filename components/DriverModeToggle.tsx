import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Car, User, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface DriverModeToggleProps {
  currentMode: 'passenger' | 'driver';
  onModeChange: (mode: 'passenger' | 'driver') => void;
}

export default function DriverModeToggle({ currentMode, onModeChange }: DriverModeToggleProps) {
  const { user } = useAuth();
  const [driverStatus, setDriverStatus] = useState<string>('none');

  useEffect(() => {
    checkDriverStatus();
  }, [user]);

  const checkDriverStatus = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('driver_status')
        .eq('user_id', user.id)
        .single();
      
      setDriverStatus(profile?.driver_status || 'none');
    } catch (error) {
      console.error('Error checking driver status:', error);
    }
  };

  const handleSwitchToDriver = () => {
    switch (driverStatus) {
      case 'none':
        Alert.alert(
          'Become a Driver',
          'You need to apply to become a driver first. Would you like to start the application process?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Apply Now',
              onPress: () => router.push('/(driver)/apply'),
            },
          ]
        );
        break;
      case 'applied':
        Alert.alert(
          'Application Pending',
          'Your driver application is being reviewed. Check your application status?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Check Status',
              onPress: () => router.push('/(driver)/application-status'),
            },
          ]
        );
        break;
      case 'approved':
      case 'active':
        Alert.alert(
          'Switch to Driver Mode',
          'You will be redirected to the driver dashboard. Continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Continue',
              onPress: () => {
                onModeChange('driver');
                router.push('/(driver)/dashboard');
              },
            },
          ]
        );
        break;
      case 'suspended':
        Alert.alert('Account Suspended', 'Your driver account has been suspended. Please contact support.');
        break;
      default:
        Alert.alert('Error', 'Unable to determine driver status. Please try again.');
    }
  };

  const handleSwitchToPassenger = () => {
    Alert.alert(
      'Switch to Passenger Mode',
      'You will be redirected to the passenger app. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            onModeChange('passenger');
            router.push('/(tabs)');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Switch Mode</Text>
      
      <View style={styles.modesContainer}>
        {/* Passenger Mode */}
        <TouchableOpacity
          style={[
            styles.modeCard,
            currentMode === 'passenger' && styles.activeModeCard,
          ]}
          onPress={currentMode === 'driver' ? handleSwitchToPassenger : undefined}
          disabled={currentMode === 'passenger'}
        >
          <View style={styles.modeContent}>
            <View style={[
              styles.modeIcon,
              { backgroundColor: currentMode === 'passenger' ? '#DBEAFE' : '#F3F4F6' }
            ]}>
              <User size={24} color={currentMode === 'passenger' ? '#3B82F6' : '#6B7280'} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[
                styles.modeTitle,
                currentMode === 'passenger' && styles.activeModeTitle,
              ]}>
                Passenger
              </Text>
              <Text style={styles.modeDescription}>Book and track rides</Text>
            </View>
            {currentMode === 'driver' && (
              <ArrowRight size={20} color="#6B7280" />
            )}
          </View>
          {currentMode === 'passenger' && (
            <View style={styles.activeIndicator}>
              <Text style={styles.activeText}>Current Mode</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Driver Mode */}
        <TouchableOpacity
          style={[
            styles.modeCard,
            currentMode === 'driver' && styles.activeModeCard,
          ]}
          onPress={currentMode === 'passenger' ? handleSwitchToDriver : undefined}
          disabled={currentMode === 'driver'}
        >
          <View style={styles.modeContent}>
            <View style={[
              styles.modeIcon,
              { backgroundColor: currentMode === 'driver' ? '#D1FAE5' : '#F3F4F6' }
            ]}>
              <Car size={24} color={currentMode === 'driver' ? '#10B981' : '#6B7280'} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[
                styles.modeTitle,
                currentMode === 'driver' && styles.activeModeTitle,
              ]}>
                Driver
              </Text>
              <Text style={styles.modeDescription}>Accept rides and earn money</Text>
            </View>
            {currentMode === 'passenger' && (
              <ArrowRight size={20} color="#6B7280" />
            )}
          </View>
          {currentMode === 'driver' && (
            <View style={styles.activeIndicator}>
              <Text style={styles.activeText}>Current Mode</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  modesContainer: {
    gap: 12,
  },
  modeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  activeModeCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#FEFEFE',
  },
  modeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  activeModeTitle: {
    color: '#3B82F6',
  },
  modeDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeIndicator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  activeText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
  },
});
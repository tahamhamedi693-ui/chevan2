import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Car, Users } from 'lucide-react-native';
import { UserType } from '@/types/database';

export default function UserTypeSelectionScreen() {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);

  const handleContinue = () => {
    if (!selectedType) {
      Alert.alert('Please Select', 'Please select whether you want to be a passenger or driver');
      return;
    }

    // Navigate to signup with the selected user type
    router.push({
      pathname: '/(auth)/signup',
      params: { userType: selectedType }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Join RideShare</Text>
          <Text style={styles.subtitle}>How would you like to use the app?</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === 'passenger' && styles.optionCardSelected
            ]}
            onPress={() => setSelectedType('passenger')}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              selectedType === 'passenger' && styles.iconContainerSelected
            ]}>
              <Users 
                size={40} 
                color={selectedType === 'passenger' ? '#FFFFFF' : '#3B82F6'} 
              />
            </View>
            <Text style={[
              styles.optionTitle,
              selectedType === 'passenger' && styles.optionTitleSelected
            ]}>
              Passenger
            </Text>
            <Text style={styles.optionDescription}>
              Book rides and travel to your destination
            </Text>
            {selectedType === 'passenger' && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === 'driver' && styles.optionCardSelected
            ]}
            onPress={() => setSelectedType('driver')}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              selectedType === 'driver' && styles.iconContainerSelected
            ]}>
              <Car 
                size={40} 
                color={selectedType === 'driver' ? '#FFFFFF' : '#3B82F6'} 
              />
            </View>
            <Text style={[
              styles.optionTitle,
              selectedType === 'driver' && styles.optionTitleSelected
            ]}>
              Driver
            </Text>
            <Text style={styles.optionDescription}>
              Earn money by giving rides to passengers
            </Text>
            {selectedType === 'driver' && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedType && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedType}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 32,
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  optionCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  iconContainerSelected: {
    backgroundColor: '#3B82F6',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  optionTitleSelected: {
    color: '#3B82F6',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  checkmark: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  continueButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});

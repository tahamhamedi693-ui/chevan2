import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Car, Star, Shield, Bell, Settings, CreditCard, FileText, CircleHelp as HelpCircle, LogOut, ChevronRight, CreditCard as Edit, Award, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function DriverProfile() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoAcceptEnabled, setAutoAcceptEnabled] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { user, signOut } = useAuth();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const driverStats = {
    rating: 4.8,
    totalTrips: 1247,
    totalEarnings: 15680.50,
    acceptanceRate: 92,
    completionRate: 98,
    yearsActive: 3,
  };

  const vehicleInfo = {
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    color: 'Silver',
    licensePlate: 'ABC 123',
    verified: true,
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Driver logout initiated');
              const result = await signOut();
              console.log('Driver logout completed', result);
              
              // Small delay to ensure state updates propagate
              setTimeout(() => {
                // Use push first then replace to ensure navigation happens
                router.push('/(auth)/login');
                setTimeout(() => {
                  router.replace('/(auth)/login');
                }, 100);
              }, 100);
            } catch (error) {
              console.error('Driver logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
              
              // Still try to navigate on error
              setTimeout(() => {
                router.push('/(auth)/login');
                setTimeout(() => {
                  router.replace('/(auth)/login');
                }, 100);
              }, 100);
            }
          },
        },
      ]
    );
  };

  const profileSettings = [
    {
      id: 'vehicle',
      icon: Car,
      label: 'Vehicle Information',
      value: `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`,
      onPress: () => Alert.alert('Vehicle Info', 'Manage your vehicle information'),
      color: '#3B82F6',
    },
    {
      id: 'documents',
      icon: FileText,
      label: 'Documents',
      value: 'All verified',
      onPress: () => Alert.alert('Documents', 'View and manage your documents'),
      color: '#10B981',
    },
    {
      id: 'earnings',
      icon: CreditCard,
      label: 'Earnings & Payments',
      value: 'Bank account linked',
      onPress: () => Alert.alert('Earnings', 'Manage your payment settings'),
      color: '#F59E0B',
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notifications',
      hasSwitch: true,
      switchValue: notificationsEnabled,
      onToggle: setNotificationsEnabled,
      color: '#8B5CF6',
    },
  ];

  const menuItems = [
    {
      id: 'auto-accept',
      icon: Settings,
      label: 'Auto-Accept Rides',
      hasSwitch: true,
      switchValue: autoAcceptEnabled,
      onToggle: setAutoAcceptEnabled,
      color: '#6B7280',
    },
    {
      id: 'safety',
      icon: Shield,
      label: 'Safety Center',
      onPress: () => Alert.alert('Safety', 'Access safety features and resources'),
      color: '#DC2626',
    },
    {
      id: 'help',
      icon: HelpCircle,
      label: 'Help & Support',
      onPress: () => Alert.alert('Help', 'Get help and support'),
      color: '#059669',
    },
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.hasSwitch}
    >
      <View style={[styles.settingIcon, { backgroundColor: `${item.color}15` }]}>
        <item.icon size={20} color={item.color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{item.label}</Text>
        {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
      </View>
      <View style={styles.settingRight}>
        {item.hasSwitch ? (
          <Switch
            value={item.switchValue}
            onValueChange={item.onToggle}
            trackColor={{ false: '#E5E7EB', true: '#DBEAFE' }}
            thumbColor={item.switchValue ? item.color : '#FFFFFF'}
          />
        ) : (
          <ChevronRight size={20} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Driver Profile</Text>
        <TouchableOpacity style={styles.editButton}>
          <Edit size={20} color="#6B7280" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Driver Card */}
        <Animated.View style={[styles.driverSection, { opacity: fadeAnim }]}>
          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <User size={32} color="#FFFFFF" />
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>John Smith</Text>
              <Text style={styles.driverEmail}>{user?.email}</Text>
              <View style={styles.driverBadges}>
                <View style={styles.verifiedBadge}>
                  <Shield size={12} color="#10B981" />
                  <Text style={styles.verifiedText}>Verified Driver</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Driver Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                <Star size={16} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{driverStats.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
                <Car size={16} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>{driverStats.totalTrips}</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                <Award size={16} color="#10B981" />
              </View>
              <Text style={styles.statValue}>{driverStats.yearsActive}y</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
          </View>
        </Animated.View>

        {/* Performance Metrics */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{driverStats.acceptanceRate}%</Text>
              <Text style={styles.metricLabel}>Acceptance Rate</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{driverStats.completionRate}%</Text>
              <Text style={styles.metricLabel}>Completion Rate</Text>
            </View>
          </View>
        </Animated.View>

        {/* Vehicle Information */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Vehicle</Text>
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <View style={styles.vehicleIcon}>
                <Car size={24} color="#3B82F6" />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>
                  {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                </Text>
                <Text style={styles.vehicleDetails}>
                  {vehicleInfo.color} • {vehicleInfo.licensePlate}
                </Text>
              </View>
              {vehicleInfo.verified && (
                <View style={styles.verifiedIcon}>
                  <Shield size={16} color="#10B981" />
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Account Settings */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsContainer}>
            {profileSettings.map(renderSettingItem)}
          </View>
        </Animated.View>

        {/* Driver Settings */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Driver Settings</Text>
          <View style={styles.settingsContainer}>
            {menuItems.map(renderSettingItem)}
          </View>
        </Animated.View>

        {/* Logout */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#DC2626" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* App Version */}
        <Animated.View style={[styles.versionSection, { opacity: fadeAnim }]}>
          <Text style={styles.versionText}>Driver App v2.1.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  driverSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 32,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  driverAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  driverEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  driverBadges: {
    flexDirection: 'row',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  verifiedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
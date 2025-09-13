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
import { User, CreditCard, MapPin, Bell, Shield, CircleHelp as HelpCircle, Settings, LogOut, ChevronRight, Star, Gift, Users, CreditCard as Edit, Car } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileSetting {
  id: string;
  icon: any;
  label: string;
  value?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  color?: string;
}

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { user, signOut, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      fetchProfile();
    }
    
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error) {
        setProfile({
          id: user!.id,
          user_id: user!.id,
          email: user!.email || 'user@example.com',
          full_name: user!.user_metadata?.full_name || 'John Doe',
          avatar_url: null,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile({
        id: user!.id,
        user_id: user!.id,
        email: user!.email || 'user@example.com',
        full_name: 'John Doe',
        avatar_url: null,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('Logout button pressed');
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            console.log('User confirmed logout');
            try {
              await signOut();
              console.log('SignOut completed');
              // Force immediate navigation
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              // Force navigation even on error
              router.replace('/(auth)/login');
            }
          },
        },
      ]
    );
  };

  const profileSettings: ProfileSetting[] = [
    {
      id: 'payment',
      icon: CreditCard,
      label: 'Payment Methods',
      value: '•••• 4567',
      onPress: () => Alert.alert('Payment Methods', 'Manage your payment methods'),
      color: 'black',
    },
    {
      id: 'addresses',
      icon: MapPin,
      label: 'Saved Addresses',
      value: '3 addresses',
      onPress: () => Alert.alert('Saved Addresses', 'Manage your saved addresses'),
      color: '#059669',
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notifications',
      hasSwitch: true,
      switchValue: notificationsEnabled,
      onToggle: setNotificationsEnabled,
      color: '#DC2626',
    },
    {
      id: 'privacy',
      icon: Shield,
      label: 'Privacy & Safety',
      hasSwitch: true,
      switchValue: locationEnabled,
      onToggle: setLocationEnabled,
      color: '#7C3AED',
    },
  ];

  const menuItems: ProfileSetting[] = [
    {
      id: 'driver',
      icon: Car,
      label: 'Become a Driver',
      value: 'Earn money driving',
      onPress: () => router.push('/(driver)/apply'),
      color: '#10B981',
    },
    {
      id: 'referral',
      icon: Gift,
      label: 'Invite Friends',
      value: 'Get $10 credit',
      onPress: () => Alert.alert('Referral', 'Invite friends and earn credits!'),
      color: '#F59E0B',
    },
    {
      id: 'family',
      icon: Users,
      label: 'Family Profile',
      onPress: () => Alert.alert('Family Profile', 'Add family members'),
      color: '#10B981',
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      onPress: () => Alert.alert('Settings', 'App settings and preferences'),
      color: '#6B7280',
    },
    {
      id: 'help',
      icon: HelpCircle,
      label: 'Help & Support',
      onPress: () => Alert.alert('Help', 'Get help and support'),
      color: '#8B5CF6',
    },
  ];

  const renderSettingItem = (item: ProfileSetting, index: number) => (
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
            thumbColor={item.switchValue ? 'black' : '#FFFFFF'}
          />
        ) : (
          <ChevronRight size={20} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.editButton}>
          <Edit size={20} color="#6B7280" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <Animated.View style={[styles.userSection, { opacity: fadeAnim }]}>
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <User size={32} color="#FFFFFF" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{profile?.full_name || 'User'}</Text>
              <Text style={styles.userEmail}>{profile?.email}</Text>
              <View style={styles.userBadges}>
                <View style={styles.verifiedBadge}>
                  <Shield size={12} color="#059669" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                <Star size={16} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
                <CreditCard size={16} color="black" />
              </View>
              <Text style={styles.statValue}>47</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                <Gift size={16} color="#059669" />
              </View>
              <Text style={styles.statValue}>$127</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
          </View>
        </Animated.View>

        {/* Account Settings */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsContainer}>
            {profileSettings.map((item, index) => renderSettingItem(item, index))}
          </View>
        </Animated.View>

        {/* More Options */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>More</Text>
          <View style={styles.settingsContainer}>
            {menuItems.map((item, index) => renderSettingItem(item, index))}
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
          <Text style={styles.versionText}>RideShare v2.1.0</Text>
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
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  userSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 32,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  userBadges: {
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
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    letterSpacing: -0.3,
  },
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
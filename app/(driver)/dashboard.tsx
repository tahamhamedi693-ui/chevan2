import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Animated,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Car, DollarSign, Clock, MapPin, Star, Navigation, Phone, MessageCircle, Settings, ChartBar as BarChart3, User, Zap, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import MapView from '@/components/MapView';

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [todayEarnings, setTodayEarnings] = useState(127.50);
  const [todayTrips, setTodayTrips] = useState(8);
  const [rating, setRating] = useState(4.8);
  const { user } = useAuth();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleGoOnline = () => {
    setIsOnline(!isOnline);
    Alert.alert(
      isOnline ? 'Going Offline' : 'Going Online',
      isOnline 
        ? 'You will stop receiving ride requests' 
        : 'You will start receiving ride requests',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            setIsOnline(!isOnline);
            Alert.alert(
              'Status Updated', 
              isOnline ? 'You are now offline' : 'You are now online and ready to receive rides!'
            );
          }
        },
      ]
    );
  };

  const mockRideRequest = {
    id: 'ride-123',
    passenger: 'John Smith',
    pickup: '123 Main St, Downtown',
    destination: '456 Oak Ave, Uptown',
    distance: '3.2 km',
    estimatedFare: 18.50,
    estimatedTime: '12 min',
    passengerRating: 4.7
  };

  const handleAcceptRide = () => {
    setCurrentRide(mockRideRequest);
    Alert.alert('Ride Accepted', 'Navigate to pickup location');
  };

  const handleDeclineRide = () => {
    Alert.alert('Ride Declined', 'Looking for another ride...');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={isOnline ? ['#10B981', '#059669'] : ['#6B7280', '#4B5563']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Good morning, Driver!</Text>
              <Text style={styles.statusText}>
                {isOnline ? 'You are online' : 'You are offline'}
              </Text>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Online/Offline Toggle */}
      <Animated.View style={[styles.toggleSection, { opacity: fadeAnim }]}>
        <View style={styles.toggleCard}>
          <View style={styles.toggleContent}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>
                {isOnline ? 'You\'re Online' : 'You\'re Offline'}
              </Text>
              <Text style={styles.toggleSubtitle}>
                {isOnline 
                  ? 'Ready to receive ride requests' 
                  : 'Tap to start receiving rides'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleGoOnline}
              trackColor={{ false: '#E5E7EB', true: '#D1FAE5' }}
              thumbColor={isOnline ? '#10B981' : '#9CA3AF'}
              style={styles.toggle}
            />
          </View>
        </View>
      </Animated.View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          currentLocation={{
            latitude: 37.7749,
            longitude: -122.4194
          }}
          showNearbyDrivers={false}
        />
        
        {/* Map Overlay Stats */}
        <View style={styles.mapOverlay}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <DollarSign size={16} color="#10B981" />
              <Text style={styles.statValue}>${todayEarnings}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.statCard}>
              <Car size={16} color="#3B82F6" />
              <Text style={styles.statValue}>{todayTrips}</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statCard}>
              <Star size={16} color="#F59E0B" />
              <Text style={styles.statValue}>{rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Ride Request Modal */}
      {isOnline && !currentRide && (
        <View style={styles.rideRequestModal}>
          <View style={styles.rideRequestHeader}>
            <Text style={styles.rideRequestTitle}>New Ride Request</Text>
            <View style={styles.rideRequestTimer}>
              <Clock size={16} color="#DC2626" />
              <Text style={styles.timerText}>15s</Text>
            </View>
          </View>
          
          <View style={styles.rideRequestContent}>
            <View style={styles.passengerInfo}>
              <View style={styles.passengerAvatar}>
                <User size={20} color="#FFFFFF" />
              </View>
              <View style={styles.passengerDetails}>
                <Text style={styles.passengerName}>{mockRideRequest.passenger}</Text>
                <View style={styles.passengerRating}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingText}>{mockRideRequest.passengerRating}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.rideDetails}>
              <View style={styles.rideDetailRow}>
                <MapPin size={16} color="#10B981" />
                <Text style={styles.rideDetailText}>{mockRideRequest.pickup}</Text>
              </View>
              <View style={styles.rideDetailRow}>
                <Navigation size={16} color="#DC2626" />
                <Text style={styles.rideDetailText}>{mockRideRequest.destination}</Text>
              </View>
              <View style={styles.rideMetrics}>
                <Text style={styles.metricText}>{mockRideRequest.distance}</Text>
                <Text style={styles.metricText}>{mockRideRequest.estimatedTime}</Text>
                <Text style={styles.fareText}>${mockRideRequest.estimatedFare}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.rideRequestActions}>
            <TouchableOpacity 
              style={styles.declineButton}
              onPress={handleDeclineRide}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={handleAcceptRide}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.acceptButtonGradient}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Current Ride */}
      {currentRide && (
        <View style={styles.currentRidePanel}>
          <View style={styles.currentRideHeader}>
            <Text style={styles.currentRideTitle}>Current Trip</Text>
            <View style={styles.currentRideStatus}>
              <Zap size={16} color="#10B981" />
              <Text style={styles.statusText}>En Route</Text>
            </View>
          </View>
          
          <View style={styles.currentRideContent}>
            <Text style={styles.currentRidePassenger}>{currentRide.passenger}</Text>
            <Text style={styles.currentRideDestination}>{currentRide.destination}</Text>
            
            <View style={styles.currentRideActions}>
              <TouchableOpacity style={styles.contactButton}>
                <Phone size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton}>
                <MessageCircle size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navigationButton}>
                <Navigation size={18} color="#FFFFFF" />
                <Text style={styles.navigationText}>Navigate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton}>
          <BarChart3 size={20} color="#6B7280" />
          <Text style={styles.quickActionText}>Earnings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Car size={20} color="#6B7280" />
          <Text style={styles.quickActionText}>Trips</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Shield size={20} color="#6B7280" />
          <Text style={styles.quickActionText}>Safety</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleSection: {
    paddingHorizontal: 24,
    marginTop: -10,
    marginBottom: 20,
  },
  toggleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  toggle: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  rideRequestModal: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  rideRequestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rideRequestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  rideRequestTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  rideRequestContent: {
    marginBottom: 20,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  passengerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  passengerDetails: {
    flex: 1,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  passengerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  rideDetails: {
    gap: 8,
  },
  rideDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rideDetailText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  rideMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  metricText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  fareText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  rideRequestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  acceptButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  currentRidePanel: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  currentRideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentRideTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  currentRideStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentRideContent: {
    marginBottom: 16,
  },
  currentRidePassenger: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  currentRideDestination: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  currentRideActions: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  navigationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
  },
});
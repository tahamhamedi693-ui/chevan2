import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Animated } from 'react-native';
import { MapPin, Clock, Car, Phone, MessageCircle, Star, Navigation, Shield, X, Share2, User, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Database } from '@/types/database';
import MapView from './MapView';

type Ride = Database['public']['Tables']['rides']['Row'];

interface RideTrackerProps {
  ride: Ride;
  onCancel: () => void;
  onContact: () => void;
  onEmergency: () => void;
}

export default function RideTracker({ ride, onCancel, onContact, onEmergency }: RideTrackerProps) {
  const eta = ride.eta || 'Calculating...';
  const [progress] = useState(new Animated.Value(0));
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [driverLocation, setDriverLocation] = useState<{latitude: number, longitude: number} | null>(null);
  
  useEffect(() => {
    // Animate progress bar for active rides
    if (ride.status === 'active') {
      Animated.timing(progress, {
        toValue: 35, // Mock progress percentage
        duration: 1500,
        useNativeDriver: false
      }).start();
      
      // Simulate real-time location updates
      const locationInterval = setInterval(() => {
        // Mock driver location updates
        setDriverLocation({
          latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
          longitude: -122.4194 + (Math.random() - 0.5) * 0.01
        });
        
        // Mock current location (pickup to destination)
        setCurrentLocation({
          latitude: 37.7749 + (Math.random() - 0.5) * 0.005,
          longitude: -122.4194 + (Math.random() - 0.5) * 0.005
        });
      }, 5000);
      
      return () => clearInterval(locationInterval);
    }
  }, [ride.status]);

  const getStatusMessage = () => {
    switch (ride.status) {
      case 'active':
        return 'Trip in progress';
      case 'completed':
        return 'Trip completed';
      case 'cancelled':
        return 'Trip cancelled';
      default:
        return 'Processing...';
    }
  };

  const getStatusColor = () => {
    switch (ride.status) {
      case 'active':
        return Colors.success;
      case 'completed':
        return Colors.success;
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusGradient = () => {
    switch (ride.status) {
      case 'active':
        return ['#10B981', '#059669'] as const;
      case 'completed':
        return ['#10B981', '#059669'] as const;
      case 'cancelled':
        return ['#EF4444', '#DC2626'] as const;
      default:
        return ['#9CA3AF', '#6B7280'] as const;
    }
  };

  return (
    <View style={styles.container}>
      {/* Live Map View */}
      {ride.status === 'active' && (
        <View style={styles.mapSection}>
          <MapView
            currentLocation={currentLocation || undefined}
            destination={{
              latitude: 37.7849, // Mock destination coordinates
              longitude: -122.4094
            }}
            driverLocation={driverLocation || undefined}
            showRoute={true}
            showNearbyDrivers={false}
          />
          <View style={styles.mapOverlay}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live tracking</Text>
            </View>
          </View>
        </View>
      )}

      {/* Status Header with Gradient */}
      <LinearGradient
        colors={getStatusGradient()}
        style={styles.statusHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.statusContent}>
          <Text style={styles.statusText}>{getStatusMessage()}</Text>
          <View style={styles.etaContainer}>
            <Clock size={14} color="#FFFFFF" />
            <Text style={styles.etaText}>ETA: {eta}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.emergencyButton} onPress={onEmergency}>
          <Shield size={18} color={Colors.error} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Progress Bar for In-Progress Rides */}
      {ride.status === 'active' && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[styles.progressFill, { width: progress.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              }) }]} 
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>Trip Progress</Text>
            <Animated.Text style={styles.progressPercentage}>
              {progress.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              })}
            </Animated.Text>
          </View>
        </View>
      )}

      {/* Driver Information */}
      <View style={styles.driverSection}>
        <View style={styles.driverHeader}>
          <Text style={styles.sectionTitle}>Driver</Text>
          <TouchableOpacity style={styles.driverRating}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>4.8</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.driverCard}>
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <User size={24} color="#FFFFFF" />
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>John Smith</Text>
              <Text style={styles.licensePlate}>ABC 123 • Toyota Camry</Text>
            </View>
          </View>
          <View style={styles.driverActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonPrimary]} 
              onPress={onContact}
            >
              <Phone size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonSecondary]} 
              onPress={onContact}
            >
              <MessageCircle size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Route Information */}
      <View style={styles.routeSection}>
        <Text style={styles.sectionTitle}>Route</Text>
        <View style={styles.routeCard}>
          <View style={styles.routeItem}>
            <View style={styles.routeIconContainer}>
              <View style={[styles.routeDot, styles.pickupDot]} />
            </View>
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.routeText}>{ride.pickup_location}</Text>
            </View>
          </View>
          
          <View style={styles.routeDivider} />
          
          <View style={styles.routeItem}>
            <View style={styles.routeIconContainer}>
              <View style={[styles.routeDot, styles.dropoffDot]} />
            </View>
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>Destination</Text>
              <Text style={styles.routeText}>{ride.dropoff_location}</Text>
            </View>
            <TouchableOpacity style={styles.navigationButton}>
              <Navigation size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Fare Information */}
      <View style={styles.fareSection}>
        <Text style={styles.sectionTitle}>Trip Details</Text>
        <View style={styles.fareCard}>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Estimated Fare</Text>
            <Text style={styles.fareAmount}>${(ride.fare || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Distance</Text>
            <Text style={styles.fareValue}>{(ride.distance || 0).toFixed(1)} km</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Duration</Text>
            <Text style={styles.fareValue}>{ride.duration || 0} min</Text>
          </View>
          <TouchableOpacity style={styles.fareDetailsButton}>
            <Text style={styles.fareDetailsText}>View Receipt</Text>
            <ChevronRight size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {ride.status === 'active' && (
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={onCancel}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626'] as const}
              style={styles.cancelGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <X size={16} color="#FFFFFF" />
              <Text style={styles.cancelButtonText}>Cancel Ride</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.shareButton}>
          <View style={styles.shareButtonContent}>
            <Share2 size={16} color={Colors.textPrimary} />
            <Text style={styles.shareButtonText}>Share Trip</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.safetyButton}
          onPress={() => {
            Alert.alert(
              'Safety Options',
              'Choose a safety feature:',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Share Location', 
                  onPress: () => Alert.alert('Location Shared', 'Your live location is now being shared with emergency contacts.') 
                },
                { 
                  text: 'Safety Check-in', 
                  onPress: () => Alert.alert('Safety Check-in', 'We\'ll check on you in 10 minutes if your trip isn\'t completed.') 
                },
                { 
                  text: 'Report Issue', 
                  onPress: () => Alert.alert('Report Issue', 'Safety issue reported. Our team will follow up immediately.') 
                },
              ]
            );
          }}
        >
          <View style={styles.safetyButtonContent}>
            <Shield size={16} color={Colors.error} />
            <Text style={styles.safetyButtonText}>Safety</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Map Section
  mapSection: {
    height: 300,
    position: 'relative',
    marginBottom: 20,
  },
  mapOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Status Header
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statusContent: {
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  etaText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  emergencyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  
  // Progress Section
  progressSection: {
    marginBottom: 16,
    paddingHorizontal: 4,
    marginHorizontal: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressPercentage: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  
  // Driver Section
  driverSection: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  ratingText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 16,
    ...Shadows.sm,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  licensePlate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  driverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  actionButtonSecondary: {
    backgroundColor: '#E8F5FF',
  },
  
  // Route Section
  routeSection: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  routeCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    ...Shadows.sm,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pickupDot: {
    backgroundColor: Colors.success,
  },
  dropoffDot: {
    backgroundColor: Colors.error,
  },
  routeDivider: {
    width: 2,
    height: 30,
    backgroundColor: '#D1D5DB',
    marginLeft: 11,
    marginVertical: 4,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  routeText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  navigationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Fare Section
  fareSection: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  fareCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    ...Shadows.sm,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fareLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  fareAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  fareValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  fareDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  fareDetailsText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  
  // Action Section
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  cancelGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    ...Shadows.sm,
  },
  shareButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  shareButtonText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  safetyButton: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    ...Shadows.sm,
  },
  safetyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  safetyButtonText: {
    color: Colors.error,
    fontSize: 15,
    fontWeight: '600',
  },
});
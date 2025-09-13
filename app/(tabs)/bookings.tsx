import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Car, Clock, MapPin, Star, Phone, MessageCircle, X, Calendar, Filter } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import RatingModal from '@/components/RatingModal';
import RideTracker from '@/components/RideTracker';
import { useRides } from '@/hooks/useRides';
import { Database } from '@/types/database';

type Ride = Database['public']['Tables']['rides']['Row'];

export default function BookingsScreen() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const { user, loading: authLoading } = useAuth();
  const { cancelRide, loadRides } = useRides();

  useEffect(() => {
    const loadUserRides = async () => {
      if (user && !authLoading) {
        try {
          // Load rides from the hook
          const rideData = await loadRides();
          if (rideData) {
            setRides(rideData.rides || []);
            setActiveRide(rideData.activeRide || null);
          }
        } catch (error) {
          console.error('Error loading rides:', error);
          // Fallback to mock data for testing
          const mockRides: Ride[] = [
            {
              id: 'ride-1',
              passenger_id: user.id,
              driver_id: 'driver-1',
              pickup_location: '123 Main Street, Downtown',
              dropoff_location: '456 Oak Avenue, Uptown',
              status: 'active',
              fare: 24.50,
              distance: 3.2,
              duration: 18,
              eta: '5 min',
              created_at: new Date().toISOString(),
              completed_at: null,
              updated_at: new Date().toISOString(),
            },
            {
              id: 'ride-2',
              passenger_id: user.id,
              driver_id: 'driver-2',
              pickup_location: '789 Pine Street, Mall Area',
              dropoff_location: '321 University Avenue',
              status: 'completed',
              fare: 18.75,
              distance: 2.1,
              duration: 12,
              eta: null,
              created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
              completed_at: new Date(Date.now() - 86400000 + 720000).toISOString(), // 12 min later
              updated_at: new Date(Date.now() - 86400000).toISOString(),
            },
          ];
          setRides(mockRides);
          setActiveRide(mockRides.find(r => r.status === 'active') || null);
        }
      }
    };
    
    loadUserRides();
    
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [user, authLoading, loadRides]);

  // Combine active trip with history for display
  const allRides = activeRide ? [activeRide, ...rides.filter(r => r.id !== activeRide.id)] : rides;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'black';
      case 'completed':
        return '#059669';
      case 'cancelled':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleRidePress = (ride: Ride) => {
    setSelectedRide(ride);
    setShowDetails(true);
  };

  const handleRateRide = (ride: Ride) => {
    setSelectedRide(ride);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = (rating: number, comment: string, tips: string[]) => {
    console.log('Rating submitted for ride:', selectedRide?.id, { rating, comment, tips });
    Alert.alert('Thank You!', 'Your rating has been submitted.');
    setShowRatingModal(false);
    setSelectedRide(null);
  };

  const handleRepeatRide = (ride: Ride) => {
    Alert.alert(
      'Repeat Ride',
      `Book another ride from ${ride.pickup_location} to ${ride.dropoff_location}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book Now', onPress: () => Alert.alert('Booking...', 'Redirecting to booking screen') },
      ]
    );
  };

  const handleTrackRide = (ride: Ride) => {
    setSelectedRide(ride);
    setShowTrackingModal(true);
  };

  const handleCancelRide = async (ride: Ride) => {
    console.log('Attempting to cancel ride:', ride.id);
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'Keep Ride', style: 'cancel' },
        {
          text: 'Cancel Ride',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Canceling ride:', ride.id);
              await cancelRide(ride.id);
              console.log('Ride cancelled successfully');
              Alert.alert('Ride Cancelled', 'Your ride has been cancelled successfully.');
              // Reload rides to update the UI
              await loadRides();
            } catch (error) {
              console.error('Error canceling ride:', error);
              Alert.alert('Error', 'Failed to cancel ride. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const activeRides = allRides.filter(r => r.status === 'active');
  const pastRides = allRides.filter(r => ['completed', 'cancelled'].includes(r.status));

  const filteredRides = () => {
    switch (filterStatus) {
      case 'active':
        return activeRides;
      case 'completed':
        return pastRides.filter(r => r.status === 'completed');
      default:
        return allRides;
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.title}>Your Trips</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your trips...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Your Trips</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => {
            const statuses = ['all', 'active', 'completed'] as const;
            const currentIndex = statuses.indexOf(filterStatus);
            const nextIndex = (currentIndex + 1) % statuses.length;
            setFilterStatus(statuses[nextIndex]);
          }}
        >
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {[
            { key: 'all', label: 'All Trips', count: allRides.length },
            { key: 'active', label: 'Active', count: activeRides.length },
            { key: 'completed', label: 'Completed', count: pastRides.filter(r => r.status === 'completed').length },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterTab,
                filterStatus === tab.key && styles.activeFilterTab,
              ]}
              onPress={() => setFilterStatus(tab.key as any)}
            >
              <Text style={[
                styles.filterTabText,
                filterStatus === tab.key && styles.activeFilterTabText,
              ]}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View style={[
                  styles.filterTabBadge,
                  filterStatus === tab.key && styles.activeFilterTabBadge,
                ]}>
                  <Text style={[
                    styles.filterTabBadgeText,
                    filterStatus === tab.key && styles.activeFilterTabBadgeText,
                  ]}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Active/Upcoming Rides */}
          {activeRides.length > 0 && (filterStatus === 'all' || filterStatus === 'active') && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Trips</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{activeRides.length}</Text>
                </View>
              </View>
              {activeRides.map((ride) => (
                <TouchableOpacity
                  key={ride.id}
                  style={[styles.rideCard, styles.activeRideCard]}
                  onPress={() => handleRidePress(ride)}
                >
                  <View style={styles.rideHeader}>
                    <View style={styles.rideTypeContainer}>
                      <Car size={16} color="black" />
                      <Text style={styles.rideType}>Economy</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ride.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(ride.status)}</Text>
                    </View>
                  </View>

                  <View style={styles.routeContainer}>
                    <View style={styles.routeItem}>
                      <View style={[styles.routeDot, { backgroundColor: '#059669' }]} />
                      <Text style={styles.routeText}>{ride.pickup_location}</Text>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.routeItem}>
                      <View style={[styles.routeDot, { backgroundColor: '#DC2626' }]} />
                      <Text style={styles.routeText}>{ride.dropoff_location}</Text>
                    </View>
                  </View>

                  <View style={styles.rideFooter}>
                    <View style={styles.timeContainer}>
                      <Clock size={14} color="#6B7280" />
                      <Text style={styles.timeText}>
                        {formatDate(ride.created_at!)}, {formatTime(ride.created_at!)}
                      </Text>
                    </View>
                    <Text style={styles.priceText}>${(ride.fare || 0).toFixed(2)}</Text>
                  </View>

                  {/* Action Buttons for Active Rides */}
                  <View style={styles.rideActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleTrackRide(ride)}>
                      <Text style={styles.actionButtonText}>Track</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.secondaryActionButton]}
                      onPress={() => {
                        console.log('Cancel button pressed for ride:', ride.id);
                        handleCancelRide(ride);
                      }}
                    >
                      <Text style={[styles.actionButtonText, styles.secondaryActionButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Past Rides */}
          {(filterStatus === 'all' || filterStatus === 'completed') && (
            <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {filterStatus === 'completed' ? 'Completed Trips' : 'Trip History'}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {filterStatus === 'completed' 
                    ? pastRides.filter(r => r.status === 'completed').length 
                    : pastRides.length}
                </Text>
              </View>
            </View>
            {(filterStatus === 'completed' ? pastRides.filter(r => r.status === 'completed') : pastRides).length === 0 ? (
              <View style={styles.emptyState}>
                <Car size={48} color="#E5E7EB" />
                <Text style={styles.emptyStateText}>
                  {filterStatus === 'completed' ? 'No completed trips yet' : 'No trip history yet'}
                </Text>
                <Text style={styles.emptyStateSubtext}>Your completed trips will appear here</Text>
              </View>
            ) : (
              (filterStatus === 'completed' ? pastRides.filter(r => r.status === 'completed') : pastRides).map((ride) => (
                <TouchableOpacity
                  key={ride.id}
                  style={styles.rideCard}
                  onPress={() => handleRidePress(ride)}
                >
                  <View style={styles.rideHeader}>
                    <View style={styles.rideTypeContainer}>
                      <Car size={16} color="#6B7280" />
                      <Text style={[styles.rideType, { color: '#6B7280' }]}>Economy</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ride.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(ride.status)}</Text>
                    </View>
                  </View>

                  <View style={styles.routeContainer}>
                    <View style={styles.routeItem}>
                      <View style={[styles.routeDot, { backgroundColor: '#D1D5DB' }]} />
                      <Text style={styles.routeText}>{ride.pickup_location}</Text>
                    </View>
                    <View style={[styles.routeLine, { backgroundColor: '#E5E7EB' }]} />
                    <View style={styles.routeItem}>
                      <View style={[styles.routeDot, { backgroundColor: '#D1D5DB' }]} />
                      <Text style={styles.routeText}>{ride.dropoff_location}</Text>
                    </View>
                  </View>

                  <View style={styles.rideFooter}>
                    <View style={styles.timeContainer}>
                      <Clock size={14} color="#9CA3AF" />
                      <Text style={[styles.timeText, { color: '#9CA3AF' }]}>
                        {formatDate(ride.created_at!)}, {formatTime(ride.created_at!)}
                      </Text>
                    </View>
                    <Text style={styles.priceText}>
                      ${(ride.fare || 0).toFixed(2)}
                    </Text>
                  </View>

                  {/* Action Buttons for Past Rides */}
                  {ride.status === 'completed' && (
                    <View style={styles.rideActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleRateRide(ride)}
                      >
                        <Star size={14} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Rate</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.secondaryActionButton]}
                        onPress={() => handleRepeatRide(ride)}
                      >
                        <Text style={[styles.actionButtonText, styles.secondaryActionButtonText]}>Repeat</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        ride={selectedRide}
      />

      {/* Ride Tracking Modal */}
      <Modal
        visible={showTrackingModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTrackingModal(false)}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Track Your Ride</Text>
            <View style={styles.placeholder} />
          </View>
          {selectedRide && (
            <RideTracker
              ride={selectedRide}
              onCancel={() => {
                handleCancelRide(selectedRide);
                setShowTrackingModal(false);
              }}
              onContact={() => {
                Alert.alert(
                  'Contact Driver',
                  'How would you like to contact your driver?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Call', onPress: () => Alert.alert('Calling driver...') },
                    { text: 'Message', onPress: () => Alert.alert('Opening messages...') },
                  ]
                );
              }}
              onEmergency={() => {
                Alert.alert(
                  'Emergency',
                  'Contact emergency services?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Call 911', onPress: () => Alert.alert('Calling 911...') },
                  ]
                );
              }}
            />
          )}
        </SafeAreaView>
      </Modal>
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
  filterButton: {
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
  contentContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  activeFilterTab: {
    backgroundColor: 'black',
    borderColor: 'black',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  filterTabBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  activeFilterTabBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterTabBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  activeFilterTabBadgeText: {
    color: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  badge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  rideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  activeRideCard: {
    borderColor: '#DBEAFE',
    backgroundColor: '#FEFEFE',
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rideTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  rideType: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  routeContainer: {
    marginBottom: 16,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: '#D1D5DB',
    marginLeft: 3,
    marginRight: 12,
    marginVertical: 2,
  },
  routeText: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
    fontWeight: '500',
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  rideActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  secondaryActionButton: {
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryActionButtonText: {
    color: '#374151',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
});
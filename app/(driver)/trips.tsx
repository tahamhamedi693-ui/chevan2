import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft,
  Car,
  Clock,
  MapPin,
  Star,
  DollarSign,
  Navigation,
  Filter
} from 'lucide-react-native';
import { router } from 'expo-router';

export default function DriverTrips() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const trips = [
    {
      id: '1',
      passenger: 'John Smith',
      pickup: '123 Main St, Downtown',
      destination: '456 Oak Ave, Uptown',
      date: '2024-01-15',
      time: '2:30 PM',
      fare: 28.50,
      tip: 5.00,
      distance: '3.2 km',
      duration: '18 min',
      status: 'completed',
      rating: 5,
    },
    {
      id: '2',
      passenger: 'Sarah Johnson',
      pickup: '789 Pine St, Mall Area',
      destination: '321 University Ave',
      date: '2024-01-15',
      time: '1:45 PM',
      fare: 15.75,
      tip: 2.25,
      distance: '2.1 km',
      duration: '12 min',
      status: 'completed',
      rating: 4,
    },
    {
      id: '3',
      passenger: 'Mike Davis',
      pickup: 'Grand Hotel, City Center',
      destination: 'Central Station',
      date: '2024-01-15',
      time: '12:20 PM',
      fare: 22.00,
      tip: 4.00,
      distance: '2.8 km',
      duration: '15 min',
      status: 'completed',
      rating: 5,
    },
    {
      id: '4',
      passenger: 'Emily Wilson',
      pickup: 'Business District',
      destination: 'Riverside Restaurant',
      date: '2024-01-15',
      time: '11:15 AM',
      fare: 18.25,
      tip: 3.50,
      distance: '2.5 km',
      duration: '14 min',
      status: 'completed',
      rating: 4,
    },
  ];

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

  const filteredTrips = trips.filter(trip => {
    if (selectedFilter === 'all') return true;
    return trip.status === selectedFilter;
  });

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
        <Text style={styles.title}>My Trips</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={24} color="#6B7280" />
        </TouchableOpacity>
      </Animated.View>

      {/* Filter Tabs */}
      <Animated.View style={[styles.filterTabs, { opacity: fadeAnim }]}>
        {[
          { key: 'all', label: 'All Trips', count: trips.length },
          { key: 'completed', label: 'Completed', count: trips.filter(t => t.status === 'completed').length },
          { key: 'cancelled', label: 'Cancelled', count: 0 },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              selectedFilter === tab.key && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedFilter(tab.key)}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === tab.key && styles.activeFilterTabText,
            ]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[
                styles.filterTabBadge,
                selectedFilter === tab.key && styles.activeFilterTabBadge,
              ]}>
                <Text style={[
                  styles.filterTabBadgeText,
                  selectedFilter === tab.key && styles.activeFilterTabBadgeText,
                ]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trip Stats */}
        <Animated.View style={[styles.statsSection, { opacity: fadeAnim }]}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Car size={20} color="#3B82F6" />
              <Text style={styles.statValue}>{trips.length}</Text>
              <Text style={styles.statLabel}>Total Trips</Text>
            </View>
            <View style={styles.statCard}>
              <DollarSign size={20} color="#10B981" />
              <Text style={styles.statValue}>
                ${trips.reduce((sum, trip) => sum + trip.fare + trip.tip, 0).toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
            <View style={styles.statCard}>
              <Star size={20} color="#F59E0B" />
              <Text style={styles.statValue}>
                {(trips.reduce((sum, trip) => sum + trip.rating, 0) / trips.length).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>
        </Animated.View>

        {/* Trips List */}
        <Animated.View style={[styles.tripsSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Recent Trips</Text>
          
          {filteredTrips.length === 0 ? (
            <View style={styles.emptyState}>
              <Car size={48} color="#E5E7EB" />
              <Text style={styles.emptyStateText}>No trips found</Text>
              <Text style={styles.emptyStateSubtext}>Your trips will appear here</Text>
            </View>
          ) : (
            <View style={styles.tripsContainer}>
              {filteredTrips.map((trip) => (
                <TouchableOpacity key={trip.id} style={styles.tripCard}>
                  <View style={styles.tripHeader}>
                    <View style={styles.tripInfo}>
                      <Text style={styles.passengerName}>{trip.passenger}</Text>
                      <View style={styles.tripRating}>
                        <Star size={12} color="#F59E0B" fill="#F59E0B" />
                        <Text style={styles.ratingText}>{trip.rating}</Text>
                      </View>
                    </View>
                    <View style={styles.tripEarnings}>
                      <Text style={styles.fareAmount}>${(trip.fare + trip.tip).toFixed(2)}</Text>
                      <Text style={styles.tripTime}>{trip.time}</Text>
                    </View>
                  </View>

                  <View style={styles.tripRoute}>
                    <View style={styles.routeItem}>
                      <View style={[styles.routeDot, { backgroundColor: '#10B981' }]} />
                      <Text style={styles.routeText}>{trip.pickup}</Text>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.routeItem}>
                      <View style={[styles.routeDot, { backgroundColor: '#DC2626' }]} />
                      <Text style={styles.routeText}>{trip.destination}</Text>
                    </View>
                  </View>

                  <View style={styles.tripFooter}>
                    <View style={styles.tripMetrics}>
                      <View style={styles.metricItem}>
                        <Navigation size={12} color="#6B7280" />
                        <Text style={styles.metricText}>{trip.distance}</Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Clock size={12} color="#6B7280" />
                        <Text style={styles.metricText}>{trip.duration}</Text>
                      </View>
                    </View>
                    <Text style={styles.tripDate}>{formatDate(trip.date)}</Text>
                  </View>

                  <View style={styles.tripBreakdown}>
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>Fare</Text>
                      <Text style={styles.breakdownValue}>${trip.fare.toFixed(2)}</Text>
                    </View>
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>Tip</Text>
                      <Text style={[styles.breakdownValue, styles.tipValue]}>
                        ${trip.tip.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  activeFilterTab: {
    backgroundColor: '#111827',
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
  content: {
    flex: 1,
    paddingTop: 20,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  statCard: {
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
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  tripsSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 24,
    marginBottom: 16,
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
  tripsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tripInfo: {
    flex: 1,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  tripRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  tripEarnings: {
    alignItems: 'flex-end',
  },
  fareAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 2,
  },
  tripTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  tripRoute: {
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
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tripDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  tripBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  tipValue: {
    color: '#10B981',
  },
});
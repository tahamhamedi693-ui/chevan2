import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Navigation, Search, Car, Users, Crown, Clock, Star, Phone, MessageCircle, X, Zap, Shield, Bell, Sparkles, Calendar, Chrome as Home, Truck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import * as Location from 'expo-location';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import MapView from '@/components/MapView';
import LocationSearch from '@/components/LocationSearch';
import RideTracker from '@/components/RideTracker';
import RatingModal from '@/components/RatingModal';
import NotificationCenter from '@/components/NotificationCenter';
import ScheduleRide from '@/components/ScheduleRide';
import CarSelection, { CarOption } from '@/components/CarSelection';
import { useRides } from '@/hooks/useRides';
import { Location as RideLocation } from '@/lib/rideService';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface RideType {
  id: string;
  name: string;
  description: string;
  icon: any;
  price: number;
  eta: string;
  color: string;
  gradient: string[];
}

const carOptions: { [key: string]: CarOption[] } = {
  economy: [
    {
      id: 'standard',
      name: 'Standard',
      icon: Car,
      iconColor: Colors.primary,
      description: 'Affordable everyday rides',
      capacity: 4,
      features: ['AC', 'Budget-friendly']
    },
    {
      id: 'plus',
      name: 'Economy Plus',
      icon: Car,
      iconColor: Colors.primary,
      description: 'More space, same price',
      capacity: 5,
      features: ['AC', 'Extra legroom']
    },
    {
      id: 'green',
      name: 'Eco-friendly',
      icon: Zap,
      iconColor: '#10B981',
      description: 'Hybrid or electric vehicles',
      capacity: 4,
      features: ['Eco-friendly', 'Low emissions']
    }
  ],
  comfort: [
    {
      id: 'sedan',
      name: 'Premium Sedan',
      icon: Car,
      iconColor: Colors.secondary,
      description: 'Comfortable mid-size sedans',
      capacity: 4,
      features: ['Premium interior', 'Extra comfort']
    },
    {
      id: 'suv',
      name: 'Premium SUV',
      icon: Truck,
      iconColor: Colors.secondary,
      description: 'Spacious SUVs for more room',
      capacity: 6,
      features: ['Spacious', 'Extra luggage']
    }
  ],
  luxury: [
    {
      id: 'executive',
      name: 'Executive',
      icon: Crown,
      iconColor: '#FFB800',
      description: 'High-end luxury sedans',
      capacity: 4,
      features: ['Leather seats', 'Premium service']
    },
    {
      id: 'suv-luxury',
      name: 'Luxury SUV',
      icon: Shield,
      iconColor: '#FFB800',
      description: 'Premium SUVs with top features',
      capacity: 6,
      features: ['Spacious', 'Premium amenities']
    },
    {
      id: 'elite',
      name: 'Elite',
      icon: Star,
      iconColor: '#FFB800',
      description: 'Top-tier luxury experience',
      capacity: 4,
      features: ['VIP service', 'Premium amenities']
    }
  ]
};

const rideTypes: RideType[] = [
  {
    id: 'economy',
    name: 'Economy',
    description: 'Affordable rides for everyday trips',
    icon: Car,
    price: 12.50,
    eta: '3 min',
    color: Colors.primary,
    gradient: Colors.primaryGradient,
  },
  {
    id: 'comfort',
    name: 'Comfort',
    description: 'Premium cars with extra space',
    icon: Sparkles,
    price: 18.75,
    eta: '5 min',
    color: Colors.secondary,
    gradient: [Colors.secondary, Colors.secondaryDark],
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'High-end vehicles for special occasions',
    icon: Crown,
    price: 24.99,
    eta: '4 min',
    color: '#FFB800',
    gradient: ['#FFB800', '#FF8C00'],
  },
];

export default function HomeScreen() {
  const [currentLocation, setCurrentLocation] = useState<string>('Getting location...');
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<string>('');
  const [showRideSelection, setShowRideSelection] = useState(false);
  const [selectedRide, setSelectedRide] = useState<RideType | null>(null);
  const [showCarSelection, setShowCarSelection] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarOption | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [estimatedFares, setEstimatedFares] = useState<{ [key: string]: number }>({});
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [searchType, setSearchType] = useState<'pickup' | 'destination'>('destination');
  const [destinationCoords, setDestinationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showScheduleRide, setShowScheduleRide] = useState(false);
  const [completedRide, setCompletedRide] = useState<any>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(3);
  const { user } = useAuth();
  const {
    activeRide,
    loading: rideLoading,
    requestRide, 
    cancelRide, 
    completeRide, 
    getRouteEstimate
  } = useRides();

  const [showActiveRide, setShowActiveRide] = useState(false);

  useEffect(() => {
    getCurrentLocation();
    
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrentLocation('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        setCurrentLocation(`${address.street || ''} ${address.name || ''}, ${address.city || ''}`);
      } else {
        setCurrentLocation('Current Location');
      }
    } catch (error) {
      setCurrentLocation('Unable to get location');
    }
  };

  const handleSearchRides = () => {
    setSearchType('destination');
    setShowLocationSearch(true);
  };

  const handleSelectRide = (ride: RideType) => {
    setSelectedRide(ride);
    setSelectedCar(null); // Reset car selection when changing ride type
    setShowRideSelection(false);
    setShowCarSelection(true);
  };

  const handleBookRide = async () => {
    if (!user || !currentCoords || !destinationCoords || !selectedRide || !selectedCar) return;
    
    setIsBooking(true);
    try {
      const pickup: RideLocation = {
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
        address: currentLocation
      };

      const dest: RideLocation = {
        latitude: destinationCoords.latitude,
        longitude: destinationCoords.longitude,
        address: destination
      };

      await requestRide({ pickup, destination: dest, rideType: selectedRide.id as any, passengers: selectedCar.capacity });
      setShowActiveRide(true);
      setDestination('');
      setDestinationCoords(null);
      setSelectedRide(null);
      setSelectedCar(null);
      setShowCarSelection(false);
    } catch (error) {
      Alert.alert('Booking Failed', 'Unable to book ride. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelRide = async () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'Keep Ride', style: 'cancel' },
        {
          text: 'Cancel Ride',
          style: 'destructive',
          onPress: () => {
            if (activeRide) {
              cancelRide(activeRide.id);
              setShowActiveRide(false);
            }
          },
        },
      ]
    );
  };

  const handleLocationSelect = async (location: any) => {
    if (!currentCoords) {
      Alert.alert('Location Error', 'Current location is not available. Please enable location services and try again.');
      return;
    }

    if (searchType === 'destination') {
      setDestination(location.address);
      setDestinationCoords({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      
      // Calculate fares for all ride types
      const fares: { [key: string]: number } = {};
      for (const ride of rideTypes) {
        try {
          const estimate = await getRouteEstimate(
            { latitude: currentCoords.latitude, longitude: currentCoords.longitude, address: currentLocation },
            { latitude: location.latitude, longitude: location.longitude, address: location.address },
            ride.id
          );
          fares[ride.id] = estimate.fare;
        } catch (error) {
          console.error('Error calculating fare for', ride.id, error);
          // Fallback to base price if calculation fails
          fares[ride.id] = ride.price;
        }
      }
      
      setEstimatedFares(fares);
      setShowRideSelection(true);
    }
    setShowLocationSearch(false);
  };

  const formatDistance = (distanceKm: number): string => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  };

  const formatDuration = (durationMinutes: number): string => {
    if (durationMinutes < 60) {
      return `${Math.round(durationMinutes)} min`;
    }
    const hours = Math.floor(durationMinutes / 60);
    const minutes = Math.round(durationMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  const calculateEstimatedDistance = (): number => {
    if (!currentCoords || !destinationCoords) return 0;
    
    // Haversine formula to calculate distance between two points
    const R = 6371; // Earth's radius in kilometers
    const dLat = (destinationCoords.latitude - currentCoords.latitude) * Math.PI / 180;
    const dLon = (destinationCoords.longitude - currentCoords.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(currentCoords.latitude * Math.PI / 180) * Math.cos(destinationCoords.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleRideComplete = (ride: any) => {
    if (activeRide) completeRide(activeRide.id);
    setCompletedRide(activeRide);
    setShowActiveRide(false);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = (rating: number, comment: string, tips: string[]) => {
    console.log('Rating submitted:', { rating, comment, tips });
    Alert.alert('Thank You!', 'Your rating has been submitted.');
    setCompletedRide(null);
  };

  const handleScheduleRide = (date: Date, time: string) => {
    Alert.alert('Ride Scheduled', `Your ride has been scheduled for ${date.toLocaleDateString()} at ${time}`);
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergency',
      'Contact emergency services?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call 911', onPress: () => Alert.alert('Calling 911...') },
      ]
    );
  };

  const handleContact = () => {
    Alert.alert(
      'Contact Driver',
      'How would you like to contact your driver?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Calling driver...') },
        { text: 'Message', onPress: () => Alert.alert('Opening messages...') },
      ]
    );
  };

  const handleSavedAddresses = () => {
    router.push('/(tabs)/saved-addresses');
  };

  const handleSafety = () => {
    Alert.alert(
      'Safety Center',
      'Choose a safety option:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share Trip', 
          onPress: () => Alert.alert('Share Trip', 'Trip sharing activated. Your location will be shared with emergency contacts.') 
        },
        { 
          text: 'Emergency Contacts', 
          onPress: () => Alert.alert('Emergency Contacts', 'Manage your emergency contacts in settings.') 
        },
        { 
          text: 'Safety Toolkit', 
          onPress: () => Alert.alert('Safety Toolkit', 'Access safety features:\n• Emergency button\n• Trip sharing\n• Safety check-in\n• Report safety issue') 
        },
      ]
    );
  };
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <SafeAreaView style={styles.container}>
        {/* Full-screen Map Container */}
        <View style={styles.mapContainer}>
          <MapView
            currentLocation={currentCoords || undefined}
            destination={destinationCoords || undefined}
            driverLocation={activeRide ? {
              latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
              longitude: -122.4194 + (Math.random() - 0.5) * 0.01
            } : undefined}
            showRoute={!!destinationCoords}
            showNearbyDrivers={true}
          />
        </View>
        
        {/* Modern Floating Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <BlurView intensity={80} tint="light" style={styles.headerBlur}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={styles.greeting}>Welcome back! 👋</Text>
                <Text style={styles.title}>Where would you like to go?</Text>
              </View>
              <View style={styles.headerRight}>
                {activeRide && (
                  <TouchableOpacity 
                    style={styles.activeRideButton}
                    onPress={() => setShowActiveRide(true)}
                  >
                    <LinearGradient
                      colors={Colors.primaryGradient as any}
                      style={styles.activeRideGradient}
                    >
                      <Zap size={16} color={Colors.textInverse} />
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.notificationButton}
                  onPress={() => setShowNotifications(true)}
                >
                  <Bell size={22} color={Colors.textPrimary} />
                  {unreadNotificationsCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>{unreadNotificationsCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {/* Floating Bottom Panel */}
        <Animated.View style={[styles.floatingPanel, { opacity: fadeAnim }]}>
          <View style={styles.handle} />
          
          <View style={styles.panelContent}>
            {/* Modern Location Inputs */}
            <View style={styles.locationInputs}>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => {
                  setSearchType('pickup');
                  setShowLocationSearch(true);
                }}
              >
                <View style={styles.inputLeft}>
                  <View style={styles.locationIconWrapper}>
                    <View style={[styles.locationDot, styles.pickupDot]} />
                  </View>
                  <View style={styles.inputTextContainer}>
                    <Text style={styles.inputLabel}>Pickup</Text>
                    <Text style={styles.inputValue} numberOfLines={1}>
                      {currentLocation}
                    </Text>
                  </View>
                </View>
                <Navigation size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
              
              <View style={styles.routeLineContainer}>
                <View style={styles.routeLine} />
              </View>
              
              <TouchableOpacity
                style={[styles.inputContainer, styles.destinationInput]}
                onPress={handleSearchRides}
              >
                <View style={styles.inputLeft}>
                  <View style={styles.locationIconWrapper}>
                    <View style={[styles.locationDot, styles.destinationDot]} />
                  </View>
                  <View style={styles.inputTextContainer}>
                    <Text style={styles.inputLabel}>Destination</Text>
                    <Text 
                      style={[styles.inputValue, !destination && styles.placeholderText]}
                      numberOfLines={1}
                    >
                      {destination || "Where would you like to go?"}
                    </Text>
                  </View>
                </View>
                <LinearGradient
                  colors={Colors.primaryGradient as any}
                  style={styles.searchButton}
                >
                  <Search size={18} color={Colors.textInverse} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Quick Actions - Always Visible */}
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickActionItem}
                onPress={() => setShowScheduleRide(true)}
              >
                <LinearGradient
                  colors={['#E0E7FF', '#C7D2FE'] as any}
                  style={styles.quickActionIcon}
                >
                  <Calendar size={22} color={Colors.primary} />
                </LinearGradient>
                <Text style={styles.quickActionText}>Schedule</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionItem}
                onPress={handleSavedAddresses}
              >
                <LinearGradient
                  colors={['#CCFBF1', '#A7F3D0'] as any}
                  style={styles.quickActionIcon}
                >
                  <Home size={22} color={Colors.secondary} />
                </LinearGradient>
                <Text style={styles.quickActionText}>Saved</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionItem}
                onPress={handleSafety}
              >
                <LinearGradient
                  colors={['#FEF3C7', '#FDE68A'] as any}
                  style={styles.quickActionIcon}
                >
                  <Shield size={22} color="#F59E0B" />
                </LinearGradient>
                <Text style={styles.quickActionText}>Safety</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Expandable Recent Destinations */}
        <TouchableOpacity 
          style={styles.recentButton}
          onPress={() => {
            // Could expand to show recent destinations
            Alert.alert('Recent Destinations', 'Feature coming soon!');
          }}
        >
          <Clock size={16} color={Colors.textSecondary} />
          <Text style={styles.recentButtonText}>Recent destinations</Text>
          <Navigation size={16} color={Colors.textTertiary} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Active Ride Tracker Modal */}
      <Modal
        visible={showActiveRide}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowActiveRide(false)}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Your Trip</Text>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleRideComplete(activeRide)}
            >
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          </View>
          {activeRide && (
            <RideTracker
              ride={activeRide}
              onCancel={handleCancelRide}
              onContact={handleContact}
              onEmergency={handleEmergency}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Clean Ride Selection Modal */}
      <Modal
        visible={showRideSelection}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRideSelection(false)}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Choose your ride</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.rideOptions} showsVerticalScrollIndicator={false}>
            {rideTypes.map((ride, index) => {
              const IconComponent = ride.icon;
              const estimatedDistance = calculateEstimatedDistance();
              const estimatedDuration = Math.ceil(estimatedDistance * 2.5); // Rough estimate: 2.5 minutes per km
              return (
                <TouchableOpacity
                  key={ride.id}
                  style={[styles.rideOption, { marginTop: index === 0 ? 20 : 0 }]}
                  onPress={() => handleSelectRide(ride)}
                  disabled={isBooking || rideLoading}
                >
                  <View style={styles.rideOptionContent}>
                    <View style={[styles.rideIconContainer, { backgroundColor: `${ride.color}15` }]}>
                      <IconComponent size={24} color={ride.color} />
                    </View>
                    <View style={styles.rideDetails}>
                      <Text style={styles.rideName}>{ride.name}</Text>
                      <Text style={styles.rideDescription}>{ride.description}</Text>
                      <View style={styles.rideMetrics}>
                        <View style={styles.rideEtaContainer}>
                          <Clock size={12} color="#6B7280" />
                          <Text style={styles.rideEta}>{ride.eta} away</Text>
                        </View>
                        {estimatedDistance > 0 && (
                          <View style={styles.rideDistanceContainer}>
                            <MapPin size={12} color="#6B7280" />
                            <Text style={styles.rideDistance}>
                              {formatDistance(estimatedDistance)} • {formatDuration(estimatedDuration)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.ridePricing}>
                      <Text style={styles.ridePrice}>${(estimatedFares[ride.id] || ride.price).toFixed(2)}</Text>
                      <Text style={styles.ridePriceLabel}>
                        {estimatedDistance > 0 ? `${formatDistance(estimatedDistance)}` : 'estimated'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {(isBooking || rideLoading) && (
            <View style={styles.bookingOverlay}>
              <View style={styles.bookingIndicator}>
                <ActivityIndicator size="large" color="black" />
              </View>
              <Text style={styles.bookingText}>Finding your ride...</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Car Selection Modal */}
      <Modal
        visible={showCarSelection}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowCarSelection(false);
                setShowRideSelection(true);
              }}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select a car</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.carSelectionContainer} showsVerticalScrollIndicator={false}>
            {selectedRide && (
              <View style={styles.selectedRideInfo}>
                <View style={[styles.rideIconContainer, { backgroundColor: `${selectedRide.color}15` }]}>
                  {React.createElement(selectedRide.icon, { size: 24, color: selectedRide.color })}
                </View>
                <View>
                  <Text style={styles.selectedRideTitle}>{selectedRide.name}</Text>
                  <Text style={styles.selectedRidePrice}>
                    ${(estimatedFares[selectedRide.id] || selectedRide.price).toFixed(2)} estimated
                  </Text>
                </View>
              </View>
            )}
            
            {selectedRide && (
              <CarSelection
                options={carOptions[selectedRide.id] || []}
                selectedCar={selectedCar}
                onSelectCar={setSelectedCar}
                rideType={selectedRide.name}
              />
            )}
            
            <TouchableOpacity
              style={[styles.bookButton, !selectedCar && styles.disabledButton]}
              onPress={handleBookRide}
              disabled={!selectedCar || isBooking || rideLoading}
            >
              <LinearGradient
                colors={selectedCar ? Colors.primaryGradient : ['#D1D5DB', '#9CA3AF'] as any}
                style={styles.bookButtonGradient}
              >
                <Text style={styles.bookButtonText}>
                  {isBooking ? 'Booking...' : 'Book this car'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>

          {(isBooking || rideLoading) && (
            <View style={styles.bookingOverlay}>
              <View style={styles.bookingIndicator}>
                <ActivityIndicator size="large" color="black" />
              </View>
              <Text style={styles.bookingText}>Finding your ride...</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Location Search Modal */}
      <Modal
        visible={showLocationSearch}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.locationSearchContainer}>
          <LocationSearch
            placeholder={searchType === 'pickup' ? "Search pickup location" : "Where to?"}
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowLocationSearch(false)}
            recentSearches={[
              {
                id: 'recent1',
                name: 'Airport Terminal 1',
                address: 'San Francisco International Airport',
                latitude: 37.6213,
                longitude: -122.3790,
                type: 'recent',
              },
            ]}
            savedAddresses={[
              {
                id: 'home',
                name: 'Home',
                address: '123 Oak Street, San Francisco',
                latitude: 37.7749,
                longitude: -122.4194,
                type: 'saved',
              },
              {
                id: 'work',
                name: 'Work',
                address: '456 Business Ave, San Francisco',
                latitude: 37.7849,
                longitude: -122.4094,
                type: 'saved',
              },
            ]}
          />
        </SafeAreaView>
      </Modal>

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        ride={completedRide}
      />

      {/* Notification Center */}
      <NotificationCenter
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Schedule Ride Modal */}
      <ScheduleRide
        visible={showScheduleRide}
        onClose={() => setShowScheduleRide(false)}
        onSchedule={handleScheduleRide}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  headerBlur: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  greeting: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: Typography.letterSpacing.tight,
  },
  activeRideButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Shadows.md,
  },
  activeRideGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeRideContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeRideText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  notificationButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.error,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
  },
  floatingPanel: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    ...Shadows['2xl'],
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Account for safe area
  },
  handle: {
    width: 48,
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  panelContent: {
    paddingBottom: Spacing.lg,
  },
  locationInputs: {
    paddingHorizontal: Spacing['2xl'],
    marginBottom: Spacing['2xl'],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  destinationInput: {
    marginTop: -Spacing.xs,
  },
  inputLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIconWrapper: {
    marginRight: Spacing.md,
  },
  inputTextContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    marginBottom: 2,
    fontWeight: '500',
  },
  inputValue: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
  },
  pickupDot: {
    backgroundColor: Colors.mapPickup,
  },
  destinationDot: {
    backgroundColor: Colors.mapDropoff,
  },
  routeLineContainer: {
    paddingLeft: Spacing['2xl'] + Spacing.md + 6,
    marginVertical: -Spacing.xs,
  },
  routeLine: {
    width: 2,
    height: Spacing['2xl'],
    backgroundColor: Colors.border,
    marginLeft: 5,
  },
  placeholderText: {
    color: Colors.textTertiary,
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing['2xl'],
    marginBottom: Spacing.lg,
    justifyContent: 'space-between',
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.md,
  },
  quickActionText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  recentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing['2xl'],
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
    position: 'absolute',
    bottom: 120, // Above the floating panel
    left: 0,
    right: 0,
    zIndex: 5,
  },
  recentButtonText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  rideOptions: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
  },
  rideOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  rideOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rideIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  rideDetails: {
    flex: 1,
  },
  rideName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  rideDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  rideEtaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rideMetrics: {
    gap: 4,
  },
  rideDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rideDistance: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  rideEta: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  ridePricing: {
    alignItems: 'flex-end',
  },
  ridePrice: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ridePriceLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  bookingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingIndicator: {
    marginBottom: Spacing.lg,
  },
  bookingText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  carSelectionContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  selectedRideInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  selectedRideTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  selectedRidePrice: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bookButton: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl * 2,
    marginHorizontal: Spacing.xl,
    height: 56,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  disabledButton: {
    opacity: 0.7,
  },
  bookButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  multiRideToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  multiRideToggleActive: {
    backgroundColor: 'black',
    borderColor: 'black',
  },
  multiRideToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  multiRideToggleTextActive: {
    color: '#FFFFFF',
  },
  multiRideSummary: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  multiRideSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  selectedRidesList: {
    marginBottom: 16,
  },
  selectedRideItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedRideIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedRideName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 12,
  },
  selectedRidePrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  totalCostContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalCostLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalCostValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  selectedRideOption: {
    borderColor: '#DBEAFE',
    backgroundColor: '#FEFEFE',
  },
  rideBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  rideBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  multiRideActions: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookMultiRideButton: {
    backgroundColor: 'black',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookMultiRideButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  locationSearchContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  completeButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.sm,
  },
  completeButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
});
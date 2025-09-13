import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StatusBar,
  Animated,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Plus, Chrome as Home, Briefcase, Heart, CreditCard as Edit, Trash2, X, ChevronRight, Navigation } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { savedAddressesTable } from '@/lib/typedSupabase';
import { Database } from '@/types/database';
import LocationSearch from '@/components/LocationSearch';
import * as Location from 'expo-location';

type SavedAddress = Database['public']['Tables']['saved_addresses']['Row'];

const addressIcons = {
  Home: Home,
  Work: Briefcase,
  Favorite: Heart,
  Other: MapPin,
};

export default function SavedAddressesScreen() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] = useState(false);
  const [currentCoordinates, setCurrentCoordinates] = useState<{latitude: number; longitude: number} | null>(null);
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    label: '',
    address: '',
  });

  useEffect(() => {
    if (user && !authLoading) {
      loadSavedAddresses();
    }
    
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [user, authLoading]);

  const loadSavedAddresses = async () => {
    if (!user) return;
    
    try {
      console.log('Loading addresses for user:', user.id);
      const { data, error } = await savedAddressesTable()
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Load addresses result:', { data, error });
      
      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      // Fallback to mock data if database fails
      setAddresses([
        {
          id: '1',
          user_id: user!.id,
          label: 'Home',
          address: '123 Oak Street, Residential Area',
          latitude: 40.7128,
          longitude: -74.0060,
          is_default: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: user!.id,
          label: 'Work',
          address: '456 Business Ave, Financial District',
          latitude: 40.7589,
          longitude: -73.9851,
          is_default: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!formData.label.trim() || !formData.address.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const addressData: Database['public']['Tables']['saved_addresses']['Insert'] = {
        user_id: user!.id,
        label: formData.label,
        address: formData.address,
        latitude: currentCoordinates ? currentCoordinates.latitude : 37.7749, // Use current coordinates if available, otherwise use mock
        longitude: currentCoordinates ? currentCoordinates.longitude : -122.4194,
        is_default: addresses.length === 0, // First address is default
      };
      
      // Reset current coordinates after saving
      setCurrentCoordinates(null);

      if (editingAddress) {
        console.log('Updating address:', editingAddress.id);
        const { error } = await savedAddressesTable()
          .update(addressData)
          .eq('id', editingAddress.id);
        if (error) throw error;
      } else {
        console.log('Creating new address');
        const { error } = await savedAddressesTable()
          .insert(addressData);
        if (error) throw error;
      }

      setShowAddModal(false);
      setEditingAddress(null);
      setFormData({ label: '', address: '' });
      loadSavedAddresses();
      Alert.alert('Success', 'Address saved successfully');
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', `Failed to save address: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (address: SavedAddress) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${address.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              console.log('Deleting address:', address.id, 'for user:', user!.id);
              
              const { data, error } = await savedAddressesTable()
                .delete()
                .eq('id', address.id)
                .eq('user_id', user!.id)
                .select();
              
              console.log('Delete result:', { data, error });
              
              if (error) {
                console.error('Delete error:', error);
                throw error;
              }
              
              // Update local state immediately for better UX
              setAddresses(prev => prev.filter(addr => addr.id !== address.id));
              
              Alert.alert('Success', 'Address deleted successfully');
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', `Failed to delete address: ${error.message || 'Unknown error'}`);
              // Reload addresses to revert UI changes if delete failed
              loadSavedAddresses();
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEditAddress = (address: SavedAddress) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      address: address.address,
    });
    setShowAddModal(true);
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingCurrentLocation(true);
      
      // For web platform, use browser's geolocation API
      if (Platform.OS === 'web') {
        try {
          // Check if browser geolocation is available
          if (!navigator.geolocation) {
            throw new Error('Geolocation is not supported by your browser');
          }
          
          // Get position using browser's geolocation API
          const position: GeolocationPosition = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve(pos as GeolocationPosition),
              reject,
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
              }
            );
          });
          
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          
          console.log('Web geolocation coordinates:', latitude, longitude);
          
          // For a real app, we would use a geocoding service API to get the address
          // For now, let's create a more user-friendly name based on the current date/time
          const now = new Date();
          const locationName = `Current Location (${now.toLocaleTimeString()})`;
          
          // Try to fetch a nearby landmark or address using a free reverse geocoding API
          try {
            // This is a simple way to get a location name without using a paid API
            // In a production app, you would use Google Maps or Mapbox geocoding
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
            const data = await response.json();
            
            // If we get a valid response, use the display name
            if (data && data.display_name) {
              const addressString = data.display_name;
              console.log('Found address:', addressString);
              setFormData({
                ...formData,
                address: addressString,
              });
            } else {
              // Fallback to our generated name
              setFormData({
                ...formData,
                address: locationName,
              });
            }
          } catch (error) {
            console.error('Error fetching address:', error);
            // Fallback if geocoding fails
            setFormData({
              ...formData,
              address: locationName,
            });
          }
          
          // Set the coordinates regardless of which address we use
          setCurrentCoordinates({
            latitude,
            longitude
          });
          
          console.log("Using browser geolocation");
          Alert.alert('Location Found', 'Current location has been set successfully');
          return;
        } catch (error) {
          console.error('Browser geolocation error:', error);
          Alert.alert('Location Error', 'Could not access your location in the browser. Please ensure you have granted location permissions.');
          setIsLoadingCurrentLocation(false);
          return;
        }
      }
      
      // For native platforms, use actual location services
      // Request location permissions - different handling for iOS and Android
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        if (Platform.OS === 'ios') {
          Alert.alert(
            'Permission Denied', 
            'Please enable location services in your device settings to use this feature.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
        } else if (Platform.OS === 'android') {
          Alert.alert(
            'Permission Denied', 
            'Location permission is required to use this feature. Please grant permission when prompted.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Try Again', 
                onPress: () => getCurrentLocation() 
              }
            ]
          );
        } else {
          Alert.alert('Permission Denied', 'Location permission is required to use this feature');
        }
        setIsLoadingCurrentLocation(false);
        return;
      }
      
      // Get current position with appropriate options for each platform
      let locationOptions = {};
      
      if (Platform.OS === 'ios') {
        locationOptions = {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
        };
      } else if (Platform.OS === 'android') {
        locationOptions = {
          accuracy: Location.Accuracy.Balanced,
          mayShowUserSettingsDialog: true,
        };
      }
      
      let location = await Location.getCurrentPositionAsync(locationOptions);
      
      // Reverse geocode to get address
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      if (geocode && geocode.length > 0) {
        const address = geocode[0];
        
        // Format address differently based on platform
        let addressParts = [];
        
        if (Platform.OS === 'ios') {
          // iOS typically provides more detailed address information
          addressParts = [
            address.name,
            address.street,
            address.district,
            address.city,
            address.region,
            address.postalCode,
            address.country
          ];
        } else if (Platform.OS === 'android') {
          // Android sometimes has different fields available
          addressParts = [
            address.name,
            address.street,
            address.city || address.subregion,
            address.region,
            address.postalCode,
            address.country
          ];
        } else {
          // Web or other platforms
          addressParts = [
            address.name,
            address.street,
            address.city,
            address.region,
            address.postalCode,
            address.country
          ];
        }
        
        const addressString = addressParts.filter(Boolean).join(', ');
        
        setFormData({
          ...formData,
          address: addressString,
        });
        
        // Save the coordinates for later use
        setCurrentCoordinates({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
        
        Alert.alert('Location Found', 'Current location has been set successfully');
      } else {
        Alert.alert('Error', 'Could not determine your address');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      
      // Platform-specific error messages
      if (Platform.OS === 'ios') {
        Alert.alert(
          'Location Error', 
          'Unable to access your location. Please check your device settings and ensure location services are enabled.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      } else if (Platform.OS === 'android') {
        Alert.alert(
          'Location Error', 
          'Unable to access your location. Please ensure location services are enabled and the app has permission.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: () => getCurrentLocation() }
          ]
        );
      } else {
        // Web or other platforms
        Alert.alert('Error', 'Failed to get your current location. Please try again.');
      }
    } finally {
      setIsLoadingCurrentLocation(false);
    }
  };
  
  const handleLocationSelect = (location: any) => {
    setFormData({
      ...formData,
      address: location.address,
    });
    setShowLocationSearch(false);
  };

  const getAddressIcon = (label: string) => {
    const IconComponent = addressIcons[label as keyof typeof addressIcons] || MapPin;
    return IconComponent;
  };

  const getIconColor = (label: string) => {
    switch (label) {
      case 'Home': return 'black';
      case 'Work': return '#059669';
      case 'Favorite': return '#DC2626';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.title}>Saved Addresses</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Saved Addresses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <MapPin size={48} color="#E5E7EB" />
              <Text style={styles.emptyStateTitle}>No saved addresses</Text>
              <Text style={styles.emptyStateText}>
                Add your frequently visited places for quick access
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.emptyStateButtonText}>Add Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.addressList}>
              {addresses.map((address) => {
                const IconComponent = getAddressIcon(address.label);
                const iconColor = getIconColor(address.label);
                return (
                  <TouchableOpacity 
                    key={address.id} 
                    style={styles.addressCard}
                    onPress={() => {
                      console.log('Address selected:', address);
                      // Add your address selection logic here
                      Alert.alert('Address Selected', `You selected ${address.label}: ${address.address}`);
                    }}
                  >
                    <View style={[styles.addressIcon, { backgroundColor: `${iconColor}15` }]}>
                      <IconComponent size={20} color={iconColor} />
                    </View>
                    <View style={styles.addressContent}>
                      <Text style={styles.addressLabel}>{address.label}</Text>
                      <Text style={styles.addressText}>{address.address}</Text>
                    </View>
                    <View style={styles.addressActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
                          handleEditAddress(address);
                        }}
                      >
                        <Edit size={16} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
                          handleDeleteAddress(address);
                        }}
                      >
                        <Trash2 size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Add/Edit Address Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowAddModal(false);
                setEditingAddress(null);
                setFormData({ label: '', address: '' });
              }}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingAddress ? 'Edit Address' : 'Add Address'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Label</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Home, Work, Gym"
                value={formData.label}
                onChangeText={(text) => setFormData({ ...formData, label: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TouchableOpacity
                style={[styles.textInput, styles.addressInput]}
                onPress={() => setShowLocationSearch(true)}
              >
                <Text style={[styles.addressInputText, !formData.address && styles.placeholderText]}>
                  {formData.address || "Search for address"}
                </Text>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.currentLocationButton, isLoadingCurrentLocation && styles.currentLocationButtonLoading]}
                onPress={getCurrentLocation}
                disabled={isLoadingCurrentLocation}
              >
                <View style={styles.currentLocationContent}>
                  <Navigation size={16} color={isLoadingCurrentLocation ? "#93C5FD" : "black"} />
                  <Text style={[styles.currentLocationText, isLoadingCurrentLocation && styles.currentLocationTextLoading]}>
                    {isLoadingCurrentLocation ? "Getting location..." : "Use current location"}
                  </Text>
                </View>
                {isLoadingCurrentLocation && (
                  <ActivityIndicator size="small" color="black" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
              <Text style={styles.saveButtonText}>
                {editingAddress ? 'Update Address' : 'Save Address'}
              </Text>
            </TouchableOpacity>
          </View>
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
            placeholder="Search for address"
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowLocationSearch(false)}
          />
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'black',
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
  scrollContainer: {
    flex: 1,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: 'black',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addressList: {
    paddingHorizontal: 24,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
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
  modalContent: {
    flex: 1,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addressInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  addressInputText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  saveButton: {
    backgroundColor: 'black',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  locationSearchContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    paddingHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: Platform.OS === 'ios' ? 16 : 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    ...Platform.select({
      ios: {
        shadowColor: '#93C5FD',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  currentLocationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentLocationText: {
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
  },
  currentLocationButtonLoading: {
    backgroundColor: '#DBEAFE',
    borderColor: '#BFDBFE',
  },
  currentLocationTextLoading: {
    color: '#93C5FD',
  },
});
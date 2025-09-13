import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Search, MapPin, Clock, X, ArrowLeft } from 'lucide-react-native';
import { savedAddressesTable } from '@/lib/typedSupabase';
import { useAuth } from '@/hooks/useAuth';

interface LocationResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'search' | 'recent' | 'saved';
}

interface LocationSearchProps {
  placeholder?: string;
  onLocationSelect: (location: LocationResult) => void;
  onClose?: () => void;
  recentSearches?: LocationResult[];
  savedAddresses?: LocationResult[];
}

export default function LocationSearch({
  placeholder = "Search for a location",
  onLocationSelect,
  onClose,
  recentSearches = [],
  savedAddresses = [],
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [realSavedAddresses, setRealSavedAddresses] = useState<LocationResult[]>([]);
  const { user } = useAuth();

  // Load saved addresses from database
  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (!user) return;
      
      try {
        const result = await savedAddressesTable()
          .select()
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (result.data) {
          const addresses = result.data.map(addr => ({
            id: addr.id,
            name: addr.label,
            address: addr.address,
            latitude: addr.latitude,
            longitude: addr.longitude,
            type: 'saved' as const
          }));
          setRealSavedAddresses(addresses);
        }
      } catch (error) {
        console.error('Error loading saved addresses:', error);
        // Use fallback saved addresses if database fails
        setRealSavedAddresses(savedAddresses);
      }
    };

    loadSavedAddresses();
  }, [user, savedAddresses]);

  // Mock search function - in a real app, you'd use a geocoding service
  const searchLocations = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock search results
    const mockResults: LocationResult[] = [
      {
        id: '1',
        name: 'San Francisco International Airport',
        address: 'San Francisco, CA 94128, USA',
        latitude: 37.6213,
        longitude: -122.3790,
        type: 'search',
      },
      {
        id: '2',
        name: 'Golden Gate Bridge',
        address: 'Golden Gate Bridge, San Francisco, CA, USA',
        latitude: 37.8199,
        longitude: -122.4783,
        type: 'search',
      },
      {
        id: '3',
        name: 'Union Square',
        address: 'Union Square, San Francisco, CA, USA',
        latitude: 37.7880,
        longitude: -122.4075,
        type: 'search',
      },
      {
        id: '4',
        name: 'Fisherman\'s Wharf',
        address: 'Fisherman\'s Wharf, San Francisco, CA, USA',
        latitude: 37.8080,
        longitude: -122.4177,
        type: 'search',
      },
      {
        id: '5',
        name: 'Lombard Street',
        address: 'Lombard Street, San Francisco, CA, USA',
        latitude: 37.8021,
        longitude: -122.4187,
        type: 'search',
      },
    ].filter(result => 
      result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(mockResults);
    setLoading(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleLocationPress = (location: LocationResult) => {
    onLocationSelect(location);
  };

  const renderLocationItem = (location: LocationResult) => {
    const getIcon = () => {
      switch (location.type) {
        case 'recent':
          return <Clock size={16} color="#6B7280" />;
        case 'saved':
          return <MapPin size={16} color="black" />;
        default:
          return <Search size={16} color="#6B7280" />;
      }
    };

    const getIconBg = () => {
      switch (location.type) {
        case 'recent':
          return '#F3F4F6';
        case 'saved':
          return '#DBEAFE';
        default:
          return '#F3F4F6';
      }
    };

    return (
      <TouchableOpacity
        key={location.id}
        style={styles.locationItem}
        onPress={() => handleLocationPress(location)}
      >
        <View style={[styles.locationIcon, { backgroundColor: getIconBg() }]}>
          {getIcon()}
        </View>
        <View style={styles.locationContent}>
          <Text style={styles.locationName}>{location.name}</Text>
          <Text style={styles.locationAddress}>{location.address}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <ArrowLeft size={20} color="#6B7280" />
          </TouchableOpacity>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setQuery('')}
              >
                <X size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="black" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {!loading && query.length === 0 && (
          <>
            {realSavedAddresses.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Saved Addresses</Text>
                {realSavedAddresses.map(renderLocationItem)}
              </View>
            )}

            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                {recentSearches.map(renderLocationItem)}
              </View>
            )}

            {realSavedAddresses.length === 0 && recentSearches.length === 0 && (
              <View style={styles.emptyState}>
                <MapPin size={48} color="#E5E7EB" />
                <Text style={styles.emptyStateText}>Start typing to search for locations</Text>
              </View>
            )}
          </>
        )}

        {!loading && query.length > 0 && searchResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {searchResults.map(renderLocationItem)}
          </View>
        )}

        {!loading && query.length > 0 && searchResults.length === 0 && (
          <View style={styles.emptyState}>
            <Search size={48} color="#E5E7EB" />
            <Text style={styles.emptyStateText}>No results found for "{query}"</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  section: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationContent: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
});
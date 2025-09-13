import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Navigation, Search } from 'lucide-react-native';

interface LocationInputProps {
  currentLocation?: string;
  destination: string;
  onDestinationChange: (text: string) => void;
  onSearchPress: () => void;
  onCurrentLocationPress?: () => void;
}

export default function LocationInput({
  currentLocation = 'Getting location...',
  destination,
  onDestinationChange,
  onSearchPress,
  onCurrentLocationPress,
}: LocationInputProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.locationDot} />
        <Text style={styles.currentLocationText}>{currentLocation}</Text>
        <TouchableOpacity style={styles.currentLocationButton} onPress={onCurrentLocationPress}>
          <Navigation size={16} color="#00D884" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
        <View style={[styles.locationDot, styles.destinationDot]} />
        <TextInput
          style={styles.destinationInput}
          placeholder="Where to?"
          placeholderTextColor="#757575"
          value={destination}
          onChangeText={onDestinationChange}
        />
        <TouchableOpacity style={styles.searchButton} onPress={onSearchPress}>
          <Search size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
  },
  locationDot: {
    width: 8,
    height: 8,
    backgroundColor: '#00D884',
    borderRadius: 4,
    marginRight: 12,
  },
  destinationDot: {
    backgroundColor: '#FF6B6B',
  },
  currentLocationText: {
    flex: 1,
    color: '#000000',
    fontSize: 16,
  },
  currentLocationButton: {
    padding: 4,
  },
  destinationInput: {
    flex: 1,
    color: '#000000',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#00D884',
    padding: 8,
    borderRadius: 6,
  },
});
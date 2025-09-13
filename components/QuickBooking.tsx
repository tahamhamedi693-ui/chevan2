import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Clock, Chrome as Home, Briefcase } from 'lucide-react-native';

interface QuickBookingProps {
  onSelectDestination: (address: string) => void;
}

const quickDestinations = [
  { id: 'home', label: 'Home', address: '123 Oak Street', icon: Home },
  { id: 'work', label: 'Work', address: '456 Business Ave', icon: Briefcase },
  { id: 'airport', label: 'Airport', address: 'International Airport', icon: MapPin },
  { id: 'mall', label: 'Mall', address: 'Downtown Shopping Center', icon: MapPin },
];

export default function QuickBooking({ onSelectDestination }: QuickBookingProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Destinations</Text>
      <View style={styles.destinationsGrid}>
        {quickDestinations.map((destination) => {
          const IconComponent = destination.icon;
          return (
            <TouchableOpacity
              key={destination.id}
              style={styles.destinationCard}
              onPress={() => onSelectDestination(destination.address)}
            >
              <View style={styles.iconContainer}>
                <IconComponent size={20} color="#00D884" />
              </View>
              <Text style={styles.destinationLabel}>{destination.label}</Text>
              <Text style={styles.destinationAddress}>{destination.address}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  destinationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  destinationCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  destinationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  destinationAddress: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
});
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Car, Check, Truck, Zap, Crown, Shield, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface CarOption {
  id: string;
  name: string;
  icon: any; // Icon component
  iconColor?: string;
  description: string;
  capacity: number;
  features: string[];
}

interface CarSelectionProps {
  options: CarOption[];
  selectedCar: CarOption | null;
  onSelectCar: (car: CarOption) => void;
  rideType: string;
}

export default function CarSelection({ 
  options, 
  selectedCar, 
  onSelectCar,
  rideType
}: CarSelectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a car</Text>
      <Text style={styles.subtitle}>Choose a vehicle for your {rideType} ride</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carList}
      >
        {options.map((car) => {
          const isSelected = selectedCar?.id === car.id;
          
          return (
            <TouchableOpacity
              key={car.id}
              style={[
                styles.carCard,
                isSelected && styles.selectedCard
              ]}
              onPress={() => onSelectCar(car)}
            >
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Check size={16} color="#fff" />
                </View>
              )}
              
              <View style={styles.imageContainer}>
                <View style={[styles.iconContainer, { backgroundColor: `${car.iconColor || Colors.primary}15` }]}>
                  {React.createElement(car.icon, { size: 40, color: car.iconColor || Colors.primary })}
                </View>
              </View>
              
              <View style={styles.carInfo}>
                <Text style={styles.carName}>{car.name}</Text>
                <Text style={styles.carDescription}>{car.description}</Text>
                
                <View style={styles.carFeatures}>
                  <View style={styles.featureBadge}>
                    <Car size={12} color={Colors.textSecondary} />
                    <Text style={styles.featureText}>{car.capacity} seats</Text>
                  </View>
                  
                  {car.features.slice(0, 2).map((feature, index) => (
                    <View key={index} style={styles.featureBadge}>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xl,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  carList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  carCard: {
    width: 220,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    marginRight: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: Colors.primary,
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...Shadows.sm,
  },
  imageContainer: {
    height: 120,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carInfo: {
    padding: Spacing.lg,
  },
  carName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  carDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  carFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  featureText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

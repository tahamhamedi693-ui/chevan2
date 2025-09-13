import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Car, Clock, MapPin } from 'lucide-react-native';

interface RideCardProps {
  rideType: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  status: 'active' | 'completed' | 'cancelled' | 'upcoming';
  onPress?: () => void;
}

export default function RideCard({
  rideType,
  from,
  to,
  date,
  time,
  price,
  status,
  onPress,
}: RideCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#00D884';
      case 'upcoming':
        return '#FF9500';
      case 'completed':
        return '#757575';
      case 'cancelled':
        return '#FF6B6B';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'On the way';
      case 'upcoming':
        return 'Scheduled';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.rideTypeContainer}>
          <Car size={16} color="#FFFFFF" />
          <Text style={styles.rideType}>{rideType}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
          <Text style={styles.statusText}>{getStatusText(status)}</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeItem}>
          <View style={[styles.routeDot, { backgroundColor: '#00D884' }]} />
          <Text style={styles.routeText}>{from}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeItem}>
          <View style={[styles.routeDot, { backgroundColor: '#FF6B6B' }]} />
          <Text style={styles.routeText}>{to}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.timeContainer}>
          <Clock size={14} color="#757575" />
          <Text style={styles.timeText}>{date}, {time}</Text>
        </View>
        <Text style={styles.priceText}>${price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rideType: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  routeContainer: {
    marginBottom: 12,
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
    height: 20,
    backgroundColor: '#DDDDDD',
    marginLeft: 3,
    marginRight: 12,
    marginVertical: 2,
  },
  routeText: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});
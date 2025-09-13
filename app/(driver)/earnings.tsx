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
import { DollarSign, TrendingUp, Calendar, Clock, Car, ArrowLeft, ChartBar as BarChart3, Target, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function DriverEarnings() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const earningsData = {
    today: {
      total: 127.50,
      trips: 8,
      hours: 6.5,
      bonus: 15.00,
    },
    week: {
      total: 892.30,
      trips: 47,
      hours: 32.5,
      bonus: 85.00,
    },
    month: {
      total: 3456.80,
      trips: 189,
      hours: 128.5,
      bonus: 245.00,
    }
  };

  const currentData = earningsData[selectedPeriod as keyof typeof earningsData];

  const recentTrips = [
    { id: '1', time: '2:30 PM', from: 'Downtown', to: 'Airport', fare: 28.50, tip: 5.00 },
    { id: '2', time: '1:45 PM', from: 'Mall', to: 'University', fare: 15.75, tip: 2.25 },
    { id: '3', time: '12:20 PM', from: 'Hotel', to: 'Station', fare: 22.00, tip: 4.00 },
    { id: '4', time: '11:15 AM', from: 'Office', to: 'Restaurant', fare: 18.25, tip: 3.50 },
  ];

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
        <Text style={styles.title}>Earnings</Text>
        <TouchableOpacity style={styles.chartButton}>
          <BarChart3 size={24} color="#6B7280" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <Animated.View style={[styles.periodSelector, { opacity: fadeAnim }]}>
          {['today', 'week', 'month'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.activePeriodButton,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.activePeriodButtonText,
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Earnings Summary */}
        <Animated.View style={[styles.summaryCard, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryContent}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Total Earnings</Text>
                <DollarSign size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.summaryAmount}>${currentData.total.toFixed(2)}</Text>
              <View style={styles.summaryStats}>
                <View style={styles.summaryStatItem}>
                  <Car size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.summaryStatText}>{currentData.trips} trips</Text>
                </View>
                <View style={styles.summaryStatItem}>
                  <Clock size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.summaryStatText}>{currentData.hours}h online</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Earnings Breakdown */}
        <Animated.View style={[styles.breakdownSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          
          <View style={styles.breakdownGrid}>
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownIcon}>
                <Car size={20} color="#3B82F6" />
              </View>
              <Text style={styles.breakdownValue}>
                ${(currentData.total - currentData.bonus).toFixed(2)}
              </Text>
              <Text style={styles.breakdownLabel}>Trip Fares</Text>
            </View>
            
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownIcon}>
                <Award size={20} color="#F59E0B" />
              </View>
              <Text style={styles.breakdownValue}>${currentData.bonus.toFixed(2)}</Text>
              <Text style={styles.breakdownLabel}>Bonuses</Text>
            </View>
            
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownIcon}>
                <Target size={20} color="#10B981" />
              </View>
              <Text style={styles.breakdownValue}>
                ${(currentData.total / currentData.hours).toFixed(2)}
              </Text>
              <Text style={styles.breakdownLabel}>Per Hour</Text>
            </View>
            
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownIcon}>
                <TrendingUp size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.breakdownValue}>
                ${(currentData.total / currentData.trips).toFixed(2)}
              </Text>
              <Text style={styles.breakdownLabel}>Per Trip</Text>
            </View>
          </View>
        </Animated.View>

        {/* Recent Trips */}
        <Animated.View style={[styles.tripsSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Recent Trips</Text>
          
          <View style={styles.tripsContainer}>
            {recentTrips.map((trip) => (
              <View key={trip.id} style={styles.tripCard}>
                <View style={styles.tripHeader}>
                  <Text style={styles.tripTime}>{trip.time}</Text>
                  <Text style={styles.tripEarnings}>
                    ${(trip.fare + trip.tip).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.tripRoute}>
                  <Text style={styles.tripLocation}>{trip.from}</Text>
                  <View style={styles.tripArrow} />
                  <Text style={styles.tripLocation}>{trip.to}</Text>
                </View>
                <View style={styles.tripBreakdown}>
                  <Text style={styles.tripFare}>Fare: ${trip.fare.toFixed(2)}</Text>
                  <Text style={styles.tripTip}>Tip: ${trip.tip.toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Goals Section */}
        <Animated.View style={[styles.goalsSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Daily Goal</Text>
          
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>Earnings Goal</Text>
              <Text style={styles.goalAmount}>$150.00</Text>
            </View>
            
            <View style={styles.goalProgress}>
              <View style={styles.goalProgressBar}>
                <View 
                  style={[
                    styles.goalProgressFill, 
                    { width: `${(currentData.total / 150) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.goalProgressText}>
                ${(150 - currentData.total).toFixed(2)} to go
              </Text>
            </View>
          </View>
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
  chartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activePeriodButton: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activePeriodButtonText: {
    color: '#FFFFFF',
  },
  summaryCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryGradient: {
    padding: 24,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 24,
  },
  summaryStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryStatText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  breakdownSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
  },
  breakdownCard: {
    flex: 1,
    minWidth: '45%',
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
  breakdownIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  tripsSection: {
    marginBottom: 24,
  },
  tripsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripTime: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tripEarnings: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tripLocation: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  tripArrow: {
    width: 16,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  tripBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripFare: {
    fontSize: 12,
    color: '#6B7280',
  },
  tripTip: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  goalsSection: {
    marginBottom: 40,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  goalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  goalProgress: {
    gap: 8,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  goalProgressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
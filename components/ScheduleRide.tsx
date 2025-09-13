import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, X, ChevronRight, Plus, Minus } from 'lucide-react-native';

interface ScheduleRideProps {
  visible: boolean;
  onClose: () => void;
  onSchedule: (date: Date, time: string) => void;
}

export default function ScheduleRide({ visible, onClose, onSchedule }: ScheduleRideProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [passengers, setPassengers] = useState(1);

  // Generate next 7 days
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    for (let hour = 6; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Skip past times for today
        if (selectedDate.toDateString() === now.toDateString()) {
          if (hour < currentHour || (hour === currentHour && minute <= currentMinute + 30)) {
            continue;
          }
        }
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const handleSchedule = () => {
    if (!selectedTime) {
      Alert.alert('Time Required', 'Please select a time for your ride');
      return;
    }

    const scheduleDateTime = new Date(selectedDate);
    const [hour, minute] = selectedTime.split(':');
    scheduleDateTime.setHours(parseInt(hour), parseInt(minute));

    onSchedule(scheduleDateTime, selectedTime);
    onClose();
    
    // Reset form
    setSelectedDate(new Date());
    setSelectedTime('');
    setPassengers(1);
  };

  const dates = generateDates();
  const timeSlots = generateTimeSlots();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Schedule Ride</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {dates.map((date, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateCard,
                    selectedDate.toDateString() === date.toDateString() && styles.selectedDateCard,
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Calendar 
                    size={16} 
                    color={selectedDate.toDateString() === date.toDateString() ? '#FFFFFF' : '#6B7280'} 
                  />
                  <Text style={[
                    styles.dateText,
                    selectedDate.toDateString() === date.toDateString() && styles.selectedDateText,
                  ]}>
                    {formatDate(date)}
                  </Text>
                  <Text style={[
                    styles.dayText,
                    selectedDate.toDateString() === date.toDateString() && styles.selectedDayText,
                  ]}>
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Time Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time</Text>
            <View style={styles.timeGrid}>
              {timeSlots.slice(0, 12).map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeCard,
                    selectedTime === time && styles.selectedTimeCard,
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Clock 
                    size={14} 
                    color={selectedTime === time ? '#FFFFFF' : '#6B7280'} 
                  />
                  <Text style={[
                    styles.timeText,
                    selectedTime === time && styles.selectedTimeText,
                  ]}>
                    {formatTime(time)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {timeSlots.length > 12 && (
              <TouchableOpacity style={styles.moreTimesButton}>
                <Text style={styles.moreTimesText}>View More Times</Text>
                <ChevronRight size={16} color="black" />
              </TouchableOpacity>
            )}
          </View>

          {/* Passenger Count */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Number of Passengers</Text>
            <View style={styles.passengerSelector}>
              <TouchableOpacity
                style={[styles.passengerButton, passengers <= 1 && styles.disabledButton]}
                onPress={() => setPassengers(Math.max(1, passengers - 1))}
                disabled={passengers <= 1}
              >
                <Minus size={16} color={passengers <= 1 ? '#9CA3AF' : '#374151'} />
              </TouchableOpacity>
              <View style={styles.passengerCount}>
                <Text style={styles.passengerCountText}>{passengers}</Text>
                <Text style={styles.passengerLabel}>
                  {passengers === 1 ? 'Passenger' : 'Passengers'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.passengerButton, passengers >= 6 && styles.disabledButton]}
                onPress={() => setPassengers(Math.min(6, passengers + 1))}
                disabled={passengers >= 6}
              >
                <Plus size={16} color={passengers >= 6 ? '#9CA3AF' : '#374151'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Schedule Summary */}
          {selectedTime && (
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Ride Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Date</Text>
                  <Text style={styles.summaryValue}>{formatDate(selectedDate)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Time</Text>
                  <Text style={styles.summaryValue}>{formatTime(selectedTime)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Passengers</Text>
                  <Text style={styles.summaryValue}>{passengers}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Schedule Button */}
          <TouchableOpacity
            style={[styles.scheduleButton, !selectedTime && styles.disabledScheduleButton]}
            onPress={handleSchedule}
            disabled={!selectedTime}
          >
            <Text style={styles.scheduleButtonText}>Schedule Ride</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  dateScroll: {
    marginHorizontal: -8,
  },
  dateCard: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 80,
  },
  selectedDateCard: {
    backgroundColor: 'black',
    borderColor: 'black',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
  dayText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  selectedTimeCard: {
    backgroundColor: 'black',
    borderColor: 'black',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedTimeText: {
    color: '#FFFFFF',
  },
  moreTimesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 16,
    gap: 8,
  },
  moreTimesText: {
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
  },
  passengerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  passengerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  passengerCount: {
    alignItems: 'center',
    marginHorizontal: 32,
  },
  passengerCountText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  passengerLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  summarySection: {
    marginBottom: 32,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  scheduleButton: {
    backgroundColor: 'black',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  disabledScheduleButton: {
    backgroundColor: '#9CA3AF',
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
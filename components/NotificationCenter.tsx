import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, X, Car, CreditCard, Gift, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Clock } from 'lucide-react-native';

interface Notification {
  id: string;
  type: 'ride' | 'payment' | 'promotion' | 'alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable?: boolean;
  action?: () => void;
}

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ visible, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'ride',
      title: 'Trip Completed',
      message: 'Your trip to Downtown Mall has been completed. Rate your experience!',
      timestamp: '2 min ago',
      read: false,
      actionable: true,
      action: () => Alert.alert('Rate Trip', 'Opening rating screen...'),
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Processed',
      message: '$24.50 charged to your Visa ending in 4567',
      timestamp: '5 min ago',
      read: false,
    },
    {
      id: '3',
      type: 'promotion',
      title: '20% Off Next Ride',
      message: 'Use code SAVE20 for 20% off your next trip. Valid until tomorrow!',
      timestamp: '1 hour ago',
      read: true,
      actionable: true,
      action: () => Alert.alert('Promo Code', 'SAVE20 copied to clipboard!'),
    },
    {
      id: '4',
      type: 'alert',
      title: 'High Demand Area',
      message: 'Surge pricing is active in your area. Consider waiting or trying a different location.',
      timestamp: '2 hours ago',
      read: true,
    },
    {
      id: '5',
      type: 'system',
      title: 'App Update Available',
      message: 'Version 2.1.1 is now available with bug fixes and improvements.',
      timestamp: '1 day ago',
      read: true,
      actionable: true,
      action: () => Alert.alert('Update', 'Redirecting to app store...'),
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ride':
        return <Car size={20} color="black" />;
      case 'payment':
        return <CreditCard size={20} color="#059669" />;
      case 'promotion':
        return <Gift size={20} color="#F59E0B" />;
      case 'alert':
        return <AlertTriangle size={20} color="#DC2626" />;
      case 'system':
        return <Bell size={20} color="#6B7280" />;
      default:
        return <Bell size={20} color="#6B7280" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'ride':
        return '#DBEAFE';
      case 'payment':
        return '#D1FAE5';
      case 'promotion':
        return '#FEF3C7';
      case 'alert':
        return '#FEE2E2';
      case 'system':
        return '#F3F4F6';
      default:
        return '#F3F4F6';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => setNotifications([]),
        },
      ]
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.actionButton} onPress={markAllAsRead}>
            <CheckCircle size={20} color="black" />
          </TouchableOpacity>
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>You're all caught up!</Text>
          </View>
        ) : (
          <>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
              {notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    !notification.read && styles.unreadNotification,
                  ]}
                  onPress={() => {
                    markAsRead(notification.id);
                    if (notification.actionable && notification.action) {
                      notification.action();
                    }
                  }}
                >
                  <View style={[
                    styles.notificationIcon,
                    { backgroundColor: getNotificationBgColor(notification.type) }
                  ]}>
                    {getNotificationIcon(notification.type)}
                  </View>
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationTime}>{notification.timestamp}</Text>
                    </View>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    {notification.actionable && (
                      <Text style={styles.actionText}>Tap to view</Text>
                    )}
                  </View>
                  {!notification.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  clearButton: {
    alignSelf: 'flex-end',
  },
  clearButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  unreadNotification: {
    backgroundColor: '#FEFEFE',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    color: 'black',
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'black',
    marginLeft: 8,
    marginTop: 8,
  },
});
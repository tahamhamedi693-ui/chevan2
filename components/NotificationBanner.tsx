import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, X, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Info } from 'lucide-react-native';

interface NotificationBannerProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  onDismiss?: () => void;
  actionText?: string;
  onAction?: () => void;
}

export default function NotificationBanner({
  type,
  title,
  message,
  onDismiss,
  actionText,
  onAction,
}: NotificationBannerProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#00D884" />;
      case 'warning':
        return <AlertCircle size={20} color="#FF9500" />;
      case 'error':
        return <AlertCircle size={20} color="#FF6B6B" />;
      default:
        return <Info size={20} color="#007AFF" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#F0FFF8';
      case 'warning':
        return '#FFF8F0';
      case 'error':
        return '#FFF5F5';
      default:
        return '#F0F8FF';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#00D884';
      case 'warning':
        return '#FF9500';
      case 'error':
        return '#FF6B6B';
      default:
        return '#007AFF';
    }
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: getBackgroundColor(), borderLeftColor: getBorderColor() }
    ]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {actionText && onAction && (
            <TouchableOpacity style={styles.actionButton} onPress={onAction}>
              <Text style={[styles.actionText, { color: getBorderColor() }]}>
                {actionText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {onDismiss && (
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <X size={16} color="#757575" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderLeftWidth: 4,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#757575',
    lineHeight: 18,
  },
  actionButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});
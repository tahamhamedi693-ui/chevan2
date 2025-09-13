import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, Plus, Check, X, Smartphone, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { paymentMethodsTable } from '@/lib/typedSupabase';
import { Database } from '@/types/database';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

const paymentTypeIcons = {
  card: CreditCard,
  paypal: CreditCard,
  apple_pay: Smartphone,
  google_pay: Smartphone,
};

const paymentTypeLabels = {
  card: 'Credit/Debit Card',
  paypal: 'PayPal',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
};

export default function PaymentMethodsScreen() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      loadPaymentMethods();
    }
    
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [user, authLoading]);

  const loadPaymentMethods = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await paymentMethodsTable()
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Fallback to mock data if database fails
      setPaymentMethods([
        {
          id: '1',
          user_id: user!.id,
          type: 'card',
          card_last_four: '4567',
          card_brand: 'Visa',
          is_default: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: user!.id,
          type: 'apple_pay',
          card_last_four: null,
          card_brand: null,
          is_default: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (type: 'card' | 'paypal' | 'apple_pay' | 'google_pay') => {
    try {
      const paymentData: Database['public']['Tables']['payment_methods']['Insert'] = {
        user_id: user!.id,
        type,
        is_default: paymentMethods.length === 0, // First payment method is default
        is_active: true,
      };

      const { error } = await paymentMethodsTable()
        .insert(paymentData);
      
      if (error) throw error;
      
      setShowAddModal(false);
      loadPaymentMethods();
      Alert.alert('Success', 'Payment method added successfully');
    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', 'Failed to add payment method');
    }
  };

  const handleSetDefault = async (paymentMethod: PaymentMethod) => {
    try {
      // First, unset all other defaults
      await paymentMethodsTable()
        .update({ is_default: false })
        .eq('user_id', user!.id);

      // Then set this one as default
      const { error } = await paymentMethodsTable()
        .update({ is_default: true })
        .eq('id', paymentMethod.id);
      
      if (error) throw error;
      loadPaymentMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to set default payment method');
    }
  };

  const handleDeletePaymentMethod = async (paymentMethod: PaymentMethod) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await paymentMethodsTable()
                .update({ is_active: false })
                .eq('id', paymentMethod.id);
              if (error) throw error;
              loadPaymentMethods();
            } catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to remove payment method');
            }
          },
        },
      ]
    );
  };

  const getPaymentMethodDisplay = (method: PaymentMethod) => {
    if (method.type === 'card' && method.card_last_four) {
      return `${method.card_brand} •••• ${method.card_last_four}`;
    }
    return paymentTypeLabels[method.type];
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.title}>Payment Methods</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading payment methods...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Payment Methods</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {paymentMethods.length === 0 ? (
            <View style={styles.emptyState}>
              <CreditCard size={48} color="#E5E7EB" />
              <Text style={styles.emptyStateTitle}>No payment methods</Text>
              <Text style={styles.emptyStateText}>
                Add a payment method to book rides
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.emptyStateButtonText}>Add Payment Method</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.paymentList}>
              {paymentMethods.map((method) => {
                const IconComponent = paymentTypeIcons[method.type];
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentCard,
                      method.is_default && styles.defaultPaymentCard,
                    ]}
                    onPress={() => !method.is_default && handleSetDefault(method)}
                  >
                    <View style={[styles.paymentIcon, { backgroundColor: method.is_default ? '#DBEAFE' : '#F3F4F6' }]}>
                      <IconComponent size={20} color={method.is_default ? 'black' : '#6B7280'} />
                    </View>
                    <View style={styles.paymentContent}>
                      <Text style={styles.paymentLabel}>
                        {getPaymentMethodDisplay(method)}
                      </Text>
                      {method.is_default && (
                        <Text style={styles.defaultLabel}>Default</Text>
                      )}
                    </View>
                    <View style={styles.paymentActions}>
                      {method.is_default ? (
                        <View style={styles.checkIcon}>
                          <Check size={16} color="black" />
                        </View>
                      ) : (
                        <ChevronRight size={16} color="#9CA3AF" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Add Payment Method Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAddModal(false)}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Payment Method</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Choose a payment method</Text>
            
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => handleAddPaymentMethod('card')}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#DBEAFE' }]}>
                <CreditCard size={24} color="black" />
              </View>
              <Text style={styles.paymentOptionText}>Credit or Debit Card</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => handleAddPaymentMethod('paypal')}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#FEF3C7' }]}>
                <CreditCard size={24} color="#F59E0B" />
              </View>
              <Text style={styles.paymentOptionText}>PayPal</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => handleAddPaymentMethod('apple_pay')}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#F3F4F6' }]}>
                <Smartphone size={24} color="#374151" />
              </View>
              <Text style={styles.paymentOptionText}>Apple Pay</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => handleAddPaymentMethod('google_pay')}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#D1FAE5' }]}>
                <Smartphone size={24} color="#059669" />
              </View>
              <Text style={styles.paymentOptionText}>Google Pay</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
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
  paymentList: {
    paddingHorizontal: 24,
  },
  paymentCard: {
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
  defaultPaymentCard: {
    borderColor: '#DBEAFE',
    backgroundColor: '#FEFEFE',
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentContent: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  defaultLabel: {
    fontSize: 12,
    color: 'black',
    fontWeight: '500',
  },
  paymentActions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
});
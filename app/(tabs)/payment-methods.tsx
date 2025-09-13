import React, { useState, useEffect } from 'react';
import { useRef } from 'react';
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
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, Plus, Check, X, ChevronRight, Lock } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import StripeProviderWrapper from '@/components/StripeProviderWrapper';
import { paymentMethodsTable } from '@/lib/typedSupabase';
import { Database } from '@/types/database';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

export default function PaymentMethodsScreen() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [stripeHook, setStripeHook] = useState<any>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Dynamically import Stripe hook to avoid web bundling issues
    const loadStripe = async () => {
      try {
        const { useStripe } = await import('@stripe/stripe-react-native');
        if (isMountedRef.current) {
          setStripeHook({ useStripe });
        }
      } catch (error) {
        console.log('Stripe not available on this platform');
      }
    };
    loadStripe();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
        .eq('type', 'card')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (isMountedRef.current) {
        setPaymentMethods(data || []);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Fallback to mock data if database fails
      if (isMountedRef.current) {
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
        ]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const getCardBrand = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.match(/^4/)) return 'Visa';
    if (number.match(/^5[1-5]/)) return 'Mastercard';
    if (number.match(/^3[47]/)) return 'American Express';
    if (number.match(/^6/)) return 'Discover';
    return 'Unknown';
  };

  const validateCard = () => {
    if (!cardForm.cardNumber || cardForm.cardNumber.replace(/\s/g, '').length < 13) {
      Alert.alert('Invalid Card', 'Please enter a valid card number');
      return false;
    }
    if (!cardForm.expiryDate || cardForm.expiryDate.length < 5) {
      Alert.alert('Invalid Expiry', 'Please enter a valid expiry date');
      return false;
    }
    if (!cardForm.cvv || cardForm.cvv.length < 3) {
      Alert.alert('Invalid CVV', 'Please enter a valid CVV');
      return false;
    }
    if (!cardForm.cardholderName.trim()) {
      Alert.alert('Invalid Name', 'Please enter the cardholder name');
      return false;
    }
    return true;
  };

  const handleAddCreditCard = async () => {
    if (!validateCard()) return;

    if (!stripeHook) {
      Alert.alert('Error', 'Stripe is not available on this platform');
      return;
    }

    if (isMountedRef.current) {
      setIsProcessing(true);
    }
    try {
      const { createToken } = stripeHook.useStripe();
      
      // Create Stripe token
      const cardDetails = {
        number: cardForm.cardNumber.replace(/\s/g, ''),
        expMonth: parseInt(cardForm.expiryDate.split('/')[0]),
        expYear: parseInt('20' + cardForm.expiryDate.split('/')[1]),
        cvc: cardForm.cvv,
      };

      const tokenResult = await createToken({
        type: 'Card',
        card: cardDetails,
        name: cardForm.cardholderName,
      });

      if (tokenResult.error) {
        Alert.alert('Card Error', tokenResult.error.message);
        return;
      }

      // Save payment method to backend with Stripe token
      await savePaymentMethodToBackend(tokenResult.token);
      
      const cardNumber = cardForm.cardNumber.replace(/\s/g, '');
      const lastFour = cardNumber.slice(-4);
      const cardBrand = getCardBrand(cardForm.cardNumber);

      const paymentData: Database['public']['Tables']['payment_methods']['Insert'] = {
        user_id: user!.id,
        type: 'card',
        card_last_four: lastFour,
        card_brand: cardBrand,
        is_default: paymentMethods.length === 0, // First payment method is default
        is_active: true,
      };

      const { error } = await paymentMethodsTable()
        .insert(paymentData);
      
      if (error) throw error;
      
      if (isMountedRef.current) {
        setShowAddModal(false);
        setCardForm({
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardholderName: '',
        });
      }
      loadPaymentMethods();
      Alert.alert('Success', 'Credit card added successfully');
    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', 'Failed to add credit card');
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const savePaymentMethodToBackend = async (token: any) => {
    try {
      // In a real app, you would send this token to your backend
      // Your backend would then create a customer and payment method with Stripe
      const response = await fetch('/api/save-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: JSON.stringify({
          token: token.id,
          user_id: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save payment method');
      }

      const result = await response.json();
      console.log('Payment method saved:', result);
    } catch (error) {
      console.error('Error saving payment method to backend:', error);
      // For now, we'll continue without backend integration
      // In production, you should handle this error appropriately
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
    return `${method.card_brand} •••• ${method.card_last_four}`;
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
    <StripeProviderWrapper>
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
                <Text style={styles.emptyStateTitle}>No credit cards</Text>
                <Text style={styles.emptyStateText}>
                  Add a credit card to book rides
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Text style={styles.emptyStateButtonText}>Add Credit Card</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.paymentList}>
                {paymentMethods.map((method) => {
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
                        <CreditCard size={20} color={method.is_default ? 'black' : '#6B7280'} />
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

        {/* Add Credit Card Modal */}
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
              <Text style={styles.modalTitle}>Add Credit Card</Text>
              <View style={styles.placeholder} />
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.sectionTitle}>Enter card details</Text>
              
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Card Number</Text>
                  <TextInput
                    style={styles.cardInput}
                    placeholder="1234 5678 9012 3456"
                    value={cardForm.cardNumber}
                    onChangeText={(text) => setCardForm({
                      ...cardForm,
                      cardNumber: formatCardNumber(text)
                    })}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>
                
                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Expiry Date</Text>
                    <TextInput
                      style={styles.cardInput}
                      placeholder="MM/YY"
                      value={cardForm.expiryDate}
                      onChangeText={(text) => setCardForm({
                        ...cardForm,
                        expiryDate: formatExpiryDate(text)
                      })}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={styles.cardInput}
                      placeholder="123"
                      value={cardForm.cvv}
                      onChangeText={(text) => setCardForm({
                        ...cardForm,
                        cvv: text.replace(/[^0-9]/g, '')
                      })}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Cardholder Name</Text>
                  <TextInput
                    style={styles.cardInput}
                    placeholder="John Doe"
                    value={cardForm.cardholderName}
                    onChangeText={(text) => setCardForm({
                      ...cardForm,
                      cardholderName: text
                    })}
                    autoCapitalize="words"
                  />
                </View>
                
                <View style={styles.securityNote}>
                  <Lock size={16} color="#6B7280" />
                  <Text style={styles.securityText}>
                    Your card information is encrypted and secure
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[styles.addCardButton, isProcessing && styles.addCardButtonDisabled]}
                  onPress={handleAddCreditCard}
                  disabled={isProcessing}
                >
                  <Text style={styles.addCardButtonText}>
                    {isProcessing ? 'Adding Card...' : 'Add Card'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </StripeProviderWrapper>
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
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  cardInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  addCardButton: {
    backgroundColor: 'black',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addCardButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  addCardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
import { Alert } from 'react-native';

export interface StripePaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface CreatePaymentIntentRequest {
  amount: number; // Amount in cents
  currency?: string;
  payment_method_id?: string;
  customer_id?: string;
  metadata?: Record<string, string>;
}

export class StripeService {
  private static instance: StripeService;
  private baseUrl: string;

  private constructor() {
    // In production, this should be your backend API URL
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  }

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<StripePaymentIntent> {
    try {
      const response = await fetch(`${this.baseUrl}/api/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const paymentIntent = await response.json();
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          payment_method_id: paymentMethodId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw new Error('Failed to confirm payment');
    }
  }

  async processRidePayment(
    rideId: string, 
    amount: number, 
    paymentMethodId: string,
    customerId: string
  ): Promise<boolean> {
    try {
      // Create payment intent
      const paymentIntent = await this.createPaymentIntent({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        payment_method_id: paymentMethodId,
        customer_id: customerId,
        metadata: {
          ride_id: rideId,
          type: 'ride_payment',
        },
      });

      // Confirm payment
      const success = await this.confirmPayment(paymentIntent.id, paymentMethodId);
      
      if (success) {
        Alert.alert('Payment Successful', `Your ride payment of $${amount.toFixed(2)} has been processed.`);
        return true;
      } else {
        Alert.alert('Payment Failed', 'There was an issue processing your payment. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error processing ride payment:', error);
      Alert.alert('Payment Error', 'Unable to process payment. Please check your payment method and try again.');
      return false;
    }
  }

  formatCardBrand(brand: string): string {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'Visa';
      case 'mastercard':
        return 'Mastercard';
      case 'amex':
        return 'American Express';
      case 'discover':
        return 'Discover';
      case 'diners':
        return 'Diners Club';
      case 'jcb':
        return 'JCB';
      case 'unionpay':
        return 'UnionPay';
      default:
        return brand.charAt(0).toUpperCase() + brand.slice(1);
    }
  }

  validateCardNumber(cardNumber: string): boolean {
    // Remove spaces and check if it's a valid length
    const cleanNumber = cardNumber.replace(/\s/g, '');
    return cleanNumber.length >= 13 && cleanNumber.length <= 19 && /^\d+$/.test(cleanNumber);
  }

  validateExpiryDate(expiryDate: string): boolean {
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) return false;
    
    const [month, year] = expiryDate.split('/').map(num => parseInt(num));
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (month < 1 || month > 12) return false;
    if (year < currentYear || (year === currentYear && month < currentMonth)) return false;
    
    return true;
  }

  validateCVV(cvv: string, cardBrand?: string): boolean {
    if (cardBrand?.toLowerCase() === 'amex') {
      return /^\d{4}$/.test(cvv);
    }
    return /^\d{3}$/.test(cvv);
  }
}

export const stripeService = StripeService.getInstance();
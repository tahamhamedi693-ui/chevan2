import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Phone, Mail, CreditCard, Car, FileText, Upload, CircleCheck as CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface ApplicationForm {
  fullName: string;
  phone: string;
  licenseNumber: string;
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  licensePlate: string;
  insuranceNumber: string;
}

export default function DriverApplication() {
  const [form, setForm] = useState<ApplicationForm>({
    fullName: '',
    phone: '',
    licenseNumber: '',
    vehicleType: 'economy',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    licensePlate: '',
    insuranceNumber: '',
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { user } = useAuth();

  useEffect(() => {
    // Pre-fill user data if available
    if (user) {
      setForm(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || '',
      }));
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [user]);

  const vehicleTypes = [
    { id: 'economy', name: 'Economy', description: 'Standard vehicles' },
    { id: 'comfort', name: 'Comfort', description: 'Premium vehicles' },
    { id: 'luxury', name: 'Luxury', description: 'High-end vehicles' },
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(form.fullName && form.phone);
      case 2:
        return !!(form.licenseNumber && form.insuranceNumber);
      case 3:
        return !!(form.vehicleType && form.vehicleMake && form.vehicleModel && 
                 form.vehicleYear && form.vehicleColor && form.licensePlate);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      Alert.alert('Incomplete Information', 'Please fill in all required fields');
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to apply');
      return;
    }

    setIsSubmitting(true);
    try {
      const applicationData = {
        user_id: user.id,
        email: user.email!,
        full_name: form.fullName,
        phone: form.phone,
        license_number: form.licenseNumber,
        vehicle_type: form.vehicleType,
        vehicle_make: form.vehicleMake,
        vehicle_model: form.vehicleModel,
        vehicle_year: form.vehicleYear,
        vehicle_color: form.vehicleColor,
        license_plate: form.licensePlate,
        insurance_number: form.insuranceNumber,
        status: 'pending',
        documents: {
          license_uploaded: false,
          insurance_uploaded: false,
          vehicle_registration_uploaded: false,
        },
      };

      const { error } = await supabase
        .from('driver_applications')
        .insert(applicationData);

      if (error) throw error;

      // Update user profile to show they've applied
      await supabase
        .from('profiles')
        .update({ driver_status: 'applied' })
        .eq('user_id', user.id);

      Alert.alert(
        'Application Submitted!',
        'Your driver application has been submitted successfully. We\'ll review it and get back to you within 2-3 business days.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/profile'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', error.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepDescription}>Tell us about yourself</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <View style={styles.inputContainer}>
          <User size={20} color="#9CA3AF" />
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={form.fullName}
            onChangeText={(text) => setForm({ ...form, fullName: text })}
            autoCapitalize="words"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number *</Text>
        <View style={styles.inputContainer}>
          <Phone size={20} color="#9CA3AF" />
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={form.phone}
            onChangeText={(text) => setForm({ ...form, phone: text })}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <View style={[styles.inputContainer, styles.disabledInput]}>
          <Mail size={20} color="#9CA3AF" />
          <Text style={styles.disabledText}>{user?.email}</Text>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>License & Insurance</Text>
      <Text style={styles.stepDescription}>Provide your driving credentials</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Driver's License Number *</Text>
        <View style={styles.inputContainer}>
          <CreditCard size={20} color="#9CA3AF" />
          <TextInput
            style={styles.input}
            placeholder="Enter license number"
            value={form.licenseNumber}
            onChangeText={(text) => setForm({ ...form, licenseNumber: text })}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Insurance Policy Number *</Text>
        <View style={styles.inputContainer}>
          <FileText size={20} color="#9CA3AF" />
          <TextInput
            style={styles.input}
            placeholder="Enter insurance policy number"
            value={form.insuranceNumber}
            onChangeText={(text) => setForm({ ...form, insuranceNumber: text })}
          />
        </View>
      </View>

      <View style={styles.documentSection}>
        <Text style={styles.documentTitle}>Required Documents</Text>
        <View style={styles.documentList}>
          <View style={styles.documentItem}>
            <Upload size={16} color="#6B7280" />
            <Text style={styles.documentText}>Driver's License (Photo)</Text>
          </View>
          <View style={styles.documentItem}>
            <Upload size={16} color="#6B7280" />
            <Text style={styles.documentText}>Insurance Certificate</Text>
          </View>
        </View>
        <Text style={styles.documentNote}>
          Documents can be uploaded after application submission
        </Text>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Vehicle Information</Text>
      <Text style={styles.stepDescription}>Tell us about your vehicle</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Vehicle Type *</Text>
        <View style={styles.vehicleTypeContainer}>
          {vehicleTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.vehicleTypeOption,
                form.vehicleType === type.id && styles.selectedVehicleType,
              ]}
              onPress={() => setForm({ ...form, vehicleType: type.id })}
            >
              <Text style={[
                styles.vehicleTypeName,
                form.vehicleType === type.id && styles.selectedVehicleTypeName,
              ]}>
                {type.name}
              </Text>
              <Text style={[
                styles.vehicleTypeDescription,
                form.vehicleType === type.id && styles.selectedVehicleTypeDescription,
              ]}>
                {type.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Make *</Text>
          <TextInput
            style={styles.smallInput}
            placeholder="Toyota"
            value={form.vehicleMake}
            onChangeText={(text) => setForm({ ...form, vehicleMake: text })}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Model *</Text>
          <TextInput
            style={styles.smallInput}
            placeholder="Camry"
            value={form.vehicleModel}
            onChangeText={(text) => setForm({ ...form, vehicleModel: text })}
          />
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Year *</Text>
          <TextInput
            style={styles.smallInput}
            placeholder="2022"
            value={form.vehicleYear}
            onChangeText={(text) => setForm({ ...form, vehicleYear: text })}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Color *</Text>
          <TextInput
            style={styles.smallInput}
            placeholder="Silver"
            value={form.vehicleColor}
            onChangeText={(text) => setForm({ ...form, vehicleColor: text })}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>License Plate *</Text>
        <View style={styles.inputContainer}>
          <Car size={20} color="#9CA3AF" />
          <TextInput
            style={styles.input}
            placeholder="ABC 123"
            value={form.licensePlate}
            onChangeText={(text) => setForm({ ...form, licensePlate: text.toUpperCase() })}
            autoCapitalize="characters"
          />
        </View>
      </View>
    </View>
  );

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
        <Text style={styles.title}>Become a Driver</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      {/* Progress Indicator */}
      <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
        <View style={styles.progressBar}>
          {[1, 2, 3].map((step) => (
            <View key={step} style={styles.progressStep}>
              <View style={[
                styles.progressDot,
                currentStep >= step && styles.activeProgressDot,
                currentStep > step && styles.completedProgressDot,
              ]}>
                {currentStep > step ? (
                  <CheckCircle size={16} color="#FFFFFF" />
                ) : (
                  <Text style={[
                    styles.progressNumber,
                    currentStep >= step && styles.activeProgressNumber,
                  ]}>
                    {step}
                  </Text>
                )}
              </View>
              {step < 3 && (
                <View style={[
                  styles.progressLine,
                  currentStep > step && styles.activeProgressLine,
                ]} />
              )}
            </View>
          ))}
        </View>
        <Text style={styles.progressText}>Step {currentStep} of 3</Text>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </Animated.View>
        </ScrollView>

        {/* Navigation Buttons */}
        <Animated.View style={[styles.navigationContainer, { opacity: fadeAnim }]}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.backStepButton}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Text style={styles.backStepButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.nextButton,
              !validateStep(currentStep) && styles.disabledButton,
              currentStep === 1 && styles.fullWidthButton,
            ]}
            onPress={handleNext}
            disabled={!validateStep(currentStep) || isSubmitting}
          >
            <Text style={styles.nextButtonText}>
              {isSubmitting ? 'Submitting...' : currentStep === 3 ? 'Submit Application' : 'Next'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
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
    paddingVertical: 16,
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
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#F9FAFB',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeProgressDot: {
    backgroundColor: 'black',
  },
  completedProgressDot: {
    backgroundColor: '#10B981',
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeProgressNumber: {
    color: '#FFFFFF',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  activeProgressLine: {
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 12,
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
  },
  disabledText: {
    flex: 1,
    fontSize: 16,
    color: '#9CA3AF',
    paddingVertical: 12,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  smallInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  vehicleTypeContainer: {
    gap: 12,
  },
  vehicleTypeOption: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedVehicleType: {
    backgroundColor: '#DBEAFE',
    borderColor: 'black',
  },
  vehicleTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  selectedVehicleTypeName: {
    color: 'black',
  },
  vehicleTypeDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedVehicleTypeDescription: {
    color: '#374151',
  },
  documentSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  documentList: {
    gap: 8,
    marginBottom: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentText: {
    fontSize: 14,
    color: '#374151',
  },
  documentNote: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  backStepButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  backStepButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'black',
    alignItems: 'center',
  },
  fullWidthButton: {
    flex: 1,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
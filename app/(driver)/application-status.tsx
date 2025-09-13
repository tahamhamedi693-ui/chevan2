import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, CircleCheck as CheckCircle, Circle as XCircle, FileText, Upload, Eye } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface DriverApplication {
  id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  full_name: string;
  phone: string;
  license_number: string;
  vehicle_type: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year: string;
  vehicle_color: string;
  license_plate: string;
  insurance_number: string;
  documents: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function ApplicationStatus() {
  const [application, setApplication] = useState<DriverApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { user } = useAuth();

  useEffect(() => {
    loadApplication();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadApplication = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('driver_applications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading application:', error);
        // Create mock application for demo
        setApplication({
          id: 'mock-app-1',
          status: 'under_review',
          full_name: 'John Smith',
          phone: '+1 (555) 123-4567',
          license_number: 'DL123456789',
          vehicle_type: 'economy',
          vehicle_make: 'Toyota',
          vehicle_model: 'Camry',
          vehicle_year: '2022',
          vehicle_color: 'Silver',
          license_plate: 'ABC 123',
          insurance_number: 'INS987654321',
          documents: {
            license_uploaded: true,
            insurance_uploaded: false,
            vehicle_registration_uploaded: true,
          },
          notes: 'Application is being reviewed by our team.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else {
        setApplication(data);
      }
    } catch (error) {
      console.error('Error loading application:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: '#F59E0B',
          bgColor: '#FEF3C7',
          title: 'Application Submitted',
          description: 'Your application is in queue for review',
        };
      case 'under_review':
        return {
          icon: Eye,
          color: '#3B82F6',
          bgColor: '#DBEAFE',
          title: 'Under Review',
          description: 'Our team is reviewing your application',
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: '#10B981',
          bgColor: '#D1FAE5',
          title: 'Application Approved',
          description: 'Congratulations! You can now start driving',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: '#EF4444',
          bgColor: '#FEE2E2',
          title: 'Application Rejected',
          description: 'Please review the feedback and reapply',
        };
      default:
        return {
          icon: Clock,
          color: '#6B7280',
          bgColor: '#F3F4F6',
          title: 'Unknown Status',
          description: 'Please contact support',
        };
    }
  };

  const handleUploadDocument = (docType: string) => {
    Alert.alert(
      'Upload Document',
      `Upload your ${docType}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose File', onPress: () => Alert.alert('File Upload', 'Document upload feature coming soon!') },
      ]
    );
  };

  const handleStartDriving = () => {
    Alert.alert(
      'Start Driving',
      'Ready to start accepting ride requests?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Start Driving',
          onPress: () => {
            router.replace('/(driver)/dashboard');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading application status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!application) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Driver Application</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.noApplicationContainer}>
          <Text style={styles.noApplicationText}>No application found</Text>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => router.push('/(driver)/apply')}
          >
            <Text style={styles.applyButtonText}>Apply to Drive</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(application.status);
  const StatusIcon = statusInfo.icon;

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
        <Text style={styles.title}>Application Status</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Animated.View style={[styles.statusCard, { opacity: fadeAnim }]}>
          <View style={[styles.statusIcon, { backgroundColor: statusInfo.bgColor }]}>
            <StatusIcon size={32} color={statusInfo.color} />
          </View>
          <Text style={styles.statusTitle}>{statusInfo.title}</Text>
          <Text style={styles.statusDescription}>{statusInfo.description}</Text>
          
          {application.status === 'approved' && (
            <TouchableOpacity style={styles.startDrivingButton} onPress={handleStartDriving}>
              <Text style={styles.startDrivingButtonText}>Start Driving</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Application Details */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Application Details</Text>
          
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Submitted</Text>
              <Text style={styles.detailValue}>
                {new Date(application.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vehicle</Text>
              <Text style={styles.detailValue}>
                {application.vehicle_year} {application.vehicle_make} {application.vehicle_model}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>License Plate</Text>
              <Text style={styles.detailValue}>{application.license_plate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vehicle Type</Text>
              <Text style={styles.detailValue}>
                {application.vehicle_type.charAt(0).toUpperCase() + application.vehicle_type.slice(1)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Documents */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          
          <View style={styles.documentsCard}>
            {[
              { key: 'license_uploaded', name: 'Driver\'s License', required: true },
              { key: 'insurance_uploaded', name: 'Insurance Certificate', required: true },
              { key: 'vehicle_registration_uploaded', name: 'Vehicle Registration', required: true },
            ].map((doc) => {
              const isUploaded = application.documents?.[doc.key] || false;
              return (
                <View key={doc.key} style={styles.documentRow}>
                  <View style={styles.documentInfo}>
                    <View style={[
                      styles.documentIcon,
                      { backgroundColor: isUploaded ? '#D1FAE5' : '#FEE2E2' }
                    ]}>
                      <FileText size={16} color={isUploaded ? '#10B981' : '#EF4444'} />
                    </View>
                    <View style={styles.documentText}>
                      <Text style={styles.documentName}>{doc.name}</Text>
                      <Text style={[
                        styles.documentStatus,
                        { color: isUploaded ? '#10B981' : '#EF4444' }
                      ]}>
                        {isUploaded ? 'Uploaded' : 'Required'}
                      </Text>
                    </View>
                  </View>
                  {!isUploaded && (
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => handleUploadDocument(doc.name)}
                    >
                      <Upload size={16} color="black" />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Notes */}
        {application.notes && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Review Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{application.notes}</Text>
            </View>
          </Animated.View>
        )}
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
  placeholder: {
    width: 40,
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
  noApplicationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noApplicationText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
  },
  applyButton: {
    backgroundColor: 'black',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  startDrivingButton: {
    backgroundColor: 'black',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startDrivingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  documentsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentText: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  documentStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  uploadButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, X, ThumbsUp, ThumbsDown, Car } from 'lucide-react-native';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, tips: string[]) => void;
  ride: any;
}

const quickTips = [
  'Great driving',
  'Clean car',
  'On time',
  'Friendly',
  'Safe ride',
  'Good music',
];

export default function RatingModal({ visible, onClose, onSubmit, ride }: RatingModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTips, setSelectedTips] = useState<string[]>([]);
  const [tip, setTip] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please provide a rating');
      return;
    }

    onSubmit(rating, comment, selectedTips);
    onClose();
    
    // Reset form
    setRating(5);
    setComment('');
    setSelectedTips([]);
    setTip('');
  };

  const toggleTip = (tipText: string) => {
    setSelectedTips(prev => 
      prev.includes(tipText) 
        ? prev.filter(t => t !== tipText)
        : [...prev, tipText]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Rate Your Trip</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Car Info */}
          <View style={styles.carSection}>
            <View style={styles.carAvatar}>
              <Car size={24} color="#FFFFFF" />
            </View>
            <View style={styles.carInfo}>
              <Text style={styles.carModel}>Toyota Camry</Text>
              <Text style={styles.driverName}>Driver: John Smith</Text>
              <Text style={styles.tripInfo}>
                {ride?.pickup_address} → {ride?.destination_address}
              </Text>
            </View>
          </View>

          {/* Rating Stars */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>How was your trip?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Star
                    size={32}
                    color={star <= rating ? '#FFD700' : '#E5E7EB'}
                    fill={star <= rating ? '#FFD700' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingText}>
              {rating === 5 ? 'Excellent!' : 
               rating === 4 ? 'Good' : 
               rating === 3 ? 'Okay' : 
               rating === 2 ? 'Poor' : 
               rating === 1 ? 'Terrible' : ''}
            </Text>
          </View>

          {/* Quick Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>What went well?</Text>
            <View style={styles.tipsContainer}>
              {quickTips.map((tipText) => (
                <TouchableOpacity
                  key={tipText}
                  style={[
                    styles.tipButton,
                    selectedTips.includes(tipText) && styles.tipButtonSelected,
                  ]}
                  onPress={() => toggleTip(tipText)}
                >
                  <Text
                    style={[
                      styles.tipText,
                      selectedTips.includes(tipText) && styles.tipTextSelected,
                    ]}
                  >
                    {tipText}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Comment */}
          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>Additional Comments (Optional)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Tell us more about your experience..."
              placeholderTextColor="#9CA3AF"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Tip Section */}
          <View style={styles.tipSection}>
            <Text style={styles.sectionTitle}>Add a tip for great service</Text>
            <View style={styles.tipOptions}>
              {['$2', '$5', '$10'].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.tipOption,
                    tip === amount && styles.tipOptionSelected,
                  ]}
                  onPress={() => setTip(tip === amount ? '' : amount)}
                >
                  <Text
                    style={[
                      styles.tipOptionText,
                      tip === amount && styles.tipOptionTextSelected,
                    ]}
                  >
                    {amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Rating</Text>
          </TouchableOpacity>
        </View>
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
  carSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  carAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  carInfo: {
    flex: 1,
  },
  carModel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  driverName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  tripInfo: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tipsSection: {
    marginBottom: 32,
  },
  tipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tipButtonSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: 'black',
  },
  tipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tipTextSelected: {
    color: 'black',
  },
  commentSection: {
    marginBottom: 32,
  },
  commentInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 80,
  },
  tipSection: {
    marginBottom: 32,
  },
  tipOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  tipOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  tipOptionSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: 'black',
  },
  tipOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  tipOptionTextSelected: {
    color: 'black',
  },
  submitButton: {
    backgroundColor: 'black',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
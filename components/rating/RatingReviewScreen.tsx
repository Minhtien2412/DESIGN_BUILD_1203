import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface RatingOption {
  id: string;
  label: string;
  icon: string;
}

const RATING_OPTIONS: RatingOption[] = [
  { id: 'service', label: 'Dịch vụ', icon: 'star' },
  { id: 'quality', label: 'Chất lượng', icon: 'checkmark-circle' },
  { id: 'speed', label: 'Tốc độ', icon: 'speedometer' },
  { id: 'attitude', label: 'Thái độ', icon: 'happy' },
];

const QUICK_COMMENTS = [
  'Thợ thân thiện',
  'Làm việc cẩn thận',
  'Đúng giờ',
  'Tay nghề tốt',
  'Chuyên nghiệp',
  'Nhiệt tình',
];

export default function RatingReviewScreen() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const scaleAnims = React.useRef(
    Array(5).fill(0).map(() => new Animated.Value(1))
  ).current;

  const worker = {
    name: 'Nguyễn Văn Thợ',
    avatar: 'https://i.pravatar.cc/150?img=12',
    specialty: 'Thợ Xây',
    workDays: 5,
    workDate: new Date(),
    workCost: 2500000,
  };

  const handleRating = (value: number) => {
    setRating(value);
    
    // Animate selected star
    Animated.sequence([
      Animated.timing(scaleAnims[value - 1], {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[value - 1], {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos([...photos, ...result.assets.map(asset => asset.uri)]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao đánh giá');
      return;
    }

    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Cảm ơn bạn!',
        'Đánh giá của bạn giúp chúng tôi cải thiện dịch vụ',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    }, 1500);
  };

  const getRatingLabel = () => {
    switch (rating) {
      case 1: return { text: 'Rất tệ', color: '#EF4444' };
      case 2: return { text: 'Tệ', color: '#F59E0B' };
      case 3: return { text: 'Bình thường', color: '#F59E0B' };
      case 4: return { text: 'Tốt', color: '#10B981' };
      case 5: return { text: 'Tuyệt vời', color: '#10B981' };
      default: return { text: 'Chọn đánh giá', color: '#6B7280' };
    }
  };

  const ratingLabel = getRatingLabel();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Worker Card */}
        <View style={styles.workerCard}>
          <Image source={{ uri: worker.avatar }} style={styles.workerAvatar} />
          <Text style={styles.workerName}>{worker.name}</Text>
          <Text style={styles.workerSpecialty}>
            {worker.specialty} • {worker.workDays} ngày làm việc
          </Text>
          <View style={styles.workInfo}>
            <Text style={styles.workCost}>
              {worker.workCost.toLocaleString('vi-VN')}đ
            </Text>
            <Text style={styles.workDate}>
              {worker.workDate.toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>

        {/* Rating Stars */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Bạn đánh giá thế nào?</Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleRating(star)}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={{
                    transform: [{ scale: scaleAnims[star - 1] }]
                  }}
                >
                  <Ionicons
                    name={star <= (hoveredRating || rating) ? 'star' : 'star-outline'}
                    size={48}
                    color={star <= (hoveredRating || rating) ? '#F59E0B' : '#D1D5DB'}
                  />
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.ratingLabel, { color: ratingLabel.color }]}>
            {ratingLabel.text}
          </Text>
        </View>

        {/* Rating Options */}
        {rating > 0 && (
          <>
            <View style={styles.optionsSection}>
              <Text style={styles.sectionTitle}>Đánh giá chi tiết</Text>
              <View style={styles.optionsGrid}>
                {RATING_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionChip,
                      selectedOptions.includes(option.id) && styles.optionChipSelected
                    ]}
                    onPress={() => toggleOption(option.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={selectedOptions.includes(option.id) ? '#0891B2' : '#6B7280'}
                    />
                    <Text
                      style={[
                        styles.optionLabel,
                        selectedOptions.includes(option.id) && styles.optionLabelSelected
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quick Comments */}
            <View style={styles.quickCommentsSection}>
              <Text style={styles.sectionTitle}>Nhận xét nhanh</Text>
              <View style={styles.quickCommentsGrid}>
                {QUICK_COMMENTS.map((quickComment, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickCommentChip}
                    onPress={() => setComment(prev =>
                      prev ? `${prev}, ${quickComment}` : quickComment
                    )}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickCommentText}>{quickComment}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Comment Input */}
            <View style={styles.commentSection}>
              <View style={styles.commentHeader}>
                <Text style={styles.sectionTitle}>Nhận xét thêm</Text>
                <Text style={styles.charCount}>{comment.length}/500</Text>
              </View>
              <TextInput
                style={styles.commentInput}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                maxLength={500}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />
            </View>

            {/* Photo Upload */}
            <View style={styles.photoSection}>
              <Text style={styles.sectionTitle}>Thêm ảnh (không bắt buộc)</Text>
              
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoGrid}
              >
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri: photo }} style={styles.photo} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                
                {photos.length < 5 && (
                  <TouchableOpacity
                    style={styles.addPhotoButton}
                    onPress={pickImage}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="camera" size={32} color="#6B7280" />
                    <Text style={styles.addPhotoText}>Thêm ảnh</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </>
        )}
      </ScrollView>

      {/* Submit Button */}
      {rating > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <Text style={styles.submitButtonText}>Đang gửi...</Text>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 48,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 16,
    marginBottom: 32,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
  },
  workerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  workerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  workerSpecialty: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 12,
  },
  workInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  workCost: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0891B2',
  },
  workDate: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 20,
    fontWeight: '700',
  },
  optionsSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  optionChipSelected: {
    backgroundColor: '#ECFEFF',
    borderColor: '#0891B2',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionLabelSelected: {
    color: '#0891B2',
  },
  quickCommentsSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  quickCommentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickCommentChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  quickCommentText: {
    fontSize: 14,
    color: '#1F2937',
  },
  commentSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  charCount: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  commentInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
  },
  photoSection: {
    paddingHorizontal: 16,
  },
  photoGrid: {
    gap: 12,
  },
  photoItem: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0891B2',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#0891B2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});

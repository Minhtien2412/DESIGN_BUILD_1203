import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const feedbackTypes = [
  { id: 'bug', icon: 'bug-outline', label: 'Báo lỗi', color: '#F44336' },
  { id: 'feature', icon: 'bulb-outline', label: 'Đề xuất tính năng', color: '#FF9800' },
  { id: 'improve', icon: 'trending-up-outline', label: 'Cải thiện', color: '#4CAF50' },
  { id: 'other', icon: 'chatbox-outline', label: 'Góp ý khác', color: '#2196F3' },
];

const ratings = [
  { value: 1, emoji: '😠', label: 'Rất tệ' },
  { value: 2, emoji: '😕', label: 'Tệ' },
  { value: 3, emoji: '😐', label: 'Bình thường' },
  { value: 4, emoji: '😊', label: 'Tốt' },
  { value: 5, emoji: '😍', label: 'Tuyệt vời' },
];

export default function FeedbackScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (!selectedType) {
      Alert.alert('Thông báo', 'Vui lòng chọn loại phản hồi');
      return;
    }
    if (!description) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung phản hồi');
      return;
    }

    Alert.alert(
      'Cảm ơn bạn!',
      'Phản hồi của bạn đã được ghi nhận. Chúng tôi sẽ xem xét và cải thiện.',
      [{ text: 'OK' }]
    );

    // Reset form
    setSelectedType(null);
    setRating(0);
    setTitle('');
    setDescription('');
    setEmail('');
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Góp ý & Phản hồi', headerShown: true }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Rating */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Bạn cảm thấy thế nào về ứng dụng?</Text>
          <View style={styles.ratingContainer}>
            {ratings.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[
                  styles.ratingItem,
                  rating === r.value && styles.ratingItemActive,
                ]}
                onPress={() => setRating(r.value)}
              >
                <Text style={styles.ratingEmoji}>{r.emoji}</Text>
                <Text style={[
                  styles.ratingLabel,
                  rating === r.value && styles.ratingLabelActive,
                ]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Feedback Type */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Loại phản hồi *</Text>
          <View style={styles.typesGrid}>
            {feedbackTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeItem,
                  { borderColor: selectedType === type.id ? type.color : '#ddd' },
                  selectedType === type.id && { backgroundColor: type.color + '10' },
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={28}
                  color={selectedType === type.id ? type.color : '#666'}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    { color: selectedType === type.id ? type.color : textColor },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Feedback Form */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Chi tiết phản hồi</Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Tiêu đề</Text>
            <TextInput
              style={[styles.input, { backgroundColor, color: textColor }]}
              placeholder="Tóm tắt ngắn gọn"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Nội dung *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor, color: textColor }]}
              placeholder="Mô tả chi tiết vấn đề hoặc đề xuất của bạn..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Email (để nhận phản hồi)</Text>
            <TextInput
              style={[styles.input, { backgroundColor, color: textColor }]}
              placeholder="your@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Attachment hint */}
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="attach" size={20} color="#666" />
            <Text style={styles.attachText}>Đính kèm ảnh chụp màn hình (tùy chọn)</Text>
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <View style={styles.submitContainer}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Ionicons name="paper-plane" size={20} color="#fff" />
            <Text style={styles.submitBtnText}>Gửi phản hồi</Text>
          </TouchableOpacity>
          <Text style={styles.privacyText}>
            Phản hồi của bạn sẽ được bảo mật và chỉ dùng để cải thiện ứng dụng.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { margin: 16, marginBottom: 0, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  ratingContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  ratingItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    opacity: 0.6,
  },
  ratingItemActive: { opacity: 1, backgroundColor: '#FFF3E0' },
  ratingEmoji: { fontSize: 32, marginBottom: 4 },
  ratingLabel: { fontSize: 11, color: '#666' },
  ratingLabelActive: { color: '#FF6B35', fontWeight: '500' },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeItem: {
    width: '47%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  typeLabel: { fontSize: 13, fontWeight: '500', marginTop: 8 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: { height: 140, paddingTop: 12 },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  attachText: { marginLeft: 8, color: '#666', fontSize: 14 },
  submitContainer: { padding: 16 },
  submitBtn: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  privacyText: { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 12 },
});

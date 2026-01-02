/**
 * Construction Progress - Review Project
 */
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReviewProjectScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [categories, setCategories] = useState({
    quality: 0,
    timeline: 0,
    communication: 0,
    budget: 0,
  });

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn đánh giá tổng thể');
      return;
    }
    Alert.alert('Thành công', 'Cảm ơn bạn đã đánh giá!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const StarRating = ({ value, onChange, size = 28 }: { value: number; onChange: (n: number) => void; size?: number }) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)}>
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={size}
            color={star <= value ? '#f59e0b' : '#ccc'}
            style={{ marginHorizontal: 2 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá dự án</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Rating */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Đánh giá tổng thể</Text>
          <View style={styles.overallRating}>
            <StarRating value={rating} onChange={setRating} size={36} />
            <Text style={styles.ratingText}>
              {rating === 0 ? 'Chọn đánh giá' : 
               rating === 5 ? 'Xuất sắc!' : 
               rating === 4 ? 'Rất tốt' : 
               rating === 3 ? 'Tốt' : 
               rating === 2 ? 'Tạm được' : 'Cần cải thiện'}
            </Text>
          </View>
        </View>

        {/* Category Ratings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Đánh giá chi tiết</Text>
          
          <View style={styles.categoryItem}>
            <Text style={styles.categoryLabel}>Chất lượng công trình</Text>
            <StarRating value={categories.quality} onChange={(n) => setCategories(prev => ({ ...prev, quality: n }))} size={22} />
          </View>
          
          <View style={styles.categoryItem}>
            <Text style={styles.categoryLabel}>Tiến độ hoàn thành</Text>
            <StarRating value={categories.timeline} onChange={(n) => setCategories(prev => ({ ...prev, timeline: n }))} size={22} />
          </View>
          
          <View style={styles.categoryItem}>
            <Text style={styles.categoryLabel}>Giao tiếp & hỗ trợ</Text>
            <StarRating value={categories.communication} onChange={(n) => setCategories(prev => ({ ...prev, communication: n }))} size={22} />
          </View>
          
          <View style={styles.categoryItem}>
            <Text style={styles.categoryLabel}>Chi phí hợp lý</Text>
            <StarRating value={categories.budget} onChange={(n) => setCategories(prev => ({ ...prev, budget: n }))} size={22} />
          </View>
        </View>

        {/* Review Text */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nhận xét của bạn</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Chia sẻ trải nghiệm của bạn về dự án này..."
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Ionicons name="bulb-outline" size={20} color="#f59e0b" />
          <Text style={styles.tipsText}>
            Đánh giá chi tiết giúp nhà thầu cải thiện dịch vụ và hỗ trợ khách hàng khác lựa chọn tốt hơn.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Gửi đánh giá</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 16 },
  overallRating: { alignItems: 'center' },
  starsRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, color: '#666', marginTop: 8 },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryLabel: { fontSize: 14, color: '#333' },
  reviewInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#000',
    minHeight: 120,
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  tipsText: { flex: 1, fontSize: 13, color: '#92400e', lineHeight: 18 },
  bottomBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitBtn: {
    backgroundColor: '#EE4D2D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

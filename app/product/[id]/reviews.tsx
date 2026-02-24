import { Container } from '@/components/ui/container';
import { Loader } from '@/components/ui/loader';
import { RatingStars } from '@/components/ui/rating-stars';
import { Review, ReviewCard } from '@/components/ui/review-card';
import ReviewService, {
    Review as ApiReview,
    MOCK_REVIEWS as FALLBACK_REVIEWS
} from '@/services/reviewService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Transform API review to component format
function transformToComponentReview(item: ApiReview): Review {
  return {
    id: item.id,
    userId: item.productId || 'user',
    userName: item.userName || 'Người dùng',
    userAvatar: item.userAvatar,
    rating: item.rating,
    comment: item.comment,
    images: item.images?.map(img => img.url),
    createdAt: item.createdAt,
    helpful: item.helpfulCount || 0,
    verified: item.isVerifiedPurchase || false,
  };
}

// Fallback mock data
const MOCK_REVIEWS: Review[] = FALLBACK_REVIEWS.map(transformToComponentReview);

export default function ReviewsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const productId = params.id as string;

  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('mock');

  // Fetch reviews from API
  const fetchReviews = useCallback(async (showLoading = true) => {
    if (!productId) return;
    if (showLoading) setLoading(true);
    try {
      const result = await ReviewService.getProductReviews(productId);
      if (result.ok && result.data?.reviews) {
        setReviews(result.data.reviews.map(transformToComponentReview));
        setDataSource('api');
      } else {
        setReviews(MOCK_REVIEWS);
        setDataSource('mock');
      }
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      setReviews(MOCK_REVIEWS);
      setDataSource('mock');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReviews(false);
  }, [fetchReviews]);
  // Calculate stats
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100,
  }));

  const filteredReviews = reviews
    .filter(r => !filterRating || r.rating === filterRating)
    .sort((a, b) => {
      if (sortBy === 'helpful') return b.helpful - a.helpful;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleSubmitReview = async () => {
    if (!newComment.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {
      const result = await ReviewService.createReview({
        productId,
        rating: newRating,
        comment: newComment,
      });

      if (result.ok && result.data) {
        const newReview = transformToComponentReview(result.data);
        setReviews([newReview, ...reviews]);
      } else {
        // Fallback: add locally
        const review: Review = {
          id: Date.now().toString(),
          userId: 'current-user',
          userName: 'Bạn',
          rating: newRating,
          comment: newComment,
          createdAt: new Date().toISOString(),
          helpful: 0,
          verified: true,
        };
        setReviews([review, ...reviews]);
      }
      
      setNewComment('');
      setNewRating(5);
      setShowWriteReview(false);
      Alert.alert('Thành công', 'Đánh giá của bạn đã được gửi!');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi đánh giá. Vui lòng thử lại.');
    }
  };

  const renderWriteReview = () => (
    <View style={styles.writeReview}>
      <Text style={styles.writeTitle}>Viết đánh giá</Text>
      <View style={styles.ratingInput}>
        <Text style={styles.inputLabel}>Đánh giá của bạn:</Text>
        <RatingStars
          rating={newRating}
          size={32}
          editable
          onRatingChange={setNewRating}
        />
      </View>
      <View style={styles.commentInput}>
        <Text style={styles.inputLabel}>Nhận xét:</Text>
        <TextInput
          style={styles.textInput}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      <View style={styles.submitRow}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setShowWriteReview(false)}
        >
          <Text style={styles.cancelBtnText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitReview}>
          <Text style={styles.submitBtnText}>Gửi đánh giá</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Container style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Đánh giá sản phẩm</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <Loader text="Đang tải đánh giá..." />
      ) : (
      <FlatList
        data={filteredReviews}
        renderItem={({ item }) => <ReviewCard review={item} />}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View>
            {/* Data Source Indicator */}
            {dataSource === 'mock' && (
              <View style={styles.mockBanner}>
                <Ionicons name="information-circle" size={16} color="#92400E" />
                <Text style={styles.mockBannerText}>📋 Dữ liệu mẫu</Text>
              </View>
            )}

            {/* Rating Summary */}
            <View style={styles.summary}>
              <View style={styles.summaryLeft}>
                <Text style={styles.avgRating}>{avgRating.toFixed(1)}</Text>
                <RatingStars rating={avgRating} size={20} />
                <Text style={styles.totalReviews}>
                  {reviews.length} đánh giá
                </Text>
              </View>
              <View style={styles.summaryRight}>
                {ratingDistribution.map(item => (
                  <TouchableOpacity
                    key={item.rating}
                    style={styles.ratingBar}
                    onPress={() =>
                      setFilterRating(filterRating === item.rating ? null : item.rating)
                    }
                  >
                    <Text style={styles.ratingLabel}>{item.rating}★</Text>
                    <View style={styles.barContainer}>
                      <View
                        style={[styles.barFill, { width: `${item.percentage}%` }]}
                      />
                    </View>
                    <Text style={styles.ratingCount}>{item.count}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Filters */}
            <View style={styles.filters}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.filterChip, !filterRating && styles.filterChipActive]}
                  onPress={() => setFilterRating(null)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      !filterRating && styles.filterChipTextActive,
                    ]}
                  >
                    Tất cả
                  </Text>
                </TouchableOpacity>
                {[5, 4, 3, 2, 1].map(rating => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.filterChip,
                      filterRating === rating && styles.filterChipActive,
                    ]}
                    onPress={() => setFilterRating(rating)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filterRating === rating && styles.filterChipTextActive,
                      ]}
                    >
                      {rating}★
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Write Review Button */}
            {!showWriteReview && (
              <TouchableOpacity
                style={styles.writeBtn}
                onPress={() => setShowWriteReview(true)}
              >
                <Ionicons name="create-outline" size={20} color="#0D9488" />
                <Text style={styles.writeBtnText}>Viết đánh giá của bạn</Text>
              </TouchableOpacity>
            )}

            {showWriteReview && renderWriteReview()}

            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>
                {filteredReviews.length} đánh giá
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setSortBy(sortBy === 'recent' ? 'helpful' : 'recent')
                }
              >
                <Text style={styles.sortText}>
                  {sortBy === 'recent' ? 'Mới nhất' : 'Hữu ích'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D9488',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    marginBottom: 8,
  },
  backBtn: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  summary: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    gap: 20,
  },
  summaryLeft: {
    alignItems: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  avgRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  totalReviews: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  summaryRight: {
    flex: 1,
    gap: 4,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingLabel: {
    fontSize: 13,
    color: '#666',
    width: 30,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FFB800',
  },
  ratingCount: {
    fontSize: 12,
    color: '#999',
    width: 25,
    textAlign: 'right',
  },
  filters: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0D9488',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  writeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0D9488',
  },
  writeReview: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  writeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  ratingInput: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  commentInput: {
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
  },
  submitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0D9488',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  mockBannerText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
  },
  reviewsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  sortText: {
    fontSize: 13,
    color: '#0D9488',
  },
});

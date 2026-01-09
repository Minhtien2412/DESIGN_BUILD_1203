import { useThemeColor } from '@/hooks/use-theme-color';
import ReviewService, {
    Review as ApiReview,
    MOCK_REVIEWS as FALLBACK_REVIEWS,
} from '@/services/reviewService';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  comment: string;
  date: string;
  images: string[];
  response?: {
    text: string;
    date: string;
  };
}

// Transform function
function transformReview(item: ApiReview): Review {
  return {
    id: item.id,
    productId: item.productId || '',
    productName: item.productName || 'Sản phẩm',
    productImage: item.productImage || 'https://placehold.co/200x200/0066CC/white?text=Product',
    rating: item.rating,
    comment: item.comment,
    date: item.createdAt,
    images: item.images?.map(img => img.url) || [],
    response: item.response ? {
      text: item.response.content,
      date: item.response.createdAt,
    } : undefined,
  };
}

// Fallback mock
const MOCK_REVIEWS: Review[] = FALLBACK_REVIEWS.map(transformReview);

export default function ReviewsScreen() {
  const bg = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 5 | 4 | 3 | 2 | 1>('all');
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('mock');

  // Fetch reviews from API
  const fetchReviews = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const result = await ReviewService.getMyReviews();
      if (result.ok && result.data?.reviews) {
        setReviews(result.data.reviews.map(transformReview));
        setDataSource('api');
      } else {
        setReviews(MOCK_REVIEWS);
        setDataSource('mock');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews(MOCK_REVIEWS);
      setDataSource('mock');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReviews(false);
  }, [fetchReviews]);

  const filters = [
    { key: 'all' as const, label: 'Tất cả', count: reviews.length },
    { key: 5 as const, label: '5 sao', count: reviews.filter(r => r.rating === 5).length },
    { key: 4 as const, label: '4 sao', count: reviews.filter(r => r.rating === 4).length },
    { key: 3 as const, label: '3 sao', count: reviews.filter(r => r.rating === 3).length },
  ];

  const filteredReviews = selectedFilter === 'all'
    ? reviews
    : reviews.filter(r => r.rating === selectedFilter);

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? '#FFB800' : textMuted}
          />
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={[styles.reviewCard, { backgroundColor: surface, borderColor: border }]}>
      {/* Product Info */}
      <TouchableOpacity
        style={styles.productInfo}
        onPress={() => router.push(`/product/${item.productId}` as Href)}
      >
        <Image source={{ uri: item.productImage }} style={styles.productImage} />
        <View style={styles.productDetails}>
          <Text style={[styles.productName, { color: text }]} numberOfLines={2}>
            {item.productName}
          </Text>
          {renderStars(item.rating)}
        </View>
        <Ionicons name="chevron-forward" size={20} color={textMuted} />
      </TouchableOpacity>

      {/* Review Content */}
      <View style={[styles.reviewContent, { borderTopColor: border }]}>
        <View style={styles.reviewHeader}>
          <Text style={[styles.reviewDate, { color: textMuted }]}>
            {new Date(item.date).toLocaleDateString('vi-VN')}
          </Text>
        </View>

        <Text style={[styles.reviewComment, { color: text }]}>
          {item.comment}
        </Text>

        {/* Review Images */}
        {item.images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesContainer}
          >
            {item.images.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.reviewImage} />
            ))}
          </ScrollView>
        )}

        {/* Shop Response */}
        {item.response && (
          <View style={[styles.responseContainer, { backgroundColor: `${primary}10`, borderColor: primary }]}>
            <View style={styles.responseHeader}>
              <Ionicons name="storefront" size={16} color={primary} />
              <Text style={[styles.responseLabel, { color: primary }]}>
                Phản hồi từ shop
              </Text>
              <Text style={[styles.responseDate, { color: textMuted }]}>
                {new Date(item.response.date).toLocaleDateString('vi-VN')}
              </Text>
            </View>
            <Text style={[styles.responseText, { color: text }]}>
              {item.response.text}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="star-outline" size={80} color={textMuted} />
      <Text style={[styles.emptyTitle, { color: text }]}>Chưa có đánh giá</Text>
      <Text style={[styles.emptySubtitle, { color: textMuted }]}>
        Hãy mua sắm và đánh giá sản phẩm nhé!
      </Text>
    </View>
  );

  if (loading) {
    return <Loader text="Đang tải đánh giá..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Stack.Screen
        options={{
          title: 'Đánh giá của tôi',
          headerShown: true,
        }}
      />

      {/* Data Source Indicator */}
      {dataSource === 'mock' && (
        <View style={[styles.mockBanner, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="information-circle" size={16} color="#92400E" />
          <Text style={styles.mockBannerText}>📋 Dữ liệu mẫu - API đang cập nhật</Text>
        </View>
      )}

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.filtersContainer, { backgroundColor: surface }]}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              { borderColor: border },
              selectedFilter === filter.key && { backgroundColor: primary, borderColor: primary },
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                { color: selectedFilter === filter.key ? '#fff' : text },
              ]}
            >
              {filter.label}
            </Text>
            {filter.count > 0 && (
              <View
                style={[
                  styles.filterBadge,
                  { backgroundColor: selectedFilter === filter.key ? '#fff' : primary },
                ]}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    { color: selectedFilter === filter.key ? primary : '#fff' },
                  ]}
                >
                  {filter.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Reviews List */}
      <FlatList
        data={filteredReviews}
        keyExtractor={item => item.id}
        renderItem={renderReviewItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  mockBannerText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '500',
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersContent: {
    padding: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  reviewCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productDetails: {
    flex: 1,
    gap: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewContent: {
    padding: 12,
    borderTopWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 13,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  imagesContainer: {
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  responseContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  responseLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  responseDate: {
    fontSize: 12,
  },
  responseText: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});

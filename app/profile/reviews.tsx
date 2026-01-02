import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, Stack } from 'expo-router';
import { useState } from 'react';
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

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Xi măng PCB40 - Bao 50kg',
    productImage: 'https://picsum.photos/200/200?random=1',
    rating: 5,
    comment: 'Sản phẩm chất lượng tốt, giao hàng nhanh. Sẽ ủng hộ shop lần sau.',
    date: '2025-11-10',
    images: ['https://picsum.photos/300/300?random=11', 'https://picsum.photos/300/300?random=12'],
    response: {
      text: 'Cảm ơn bạn đã ủng hộ shop!',
      date: '2025-11-11',
    },
  },
  {
    id: '2',
    productId: '2',
    productName: 'Gạch ốp lát Viglacera 60x60',
    productImage: 'https://picsum.photos/200/200?random=2',
    rating: 4,
    comment: 'Gạch đẹp, màu sắc như hình. Hơi lâu ship.',
    date: '2025-11-05',
    images: [],
  },
  {
    id: '3',
    productId: '3',
    productName: 'Sơn Dulux 5L',
    productImage: 'https://picsum.photos/200/200?random=3',
    rating: 5,
    comment: 'Sơn tốt, phủ kín, không mùi. Rất hài lòng!',
    date: '2025-10-28',
    images: ['https://picsum.photos/300/300?random=13'],
  },
];

export default function ReviewsScreen() {
  const bg = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 5 | 4 | 3 | 2 | 1>('all');

  const filters = [
    { key: 'all' as const, label: 'Tất cả', count: MOCK_REVIEWS.length },
    { key: 5 as const, label: '5 sao', count: 2 },
    { key: 4 as const, label: '4 sao', count: 1 },
    { key: 3 as const, label: '3 sao', count: 0 },
  ];

  const filteredReviews = selectedFilter === 'all'
    ? MOCK_REVIEWS
    : MOCK_REVIEWS.filter(r => r.rating === selectedFilter);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

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

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Stack.Screen
        options={{
          title: 'Đánh giá của tôi',
          headerShown: true,
        }}
      />

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

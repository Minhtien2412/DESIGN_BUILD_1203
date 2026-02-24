/**
 * Product Reviews Screen - Shopee Style
 * Hiển thị tất cả đánh giá của một sản phẩm
 *
 * @created 2026-02-04
 *
 * Features:
 * - Rating summary with stars breakdown
 * - Filter tabs: Tất cả, 5 Sao, 4 Sao, 3 Sao, Có hình ảnh, Có bình luận
 * - Review list with images, helpful votes
 * - Sort options
 * - Infinite scroll / Load more
 */

import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Shopee Colors
const SHOPEE_COLORS = {
  primary: "#0D9488",
  primaryLight: "#14B8A6",
  background: "#F5F5F5",
  surface: "#FFFFFF",
  text: "#000000",
  textSecondary: "#757575",
  textTertiary: "#BDBDBD",
  border: "#E0E0E0",
  divider: "#EEEEEE",
  star: "#FFCE3D",
  success: "#00BFA5",
};

type FilterKey =
  | "all"
  | "5"
  | "4"
  | "3"
  | "2"
  | "1"
  | "with_images"
  | "with_comment";

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  images: string[];
  variant?: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  shopReply?: {
    content: string;
    date: string;
  };
}

interface RatingSummary {
  average: number;
  total: number;
  breakdown: { [key: number]: number };
}

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "5", label: "5 Sao" },
  { key: "4", label: "4 Sao" },
  { key: "3", label: "3 Sao" },
  { key: "with_images", label: "Có hình ảnh" },
  { key: "with_comment", label: "Có bình luận" },
];

// Mock Data
const MOCK_SUMMARY: RatingSummary = {
  average: 4.8,
  total: 1256,
  breakdown: { 5: 956, 4: 215, 3: 58, 2: 18, 1: 9 },
};

const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    userId: "u1",
    userName: "Nguyễn Văn A",
    userAvatar: "https://i.pravatar.cc/100?img=1",
    rating: 5,
    comment:
      "Sản phẩm rất tốt, đúng như mô tả. Giao hàng nhanh chóng, đóng gói cẩn thận. Sẽ ủng hộ shop tiếp!",
    images: [
      "https://picsum.photos/200/200?random=r1",
      "https://picsum.photos/200/200?random=r2",
      "https://picsum.photos/200/200?random=r3",
    ],
    variant: "Đen, L",
    createdAt: "2026-02-01",
    likes: 128,
    isLiked: false,
    shopReply: {
      content:
        "Cảm ơn bạn đã ủng hộ shop! Chúc bạn có trải nghiệm tuyệt vời với sản phẩm ❤️",
      date: "2026-02-02",
    },
  },
  {
    id: "2",
    userId: "u2",
    userName: "Trần Thị B",
    userAvatar: "https://i.pravatar.cc/100?img=2",
    rating: 4,
    comment:
      "Chất lượng ổn, giá hợp lý. Giao hàng hơi chậm nhưng chấp nhận được.",
    images: [],
    variant: "Trắng, M",
    createdAt: "2026-01-28",
    likes: 45,
    isLiked: true,
  },
  {
    id: "3",
    userId: "u3",
    userName: "Lê Văn C",
    userAvatar: "https://i.pravatar.cc/100?img=3",
    rating: 5,
    comment: "Mua lần 2 rồi, rất hài lòng! Shop tư vấn nhiệt tình.",
    images: ["https://picsum.photos/200/200?random=r4"],
    variant: "Xanh, XL",
    createdAt: "2026-01-25",
    likes: 89,
    isLiked: false,
  },
  {
    id: "4",
    userId: "u4",
    userName: "Phạm Văn D",
    userAvatar: "https://i.pravatar.cc/100?img=4",
    rating: 3,
    comment: "Sản phẩm tạm được, không quá xuất sắc nhưng cũng không tệ.",
    images: [],
    createdAt: "2026-01-20",
    likes: 12,
    isLiked: false,
  },
  {
    id: "5",
    userId: "u5",
    userName: "Hoàng Thị E",
    userAvatar: "https://i.pravatar.cc/100?img=5",
    rating: 5,
    comment:
      "Xuất sắc! Đây là lần thứ 3 mua ở shop, luôn hài lòng về chất lượng và dịch vụ.",
    images: [
      "https://picsum.photos/200/200?random=r5",
      "https://picsum.photos/200/200?random=r6",
    ],
    variant: "Đỏ, S",
    createdAt: "2026-01-15",
    likes: 234,
    isLiked: true,
    shopReply: {
      content:
        "Shop rất vui khi được bạn tin tưởng! Hẹn gặp lại bạn trong những đơn hàng tiếp theo nhé 🎉",
      date: "2026-01-16",
    },
  },
];

export default function ProductReviewsScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const insets = useSafeAreaInsets();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  // Load reviews
  const loadReviews = useCallback(
    async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 600));
        setSummary(MOCK_SUMMARY);
        setReviews(MOCK_REVIEWS);
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [productId],
  );

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReviews(false);
  }, [loadReviews]);

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    switch (activeFilter) {
      case "5":
        return r.rating === 5;
      case "4":
        return r.rating === 4;
      case "3":
        return r.rating === 3;
      case "2":
        return r.rating === 2;
      case "1":
        return r.rating === 1;
      case "with_images":
        return r.images.length > 0;
      case "with_comment":
        return r.comment.length > 0;
      default:
        return true;
    }
  });

  const handleLikeReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              isLiked: !r.isLiked,
              likes: r.isLiked ? r.likes - 1 : r.likes + 1,
            }
          : r,
      ),
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Render Rating Summary
  const renderSummary = () => {
    if (!summary) return null;

    return (
      <View style={styles.summarySection}>
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryRating}>{summary.average.toFixed(1)}</Text>
          <Text style={styles.summaryMax}>/5</Text>
        </View>
        <View style={styles.summaryRight}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={
                  star <= Math.floor(summary.average)
                    ? "star"
                    : star - summary.average < 1
                      ? "star-half"
                      : "star-outline"
                }
                size={18}
                color={SHOPEE_COLORS.star}
              />
            ))}
          </View>
          <Text style={styles.summaryTotal}>
            {summary.total.toLocaleString()} đánh giá
          </Text>
        </View>
        <View style={styles.breakdownSection}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.breakdown[star] || 0;
            const percent =
              summary.total > 0 ? (count / summary.total) * 100 : 0;
            return (
              <View key={star} style={styles.breakdownRow}>
                <Text style={styles.breakdownStar}>{star}</Text>
                <Ionicons name="star" size={12} color={SHOPEE_COLORS.star} />
                <View style={styles.breakdownBar}>
                  <View
                    style={[styles.breakdownFill, { width: `${percent}%` }]}
                  />
                </View>
                <Text style={styles.breakdownCount}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Render Filter Tab
  const renderFilterTab = ({
    key,
    label,
  }: {
    key: FilterKey;
    label: string;
  }) => {
    const isActive = activeFilter === key;
    let count = 0;
    if (key === "all") count = reviews.length;
    else if (["5", "4", "3", "2", "1"].includes(key))
      count = summary?.breakdown[parseInt(key)] || 0;
    else if (key === "with_images")
      count = reviews.filter((r) => r.images.length > 0).length;
    else if (key === "with_comment")
      count = reviews.filter((r) => r.comment.length > 0).length;

    return (
      <TouchableOpacity
        key={key}
        style={[styles.filterTab, isActive && styles.filterTabActive]}
        onPress={() => setActiveFilter(key)}
      >
        <Text
          style={[styles.filterTabText, isActive && styles.filterTabTextActive]}
        >
          {label} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  // Render Review Item
  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewItem}>
      {/* User Info */}
      <View style={styles.userRow}>
        <Image source={{ uri: item.userAvatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.userName}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= item.rating ? "star" : "star-outline"}
                size={14}
                color={SHOPEE_COLORS.star}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Meta */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
        {item.variant && (
          <Text style={styles.metaText}> | Phân loại: {item.variant}</Text>
        )}
      </View>

      {/* Comment */}
      <Text style={styles.commentText}>{item.comment}</Text>

      {/* Images */}
      {item.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesScroll}
        >
          {item.images.map((img, idx) => (
            <TouchableOpacity key={idx} style={styles.imageWrapper}>
              <Image source={{ uri: img }} style={styles.reviewImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Shop Reply */}
      {item.shopReply && (
        <View style={styles.shopReply}>
          <View style={styles.shopReplyHeader}>
            <Text style={styles.shopReplyLabel}>Phản hồi của Shop</Text>
            <Text style={styles.shopReplyDate}>
              {formatDate(item.shopReply.date)}
            </Text>
          </View>
          <Text style={styles.shopReplyText}>{item.shopReply.content}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => handleLikeReview(item.id)}
        >
          <Ionicons
            name={item.isLiked ? "thumbs-up" : "thumbs-up-outline"}
            size={16}
            color={
              item.isLiked ? SHOPEE_COLORS.primary : SHOPEE_COLORS.textSecondary
            }
          />
          <Text
            style={[styles.likeText, item.isLiked && styles.likeTextActive]}
          >
            Hữu ích ({item.likes})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Empty State
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="chatbubble-ellipses-outline"
        size={64}
        color={SHOPEE_COLORS.textTertiary}
      />
      <Text style={styles.emptyTitle}>Chưa có đánh giá</Text>
      <Text style={styles.emptyDesc}>
        Hãy là người đầu tiên đánh giá sản phẩm này!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={SHOPEE_COLORS.primary}
      />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SHOPEE_COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredReviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReview}
          ListHeaderComponent={
            <>
              {renderSummary()}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersScroll}
                contentContainerStyle={styles.filtersContent}
              >
                {FILTER_TABS.map(renderFilterTab)}
              </ScrollView>
            </>
          }
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[SHOPEE_COLORS.primary]}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SHOPEE_COLORS.background },

  // Header
  header: {
    backgroundColor: SHOPEE_COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },

  // Loading
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // List
  listContent: { paddingBottom: 20 },
  separator: { height: 8 },

  // Summary
  summarySection: {
    backgroundColor: SHOPEE_COLORS.surface,
    padding: 16,
    marginBottom: 8,
  },
  summaryLeft: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  summaryRating: {
    fontSize: 36,
    fontWeight: "700",
    color: SHOPEE_COLORS.primary,
  },
  summaryMax: { fontSize: 18, color: SHOPEE_COLORS.primary, marginLeft: 2 },
  summaryRight: { marginBottom: 16 },
  starsRow: { flexDirection: "row", gap: 2 },
  summaryTotal: {
    fontSize: 13,
    color: SHOPEE_COLORS.textSecondary,
    marginTop: 4,
  },
  breakdownSection: { gap: 6 },
  breakdownRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  breakdownStar: {
    fontSize: 12,
    color: SHOPEE_COLORS.textSecondary,
    width: 12,
  },
  breakdownBar: {
    flex: 1,
    height: 6,
    backgroundColor: SHOPEE_COLORS.divider,
    borderRadius: 3,
    overflow: "hidden",
  },
  breakdownFill: {
    height: "100%",
    backgroundColor: SHOPEE_COLORS.primary,
    borderRadius: 3,
  },
  breakdownCount: {
    fontSize: 12,
    color: SHOPEE_COLORS.textSecondary,
    width: 40,
    textAlign: "right",
  },

  // Filters
  filtersScroll: { backgroundColor: SHOPEE_COLORS.surface, marginBottom: 8 },
  filtersContent: { paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: SHOPEE_COLORS.border,
    marginRight: 8,
  },
  filterTabActive: {
    borderColor: SHOPEE_COLORS.primary,
    backgroundColor: "#FFF5F5",
  },
  filterTabText: { fontSize: 13, color: SHOPEE_COLORS.textSecondary },
  filterTabTextActive: { color: SHOPEE_COLORS.primary, fontWeight: "500" },

  // Review Item
  reviewItem: { backgroundColor: SHOPEE_COLORS.surface, padding: 16 },
  userRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  userAvatar: { width: 40, height: 40, borderRadius: 20 },
  userInfo: { marginLeft: 12 },
  userName: {
    fontSize: 14,
    fontWeight: "500",
    color: SHOPEE_COLORS.text,
    marginBottom: 4,
  },
  metaRow: { flexDirection: "row", marginBottom: 8 },
  metaText: { fontSize: 12, color: SHOPEE_COLORS.textTertiary },
  commentText: {
    fontSize: 14,
    color: SHOPEE_COLORS.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  imagesScroll: { marginBottom: 12 },
  imageWrapper: { marginRight: 8 },
  reviewImage: { width: 80, height: 80, borderRadius: 4 },

  // Shop Reply
  shopReply: {
    backgroundColor: SHOPEE_COLORS.background,
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
  },
  shopReplyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  shopReplyLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: SHOPEE_COLORS.primary,
  },
  shopReplyDate: { fontSize: 11, color: SHOPEE_COLORS.textTertiary },
  shopReplyText: { fontSize: 13, color: SHOPEE_COLORS.text, lineHeight: 18 },

  // Actions
  actionsRow: { flexDirection: "row" },
  likeButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  likeText: { fontSize: 13, color: SHOPEE_COLORS.textSecondary },
  likeTextActive: { color: SHOPEE_COLORS.primary },

  // Empty
  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: SHOPEE_COLORS.text,
    marginTop: 16,
  },
  emptyDesc: { fontSize: 14, color: SHOPEE_COLORS.textSecondary, marginTop: 8 },
});

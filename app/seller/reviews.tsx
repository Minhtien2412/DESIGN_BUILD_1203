/**
 * Seller Reviews Management - Shopee/TikTok Style
 * Quản lý đánh giá của người mua
 */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types
interface Review {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  userId: number;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  images?: string[];
  reply?: string;
  repliedAt?: string;
  createdAt: string;
  isAnonymous: boolean;
}

interface ReviewStats {
  total: number;
  average: number;
  pending: number;
  replied: number;
  byRating: {
    [key: number]: number;
  };
}

type FilterType = "all" | "pending" | "replied" | "5" | "4" | "3" | "2" | "1";

export default function SellerReviewsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    average: 0,
    pending: 0,
    replied: 0,
    byRating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [filter, setFilter] = useState<FilterType>("all");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      // In production, call real API
      // const response = await apiFetch('/seller/reviews', { params: { filter } });

      // Mock data
      setStats({
        total: 156,
        average: 4.7,
        pending: 8,
        replied: 148,
        byRating: { 5: 112, 4: 28, 3: 10, 2: 4, 1: 2 },
      });

      setReviews([
        {
          id: 1,
          productId: 101,
          productName: "Thiết kế biệt thự hiện đại 3 tầng",
          productImage:
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200",
          userId: 201,
          userName: "Nguyễn Văn A",
          userAvatar: "https://i.pravatar.cc/150?img=1",
          rating: 5,
          comment:
            "Thiết kế rất đẹp và chuyên nghiệp. Kiến trúc sư tư vấn nhiệt tình, đúng yêu cầu. Rất hài lòng với dịch vụ!",
          images: [
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300",
          ],
          createdAt: "2024-01-15T08:30:00Z",
          isAnonymous: false,
        },
        {
          id: 2,
          productId: 102,
          productName: "Thiết kế nội thất phòng khách",
          productImage:
            "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=200",
          userId: 202,
          userName: "Trần Thị B",
          userAvatar: "https://i.pravatar.cc/150?img=2",
          rating: 4,
          comment:
            "Thiết kế đẹp, giao đúng hẹn. Chỉ có điều giá hơi cao so với thị trường.",
          reply:
            "Cảm ơn bạn đã đánh giá. Chúng tôi sẽ cố gắng đưa ra mức giá cạnh tranh hơn!",
          repliedAt: "2024-01-14T10:00:00Z",
          createdAt: "2024-01-14T06:00:00Z",
          isAnonymous: false,
        },
        {
          id: 3,
          productId: 103,
          productName: "Bản vẽ xây dựng nhà phố 4 tầng",
          productImage:
            "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=200",
          userId: 203,
          userName: "Khách hàng",
          userAvatar: "",
          rating: 5,
          comment:
            "Bản vẽ chi tiết, đầy đủ thông số kỹ thuật. Shop rất chuyên nghiệp!",
          createdAt: "2024-01-13T14:20:00Z",
          isAnonymous: true,
        },
        {
          id: 4,
          productId: 104,
          productName: "Tư vấn phong thủy",
          productImage:
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200",
          userId: 204,
          userName: "Lê Văn C",
          userAvatar: "https://i.pravatar.cc/150?img=4",
          rating: 3,
          comment: "Tư vấn khá ổn nhưng thời gian phản hồi hơi lâu.",
          createdAt: "2024-01-12T09:15:00Z",
          isAnonymous: false,
        },
        {
          id: 5,
          productId: 105,
          productName: "Thiết kế cảnh quan sân vườn",
          productImage:
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200",
          userId: 205,
          userName: "Phạm Thị D",
          userAvatar: "https://i.pravatar.cc/150?img=5",
          rating: 5,
          comment:
            "Tuyệt vời! Sân vườn sau khi thi công y hệt bản thiết kế. Rất chuyên nghiệp.",
          images: [
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300",
            "https://images.unsplash.com/photo-1598902108854-10e335adac99?w=300",
          ],
          reply:
            "Cảm ơn bạn rất nhiều! Chúng tôi rất vui khi bạn hài lòng với thiết kế.",
          repliedAt: "2024-01-11T16:00:00Z",
          createdAt: "2024-01-11T11:30:00Z",
          isAnonymous: false,
        },
      ]);
    } catch (error) {
      console.error("[SellerReviews] Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  // Submit reply
  const handleSubmitReply = async (reviewId: number) => {
    if (!replyText.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung phản hồi");
      return;
    }

    try {
      // In production: await apiFetch(`/seller/reviews/${reviewId}/reply`, { method: 'POST', body: { reply: replyText } });

      // Update local state
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, reply: replyText, repliedAt: new Date().toISOString() }
            : r,
        ),
      );

      setReplyingTo(null);
      setReplyText("");
      Alert.alert("Thành công", "Đã gửi phản hồi!");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi phản hồi");
    }
  };

  // Render stars
  const renderStars = (rating: number, size = 14) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color={star <= rating ? "#FBBF24" : "#D1D5DB"}
          />
        ))}
      </View>
    );
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    if (filter === "all") return true;
    if (filter === "pending") return !review.reply;
    if (filter === "replied") return !!review.reply;
    return review.rating === parseInt(filter);
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ trả lời" },
    { key: "replied", label: "Đã trả lời" },
    { key: "5", label: "5⭐" },
    { key: "4", label: "4⭐" },
    { key: "3", label: "3⭐" },
    { key: "2", label: "2⭐" },
    { key: "1", label: "1⭐" },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#14B8A6"]}
          />
        }
      >
        {/* Stats Header */}
        <LinearGradient
          colors={["#14B8A6", "#FF8C5A"]}
          style={styles.statsHeader}
        >
          <View style={styles.mainRating}>
            <Text style={styles.ratingNumber}>{stats.average.toFixed(1)}</Text>
            <View style={styles.ratingStars}>
              {renderStars(Math.round(stats.average), 20)}
              <Text style={styles.totalReviews}>{stats.total} đánh giá</Text>
            </View>
          </View>

          <View style={styles.ratingBars}>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.byRating[rating] || 0;
              const percentage =
                stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <View key={rating} style={styles.ratingBarRow}>
                  <Text style={styles.ratingLabel}>{rating}⭐</Text>
                  <View style={styles.ratingBarBg}>
                    <View
                      style={[
                        styles.ratingBarFill,
                        { width: `${percentage}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.ratingCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatNumber}>{stats.pending}</Text>
            <Text style={styles.quickStatLabel}>Chờ trả lời</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatNumber}>{stats.replied}</Text>
            <Text style={styles.quickStatLabel}>Đã trả lời</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatNumber}>
              {stats.total > 0
                ? ((stats.replied / stats.total) * 100).toFixed(0)
                : 0}
              %
            </Text>
            <Text style={styles.quickStatLabel}>Tỷ lệ phản hồi</Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((f) => (
            <Pressable
              key={f.key}
              style={[
                styles.filterChip,
                filter === f.key && styles.activeFilterChip,
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === f.key && styles.activeFilterChipText,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {filteredReviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Không có đánh giá nào</Text>
            </View>
          ) : (
            filteredReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                {/* User Info */}
                <View style={styles.reviewHeader}>
                  <Image
                    source={{
                      uri: review.isAnonymous
                        ? "https://i.pravatar.cc/150"
                        : review.userAvatar,
                    }}
                    style={styles.userAvatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {review.isAnonymous
                        ? "Khách hàng ẩn danh"
                        : review.userName}
                    </Text>
                    <View style={styles.ratingDateRow}>
                      {renderStars(review.rating)}
                      <Text style={styles.reviewDate}>
                        {formatDate(review.createdAt)}
                      </Text>
                    </View>
                  </View>
                  {!review.reply && (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingText}>Chờ trả lời</Text>
                    </View>
                  )}
                </View>

                {/* Product Info */}
                <View style={styles.productInfoRow}>
                  <Image
                    source={{ uri: review.productImage }}
                    style={styles.productThumb}
                  />
                  <Text style={styles.productName} numberOfLines={1}>
                    {review.productName}
                  </Text>
                </View>

                {/* Comment */}
                <Text style={styles.reviewComment}>{review.comment}</Text>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.reviewImages}
                  >
                    {review.images.map((img, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: img }}
                        style={styles.reviewImage}
                      />
                    ))}
                  </ScrollView>
                )}

                {/* Reply */}
                {review.reply ? (
                  <View style={styles.replyBox}>
                    <View style={styles.replyHeader}>
                      <Ionicons name="arrow-undo" size={14} color="#14B8A6" />
                      <Text style={styles.replyLabel}>Phản hồi của bạn</Text>
                    </View>
                    <Text style={styles.replyText}>{review.reply}</Text>
                  </View>
                ) : replyingTo === review.id ? (
                  <View style={styles.replyInputBox}>
                    <TextInput
                      style={styles.replyInput}
                      placeholder="Nhập phản hồi của bạn..."
                      value={replyText}
                      onChangeText={setReplyText}
                      multiline
                    />
                    <View style={styles.replyActions}>
                      <Pressable
                        style={styles.cancelReplyBtn}
                        onPress={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                      >
                        <Text style={styles.cancelReplyText}>Hủy</Text>
                      </Pressable>
                      <Pressable
                        style={styles.submitReplyBtn}
                        onPress={() => handleSubmitReply(review.id)}
                      >
                        <Text style={styles.submitReplyText}>Gửi</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    style={styles.replyButton}
                    onPress={() => setReplyingTo(review.id)}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={16}
                      color="#14B8A6"
                    />
                    <Text style={styles.replyButtonText}>Trả lời</Text>
                  </Pressable>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statsHeader: {
    flexDirection: "row",
    padding: 20,
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
  },
  mainRating: {
    alignItems: "center",
    marginRight: 24,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  ratingStars: {
    alignItems: "center",
  },
  starsRow: {
    flexDirection: "row",
  },
  totalReviews: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  ratingBars: {
    flex: 1,
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    width: 32,
  },
  ratingBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    marginHorizontal: 8,
  },
  ratingBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: "#FFFFFF",
    width: 28,
    textAlign: "right",
  },
  quickStats: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    margin: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
  },
  quickStatItem: {
    flex: 1,
    alignItems: "center",
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  quickStatLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activeFilterChip: {
    backgroundColor: "#14B8A6",
    borderColor: "#14B8A6",
  },
  filterChipText: {
    fontSize: 13,
    color: "#6B7280",
  },
  activeFilterChipText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  reviewsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 12,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  ratingDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 8,
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pendingText: {
    fontSize: 11,
    color: "#D97706",
    fontWeight: "500",
  },
  productInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  productThumb: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  productName: {
    flex: 1,
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  reviewImages: {
    marginTop: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "#F3F4F6",
  },
  replyBox: {
    backgroundColor: "#FFF5F2",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#14B8A6",
    marginLeft: 6,
  },
  replyText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#14B8A6",
    borderRadius: 8,
  },
  replyButtonText: {
    fontSize: 13,
    color: "#14B8A6",
    marginLeft: 6,
    fontWeight: "500",
  },
  replyInputBox: {
    marginTop: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
  },
  replyInput: {
    fontSize: 14,
    color: "#1F2937",
    minHeight: 60,
    textAlignVertical: "top",
  },
  replyActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 8,
  },
  cancelReplyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
  cancelReplyText: {
    fontSize: 13,
    color: "#6B7280",
  },
  submitReplyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#14B8A6",
  },
  submitReplyText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

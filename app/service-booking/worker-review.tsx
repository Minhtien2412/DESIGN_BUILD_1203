/**
 * Worker Review Profile Screen
 * Shows worker profile with review badges, rating breakdown, reviews list
 * Vua Thợ-style worker profile with "Đặt ngay" CTA
 */

import {
    getWorkerById,
    getWorkerReviews,
    type WorkerReview,
} from "@/services/workers.api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// REVIEW BADGES
// ============================================================================
const REVIEW_BADGES = [
  {
    id: 1,
    label: "Đúng giờ",
    icon: "clock-check-outline" as const,
    color: "#FFC107",
    bgColor: "#FFF8E1",
    count: 3,
  },
  {
    id: 2,
    label: "Sạch sẽ",
    icon: "spray-bottle" as const,
    color: "#2196F3",
    bgColor: "#E3F2FD",
    count: 4,
  },
  {
    id: 3,
    label: "Cẩn thận",
    icon: "shield-check" as const,
    color: "#4CAF50",
    bgColor: "#E8F5E9",
    count: 4,
  },
  {
    id: 4,
    label: "Giá hợp lý",
    icon: "cash-check" as const,
    color: "#FF9800",
    bgColor: "#FFF3E0",
    count: 4,
  },
  {
    id: 5,
    label: "Chuyên nghiệp",
    icon: "star-check" as const,
    color: "#9C27B0",
    bgColor: "#F3E5F5",
    count: 3,
  },
];

// ============================================================================
// MOCK REVIEWS
// ============================================================================
const MOCK_REVIEWS = [
  {
    id: "r1",
    avatar: "https://i.pravatar.cc/100?img=20",
    rating: 5,
    orderCode: "63125",
    comment: "Làm rất nhanh và sạch sẽ, giá hợp lý",
    date: "20/02/2026",
  },
  {
    id: "r2",
    avatar: "https://i.pravatar.cc/100?img=25",
    rating: 5,
    orderCode: "63282",
    comment: "Thợ đúng giờ, tận tâm với công việc",
    date: "18/02/2026",
  },
  {
    id: "r3",
    avatar: "https://i.pravatar.cc/100?img=30",
    rating: 5,
    orderCode: "62891",
    comment: "Rất hài lòng, sẽ đặt lại lần sau",
    date: "15/02/2026",
  },
  {
    id: "r4",
    avatar: "https://i.pravatar.cc/100?img=35",
    rating: 4,
    orderCode: "62450",
    comment: "Tốt, có chút trễ giờ nhưng làm kỹ",
    date: "10/02/2026",
  },
  {
    id: "r5",
    avatar: "https://i.pravatar.cc/100?img=40",
    rating: 5,
    orderCode: "61990",
    comment: "Chuyên nghiệp, tư vấn nhiệt tình",
    date: "05/02/2026",
  },
  {
    id: "r6",
    avatar: "https://i.pravatar.cc/100?img=45",
    rating: 5,
    orderCode: "61555",
    comment: "",
    date: "01/02/2026",
  },
  {
    id: "r7",
    avatar: "https://i.pravatar.cc/100?img=50",
    rating: 5,
    orderCode: "61200",
    comment: "Máy lạnh chạy mát hơn hẳn",
    date: "28/01/2026",
  },
  {
    id: "r8",
    avatar: "https://i.pravatar.cc/100?img=55",
    rating: 5,
    orderCode: "60800",
    comment: "",
    date: "25/01/2026",
  },
  {
    id: "r9",
    avatar: "https://i.pravatar.cc/100?img=60",
    rating: 5,
    orderCode: "60400",
    comment: "Giá rẻ hơn nhiều so với tiệm",
    date: "20/01/2026",
  },
  {
    id: "r10",
    avatar: "https://i.pravatar.cc/100?img=65",
    rating: 5,
    orderCode: "60100",
    comment: "",
    date: "18/01/2026",
  },
  {
    id: "r11",
    avatar: "https://i.pravatar.cc/100?img=70",
    rating: 1,
    orderCode: "59700",
    comment: "Không hài lòng",
    date: "10/01/2026",
  },
];

// ============================================================================
// UNIFIED REVIEW VIEW MODEL
// ============================================================================
interface ReviewItem {
  id: string;
  avatar: string;
  rating: number;
  orderCode: string;
  comment: string;
  date: string;
}

function apiReviewToViewModel(r: WorkerReview): ReviewItem {
  return {
    id: r.id,
    avatar: `https://i.pravatar.cc/100?u=${r.userId}`,
    rating: r.rating,
    orderCode: r.id.slice(-5),
    comment: r.comment || "",
    date: new Date(r.createdAt).toLocaleDateString("vi-VN"),
  };
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function WorkerReviewScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    avatar: string;
    orders: string;
    completionRate: string;
    rating: string;
    price: string;
  }>();

  const workerName = params.name || "Thợ";
  const workerAvatar = params.avatar || "https://i.pravatar.cc/150?img=11";
  const orders = parseInt(params.orders || "47", 10);
  const completionRate = parseInt(params.completionRate || "49", 10);
  const rating = parseFloat(params.rating || "4.7");
  const price = parseInt(params.price || "150000", 10);

  const [reviews, setReviews] = useState<ReviewItem[]>(
    MOCK_REVIEWS.map((r) => ({ ...r })),
  );
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [workerRating, setWorkerRating] = useState(rating);
  const [workerOrders, setWorkerOrders] = useState(orders);

  // Fetch real reviews from API
  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoadingReviews(true);
      try {
        // Fetch worker details + reviews in parallel
        const [workerRes, reviewsRes] = await Promise.allSettled([
          getWorkerById(params.id),
          getWorkerReviews(params.id),
        ]);

        if (!cancelled) {
          if (workerRes.status === "fulfilled") {
            setWorkerRating(workerRes.value.rating);
            setWorkerOrders(workerRes.value.completedJobs);
          }
          if (
            reviewsRes.status === "fulfilled" &&
            reviewsRes.value.data.length > 0
          ) {
            setReviews(reviewsRes.value.data.map(apiReviewToViewModel));
          }
          // If API returns empty, keep mock data
        }
      } catch {
        // API unavailable — keep mock data
      } finally {
        if (!cancelled) setLoadingReviews(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const formatPrice = (p: number) => p.toLocaleString("vi-VN") + "đ";

  // Calculate rating distribution from current reviews
  const ratingDistribution = {
    5: reviews.filter((r: ReviewItem) => r.rating === 5).length,
    4: reviews.filter((r: ReviewItem) => r.rating === 4).length,
    3: reviews.filter((r: ReviewItem) => r.rating === 3).length,
    2: reviews.filter((r: ReviewItem) => r.rating === 2).length,
    1: reviews.filter((r: ReviewItem) => r.rating === 1).length,
  };
  const totalReviews = reviews.length;
  const maxRatingCount = Math.max(...Object.values(ratingDistribution));

  const handleBookNow = useCallback(() => {
    router.push(
      `/service-booking/schedule?workerId=${params.id}&name=${encodeURIComponent(workerName)}&price=${price}&avatar=${encodeURIComponent(workerAvatar)}&categoryLabel=${encodeURIComponent("Dịch vụ")}` as Href,
    );
  }, [params.id, workerName, price, workerAvatar]);

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < count ? "star" : "star-outline"}
        size={14}
        color="#FFC107"
      />
    ));
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={s.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Worker Header */}
        <LinearGradient colors={["#3F51B5", "#5C6BC0"]} style={s.profileHeader}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={s.profileInfo}>
            <Image source={{ uri: workerAvatar }} style={s.profileAvatar} />
            <View style={s.profileTextContainer}>
              <Text style={s.profileName}>{workerName}</Text>
              <Text style={s.profileStats}>• Đơn dịch vụ: {orders}</Text>
              <Text style={s.profileStats}>
                • Tỉ lệ hoàn thành: {completionRate}%
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Review Badges */}
        <View style={s.badgesSection}>
          <Text style={s.sectionTitle}>Đánh Giá Từ Khách Hàng</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.badgesScroll}
          >
            {REVIEW_BADGES.map((badge) => (
              <View key={badge.id} style={s.badgeCard}>
                <View
                  style={[s.badgeIconBg, { backgroundColor: badge.bgColor }]}
                >
                  <MaterialCommunityIcons
                    name={badge.icon as any}
                    size={32}
                    color={badge.color}
                  />
                  <View style={s.badgeCount}>
                    <Text style={s.badgeCountText}>{badge.count}</Text>
                  </View>
                </View>
                <Text style={s.badgeLabel}>{badge.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Rating Breakdown */}
        <View style={s.ratingSection}>
          <View style={s.ratingOverview}>
            {/* Left: Average */}
            <View style={s.ratingAverage}>
              <Text style={s.ratingNumber}>{rating.toFixed(1)}</Text>
              <View style={s.ratingStars}>
                {renderStars(Math.round(rating))}
              </View>
              <Text style={s.ratingTotal}>{totalReviews} phản hồi</Text>
            </View>

            {/* Right: Bars */}
            <View style={s.ratingBars}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count =
                  ratingDistribution[star as keyof typeof ratingDistribution];
                const barWidth =
                  maxRatingCount > 0 ? (count / maxRatingCount) * 100 : 0;
                return (
                  <View key={star} style={s.ratingBarRow}>
                    <Text style={s.ratingBarLabel}>{star}</Text>
                    <View style={s.ratingBarBg}>
                      <View
                        style={[
                          s.ratingBarFill,
                          {
                            width: `${barWidth}%`,
                            backgroundColor:
                              star >= 4
                                ? "#4CAF50"
                                : star === 3
                                  ? "#FFC107"
                                  : "#F44336",
                          },
                        ]}
                      />
                    </View>
                    <Text style={s.ratingBarCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Reviews List */}
        <View style={s.reviewsSection}>
          <Text style={s.sectionTitle}>Phản Hồi Tiêu Biểu</Text>
          {loadingReviews ? (
            <ActivityIndicator
              size="small"
              color="#FFC107"
              style={{ paddingVertical: 20 }}
            />
          ) : (
            reviews.slice(0, 5).map((review: ReviewItem) => (
              <View key={review.id} style={s.reviewCard}>
                <View style={s.reviewHeader}>
                  <Image
                    source={{ uri: review.avatar }}
                    style={s.reviewAvatar}
                  />
                  <View style={s.reviewInfo}>
                    <View style={s.reviewStars}>
                      {renderStars(review.rating)}
                    </View>
                    <Text style={s.reviewOrderCode}>
                      Mã dịch vụ: {review.orderCode}
                    </Text>
                  </View>
                </View>
                {review.comment ? (
                  <Text style={s.reviewComment}>{review.comment}</Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <View style={s.bottomPriceRow}>
          <Text style={s.bottomPriceLabel}>
            Giá chốt{" "}
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={14}
              color="#999"
            />
          </Text>
          <Text style={s.bottomPrice}>{formatPrice(price)}</Text>
        </View>
        <TouchableOpacity style={s.bookNowButton} onPress={handleBookNow}>
          <Text style={s.bookNowText}>Đặt ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },

  // Profile Header
  profileHeader: {
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "#E0E0E0",
  },
  profileTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },
  profileStats: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },

  // Badges
  badgesSection: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#333",
    marginBottom: 16,
  },
  badgesScroll: {
    gap: 12,
    paddingRight: 16,
  },
  badgeCard: {
    alignItems: "center",
    width: 80,
  },
  badgeIconBg: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badgeCount: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeCountText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    marginTop: 6,
    textAlign: "center",
  },

  // Rating
  ratingSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  ratingOverview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  ratingAverage: {
    alignItems: "center",
    width: 80,
    marginRight: 20,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFC107",
  },
  ratingStars: {
    flexDirection: "row",
    marginTop: 4,
  },
  ratingTotal: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  ratingBars: {
    flex: 1,
    gap: 6,
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingBarLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    width: 14,
    textAlign: "center",
  },
  ratingBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F0F0F0",
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  ratingBarCount: {
    fontSize: 12,
    color: "#999",
    width: 20,
    textAlign: "right",
  },

  // Reviews
  reviewsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
  },
  reviewInfo: {
    marginLeft: 12,
    flex: 1,
  },
  reviewStars: {
    flexDirection: "row",
  },
  reviewOrderCode: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 13,
    color: "#666",
    marginTop: 8,
    lineHeight: 18,
  },

  // Bottom Bar
  bottomBar: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bottomPriceLabel: {
    fontSize: 14,
    color: "#666",
  },
  bottomPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4CAF50",
  },
  bookNowButton: {
    backgroundColor: "#FFC107",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  bookNowText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
});

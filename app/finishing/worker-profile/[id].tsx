/**
 * Worker Profile - Hồ sơ thợ chi tiết
 * Route: /finishing/worker-profile/[id]
 * Data: API via workers.api.ts (getWorkerById, getWorkerReviews)
 * @updated 2026-02-07
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColor } from "@/hooks/useThemeColor";
import {
    contactWorker,
    formatDailyRate,
    getAvailabilityColor,
    getAvailabilityLabel,
    getWorkerById,
    getWorkerReviews,
    getWorkerTypeLabel,
    type Worker,
    type WorkerReview,
} from "@/services/workers.api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// HELPERS
// ============================================================================
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function renderStars(rating: number) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={
            star <= rating
              ? "star"
              : star - 0.5 <= rating
                ? "star-half"
                : "star-outline"
          }
          size={14}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

// ============================================================================
// REVIEW ITEM
// ============================================================================
function ReviewItem({ review }: { review: WorkerReview }) {
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "icon");

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatarBox}>
          <Text style={styles.reviewAvatarText}>
            {review.userName?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>
        <View style={styles.reviewHeaderInfo}>
          <Text style={[styles.reviewAuthor, { color: textColor }]}>
            {review.userName}
          </Text>
          <View style={styles.reviewMeta}>
            {renderStars(review.rating)}
            <Text style={[styles.reviewDate, { color: mutedColor }]}>
              {formatDate(review.createdAt)}
            </Text>
          </View>
        </View>
      </View>
      {review.comment ? (
        <Text style={[styles.reviewContent, { color: textColor }]}>
          {review.comment}
        </Text>
      ) : null}
      {review.images && review.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.reviewImagesRow}
        >
          {review.images.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={styles.reviewImage} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function WorkerProfileScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const workerId = params.id as string;

  const bg = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "icon");
  const cardBg = useThemeColor({}, "background");

  const [worker, setWorker] = useState<Worker | null>(null);
  const [reviews, setReviews] = useState<WorkerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "reviews">("info");
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [workerData, reviewsData] = await Promise.all([
        getWorkerById(workerId),
        getWorkerReviews(workerId).catch(() => ({
          data: [],
          meta: { total: 0 },
        })),
      ]);
      setWorker(workerData);
      setReviews(reviewsData.data);
    } catch (err: any) {
      console.warn("[WorkerProfile] Fetch error:", err);
      setError("Không thể tải thông tin. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [workerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleCall = useCallback(() => {
    if (worker?.phone) {
      Linking.openURL(`tel:${worker.phone.replace(/\s/g, "")}`);
    }
  }, [worker]);

  const handleMessage = useCallback(async () => {
    if (worker) {
      try {
        await contactWorker(worker.id, "Xin chào, tôi muốn tìm hiểu dịch vụ.");
        router.push(`/chat/index` as Href);
      } catch {
        // Fallback to SMS
        if (worker.phone) {
          Linking.openURL(`sms:${worker.phone.replace(/\s/g, "")}`);
        }
      }
    }
  }, [worker, router]);

  // Loading state
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: bg },
        ]}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={[styles.loadingText, { color: mutedColor }]}>
          Đang tải hồ sơ thợ...
        </Text>
      </View>
    );
  }

  // Error state
  if (error || !worker) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: bg },
        ]}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={[styles.errorText, { color: textColor }]}>
          {error || "Không tìm thấy thợ"}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
          <Text style={styles.retryBtnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const availColor = getAvailabilityColor(worker.availability);
  const availLabel = getAvailabilityLabel(worker.availability);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.container, { backgroundColor: bg }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0D9488"]}
              tintColor="#0D9488"
            />
          }
        >
          {/* Hero Header */}
          <LinearGradient
            colors={["#0D9488", "#0F766E"]}
            style={[styles.heroHeader, { paddingTop: insets.top + 8 }]}
          >
            {/* Back button */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.heroContent}>
              {/* Avatar */}
              <View style={styles.avatarContainer}>
                {worker.avatar ? (
                  <Image
                    source={{ uri: worker.avatar }}
                    style={styles.largeAvatar}
                  />
                ) : (
                  <View style={[styles.largeAvatar, styles.avatarPlaceholder]}>
                    <Ionicons name="person" size={40} color="#fff" />
                  </View>
                )}
                {worker.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#0D9488"
                    />
                  </View>
                )}
              </View>

              {/* Name & rating */}
              <Text style={styles.heroName}>{worker.name}</Text>
              <Text style={styles.heroType}>
                {getWorkerTypeLabel(worker.workerType)}
              </Text>

              <View style={styles.heroRating}>
                {renderStars(worker.rating)}
                <Text style={styles.heroRatingText}>
                  {worker.rating.toFixed(1)}
                </Text>
                <Text style={styles.heroReviewCount}>
                  ({worker.reviewCount} đánh giá)
                </Text>
              </View>

              {/* Availability badge */}
              <View
                style={[
                  styles.availBadge,
                  { backgroundColor: availColor + "30" },
                ]}
              >
                <View
                  style={[styles.availDot, { backgroundColor: availColor }]}
                />
                <Text style={[styles.availText, { color: availColor }]}>
                  {availLabel}
                </Text>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>
                  {worker.completedJobs}+
                </Text>
                <Text style={styles.heroStatLabel}>Công trình</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>
                  {worker.experience} năm
                </Text>
                <Text style={styles.heroStatLabel}>Kinh nghiệm</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>
                  {formatDailyRate(worker.dailyRate).replace("/ngày", "")}
                </Text>
                <Text style={styles.heroStatLabel}>/ ngày</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Action buttons */}
          <View style={[styles.actionRow, { backgroundColor: cardBg }]}>
            <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.callBtnText}>Gọi ngay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
              <Ionicons name="chatbubbles" size={20} color="#0D9488" />
              <Text style={styles.messageBtnText}>Nhắn tin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => router.push(`/worker-bookings/index` as Href)}
            >
              <Ionicons name="calendar" size={20} color="#0D9488" />
            </TouchableOpacity>
          </View>

          {/* Tab Switcher */}
          <View style={[styles.tabRow, { backgroundColor: cardBg }]}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "info" && styles.tabActive]}
              onPress={() => setActiveTab("info")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "info" && styles.tabTextActive,
                ]}
              >
                Thông tin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "reviews" && styles.tabActive]}
              onPress={() => setActiveTab("reviews")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "reviews" && styles.tabTextActive,
                ]}
              >
                Đánh giá ({reviews.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === "info" ? (
            <View style={styles.infoContent}>
              {/* Bio */}
              {worker.bio ? (
                <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
                  <Text style={[styles.infoCardTitle, { color: textColor }]}>
                    Giới thiệu
                  </Text>
                  <Text style={[styles.bioText, { color: mutedColor }]}>
                    {worker.bio}
                  </Text>
                </View>
              ) : null}

              {/* Skills */}
              {worker.skills?.length > 0 && (
                <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
                  <Text style={[styles.infoCardTitle, { color: textColor }]}>
                    Kỹ năng chuyên môn
                  </Text>
                  <View style={styles.skillsWrap}>
                    {worker.skills.map((skill, i) => (
                      <View key={i} style={styles.skillChip}>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color="#0D9488"
                        />
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Details */}
              <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
                <Text style={[styles.infoCardTitle, { color: textColor }]}>
                  Chi tiết
                </Text>
                <DetailRow
                  icon="location"
                  label="Khu vực"
                  value={
                    worker.district
                      ? `${worker.district}, ${worker.location}`
                      : worker.location
                  }
                />
                <DetailRow
                  icon="cash"
                  label="Giá ngày công"
                  value={formatDailyRate(worker.dailyRate)}
                  valueColor="#0D9488"
                />
                <DetailRow
                  icon="construct"
                  label="Có thiết bị"
                  value={worker.hasEquipment ? "Có" : "Không"}
                />
                <DetailRow
                  icon="call"
                  label="Điện thoại"
                  value={worker.phone}
                />
                {worker.featured && (
                  <DetailRow
                    icon="star"
                    label="Trạng thái"
                    value="⭐ Thợ nổi bật"
                    valueColor="#F59E0B"
                  />
                )}
              </View>
            </View>
          ) : (
            <View style={styles.reviewsContent}>
              {reviews.length === 0 ? (
                <View style={styles.emptyReviews}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={48}
                    color="#CBD5E1"
                  />
                  <Text style={[styles.emptyText, { color: mutedColor }]}>
                    Chưa có đánh giá nào
                  </Text>
                </View>
              ) : (
                reviews.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))
              )}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </>
  );
}

// ============================================================================
// DETAIL ROW Helper
// ============================================================================
function DetailRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  const mutedColor = useThemeColor({}, "icon");
  const textColor = useThemeColor({}, "text");

  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={18} color={mutedColor} />
      <Text style={[styles.detailLabel, { color: mutedColor }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: valueColor || textColor }]}>
        {value}
      </Text>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14, marginTop: 8 },
  errorText: { fontSize: 15, fontWeight: "500", marginTop: 8 },
  retryBtn: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  // Hero
  heroHeader: { paddingHorizontal: 16, paddingBottom: 20 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  heroContent: { alignItems: "center" },
  avatarContainer: { position: "relative", marginBottom: 12 },
  largeAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarPlaceholder: {
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 1,
  },
  heroName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.3,
  },
  heroType: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  heroRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  starsRow: { flexDirection: "row", gap: 1 },
  heroRatingText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  heroReviewCount: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  availBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginTop: 10,
  },
  availDot: { width: 8, height: 8, borderRadius: 4 },
  availText: { fontSize: 12, fontWeight: "600" },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
  },
  heroStatItem: { alignItems: "center", flex: 1 },
  heroStatValue: { fontSize: 16, fontWeight: "700", color: "#fff" },
  heroStatLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  // Actions
  actionRow: {
    flexDirection: "row",
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  callBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#0D9488",
    borderRadius: 10,
    paddingVertical: 12,
  },
  callBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  messageBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(13,148,136,0.1)",
    borderRadius: 10,
    paddingVertical: 12,
  },
  messageBtnText: { color: "#0D9488", fontSize: 14, fontWeight: "600" },
  bookBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "rgba(59,130,246,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  // Tabs
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#0D9488" },
  tabText: { fontSize: 14, fontWeight: "500", color: "#94A3B8" },
  tabTextActive: { color: "#0D9488", fontWeight: "600" },
  // Info content
  infoContent: { padding: 12, gap: 12 },
  infoCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  bioText: { fontSize: 13, lineHeight: 20 },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(13,148,136,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  skillText: { fontSize: 12, color: "#0D9488", fontWeight: "500" },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  detailLabel: { flex: 1, fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: "600" },
  // Reviews
  reviewsContent: { padding: 12, gap: 10 },
  reviewCard: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  reviewHeader: { flexDirection: "row", marginBottom: 10 },
  reviewAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  reviewHeaderInfo: { flex: 1, marginLeft: 10 },
  reviewAuthor: { fontSize: 14, fontWeight: "600" },
  reviewMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  reviewDate: { fontSize: 11 },
  reviewContent: { fontSize: 13, lineHeight: 19 },
  reviewImagesRow: { marginTop: 8 },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "#E2E8F0",
  },
  emptyReviews: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: { fontSize: 14 },
});

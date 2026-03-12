/**
 * Worker Booking Detail Screen
 * =============================
 * Shows worker profile and allows creating a booking/consultation request.
 * Fetches worker data from workers API, submits booking via labor service.
 */
import { useAuth } from "@/context/AuthContext";
import {
    laborService,
    type BookingRequest,
} from "@/services/api/labor.service";
import {
    formatDailyRate,
    getAvailabilityColor,
    getAvailabilityLabel,
    getWorkerById,
    getWorkerReviews,
    getWorkerTypeLabel,
    type Worker,
    type WorkerReview,
} from "@/services/workers.api";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const THEME = {
  primary: "#0D9488",
  bg: "#F8FAFB",
  card: "#FFFFFF",
  text: "#1A1A2E",
  textSec: "#6B7280",
  border: "#E5E7EB",
  error: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
  star: "#FBBF24",
};

export default function WorkerBookingScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [reviews, setReviews] = useState<WorkerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "reviews" | "booking">(
    "info",
  );

  // Booking form
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState(user?.name || "");
  const [contactPhone, setContactPhone] = useState(user?.phone || "");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [workerData, reviewData] = await Promise.all([
        getWorkerById(id),
        getWorkerReviews(id).catch(() => ({
          data: [] as WorkerReview[],
          meta: { total: 0 },
        })),
      ]);
      setWorker(workerData);
      setReviews(reviewData.data || []);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải thông tin thợ",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBook = useCallback(async () => {
    if (!worker || !id) return;
    if (!projectName.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên dự án/công việc");
      return;
    }
    if (!projectAddress.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập địa chỉ");
      return;
    }
    if (!contactPhone.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập số điện thoại liên hệ");
      return;
    }

    setSubmitting(true);
    try {
      const req: BookingRequest = {
        providerId: id,
        projectName: projectName.trim(),
        projectAddress: projectAddress.trim(),
        startDate,
        endDate: endDate || undefined,
        description: description.trim(),
        services: worker.skills || [],
        contactPhone: contactPhone.trim(),
        contactName: contactName.trim() || user?.name || "Khách hàng",
      };
      await laborService.requestBooking(req);
      Alert.alert(
        "Đặt thành công!",
        `Yêu cầu đặt ${worker.name} đã được gửi. Chúng tôi sẽ xác nhận sớm nhất.`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err instanceof Error ? err.message : "Không thể gửi yêu cầu đặt",
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    worker,
    id,
    projectName,
    projectAddress,
    description,
    contactName,
    contactPhone,
    startDate,
    endDate,
    user,
  ]);

  // ============================================================
  // Loading/Error
  // ============================================================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (error || !worker) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={THEME.error} />
        <Text style={styles.errorText}>{error || "Không tìm thấy thợ"}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
          <Text style={styles.retryBtnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const availColor = getAvailabilityColor(worker.availability);
  const availLabel = getAvailabilityLabel(worker.availability);

  // ============================================================
  // Sub renders
  // ============================================================

  const renderWorkerHeader = () => (
    <View style={styles.profileCard}>
      <View style={styles.profileTop}>
        <Image
          source={{
            uri:
              worker.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&size=120&background=0D9488&color=fff`,
          }}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.workerName}>{worker.name}</Text>
            {worker.verified && (
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={THEME.primary}
              />
            )}
          </View>
          <Text style={styles.workerType}>
            {getWorkerTypeLabel(worker.workerType)}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={THEME.star} />
            <Text style={styles.ratingText}>
              {worker.rating.toFixed(1)} ({worker.reviewCount} đánh giá)
            </Text>
          </View>
          <View style={styles.availBadge}>
            <View style={[styles.availDot, { backgroundColor: availColor }]} />
            <Text style={[styles.availText, { color: availColor }]}>
              {availLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{worker.experience}+</Text>
          <Text style={styles.statLabel}>Năm KN</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{worker.completedJobs}</Text>
          <Text style={styles.statLabel}>Việc đã làm</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: THEME.primary }]}>
            {formatDailyRate(worker.dailyRate)}
          </Text>
          <Text style={styles.statLabel}>Giá/ngày</Text>
        </View>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabRow}>
      {(
        [
          {
            key: "info",
            label: "Thông tin",
            icon: "information-circle-outline",
          },
          { key: "reviews", label: "Đánh giá", icon: "chatbubbles-outline" },
          { key: "booking", label: "Đặt lịch", icon: "calendar-outline" },
        ] as const
      ).map((tab) => {
        const active = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={active ? THEME.primary : THEME.textSec}
            />
            <Text style={[styles.tabText, active && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderInfoTab = () => (
    <View style={styles.tabContent}>
      {/* Bio */}
      {worker.bio && (
        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>Giới thiệu</Text>
          <Text style={styles.bioText}>{worker.bio}</Text>
        </View>
      )}

      {/* Skills */}
      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>Kỹ năng</Text>
        <View style={styles.skillsWrap}>
          {worker.skills.map((skill, i) => (
            <View key={i} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Details */}
      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>Chi tiết</Text>
        <View style={styles.detailCard}>
          <DetailRow
            icon="location-outline"
            label="Khu vực"
            value={`${worker.location}${worker.district ? `, ${worker.district}` : ""}`}
          />
          <DetailRow
            icon="build-outline"
            label="Thiết bị"
            value={worker.hasEquipment ? "Có mang theo" : "Không"}
          />
          <DetailRow
            icon="call-outline"
            label="Điện thoại"
            value={worker.phone}
          />
          <DetailRow
            icon="calendar-outline"
            label="Tham gia"
            value={new Date(worker.createdAt).toLocaleDateString("vi-VN")}
          />
        </View>
      </View>
    </View>
  );

  const renderReviewsTab = () => (
    <View style={styles.tabContent}>
      {reviews.length === 0 ? (
        <View style={styles.emptyReviews}>
          <Ionicons name="chatbubbles-outline" size={40} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
        </View>
      ) : (
        reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{review.userName}</Text>
              <View style={styles.reviewStars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < review.rating ? "star" : "star-outline"}
                    size={14}
                    color={THEME.star}
                  />
                ))}
              </View>
            </View>
            {review.comment && (
              <Text style={styles.reviewComment}>{review.comment}</Text>
            )}
            <Text style={styles.reviewDate}>
              {new Date(review.createdAt).toLocaleDateString("vi-VN")}
            </Text>
          </View>
        ))
      )}
    </View>
  );

  const renderBookingTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.formField}>
        <Text style={styles.formLabel}>
          Tên dự án/công việc <Text style={styles.req}>*</Text>
        </Text>
        <TextInput
          style={styles.formInput}
          value={projectName}
          onChangeText={setProjectName}
          placeholder="VD: Sửa điện phòng khách"
          placeholderTextColor={THEME.textSec}
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>
          Địa chỉ <Text style={styles.req}>*</Text>
        </Text>
        <TextInput
          style={styles.formInput}
          value={projectAddress}
          onChangeText={setProjectAddress}
          placeholder="Địa chỉ làm việc"
          placeholderTextColor={THEME.textSec}
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>Mô tả công việc</Text>
        <TextInput
          style={[styles.formInput, styles.formTextArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Mô tả chi tiết công việc cần làm..."
          placeholderTextColor={THEME.textSec}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.dateFields}>
        <View style={[styles.formField, { flex: 1 }]}>
          <Text style={styles.formLabel}>Ngày bắt đầu</Text>
          <TextInput
            style={styles.formInput}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={THEME.textSec}
          />
        </View>
        <View style={[styles.formField, { flex: 1 }]}>
          <Text style={styles.formLabel}>Ngày kết thúc</Text>
          <TextInput
            style={styles.formInput}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD (tuỳ chọn)"
            placeholderTextColor={THEME.textSec}
          />
        </View>
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>
          Tên liên hệ <Text style={styles.req}>*</Text>
        </Text>
        <TextInput
          style={styles.formInput}
          value={contactName}
          onChangeText={setContactName}
          placeholder="Họ và tên"
          placeholderTextColor={THEME.textSec}
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>
          Số điện thoại <Text style={styles.req}>*</Text>
        </Text>
        <TextInput
          style={styles.formInput}
          value={contactPhone}
          onChangeText={setContactPhone}
          placeholder="09xx xxx xxx"
          placeholderTextColor={THEME.textSec}
          keyboardType="phone-pad"
        />
      </View>

      {/* Cost estimate */}
      <View style={styles.costEstimate}>
        <Text style={styles.costLabel}>Ước tính chi phí mỗi ngày</Text>
        <Text style={styles.costValue}>
          {formatDailyRate(worker.dailyRate)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={THEME.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt thợ</Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert("Chia sẻ", `Chia sẻ thông tin ${worker.name}`)
          }
          style={styles.shareBtn}
        >
          <Ionicons name="share-social-outline" size={20} color={THEME.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 80 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderWorkerHeader()}
          {renderTabs()}

          {activeTab === "info" && renderInfoTab()}
          {activeTab === "reviews" && renderReviewsTab()}
          {activeTab === "booking" && renderBookingTab()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        {activeTab !== "booking" ? (
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => setActiveTab("booking")}
          >
            <Ionicons name="calendar" size={18} color="#FFF" />
            <Text style={styles.ctaBtnText}>Đặt lịch ngay</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.ctaBtn, submitting && { opacity: 0.6 }]}
            onPress={handleBook}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                <Text style={styles.ctaBtnText}>Gửi yêu cầu đặt</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Detail row helper
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={16} color={THEME.textSec} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: THEME.bg,
  },
  loadingText: {
    fontSize: 14,
    color: THEME.textSec,
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: THEME.error,
    marginTop: 12,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: THEME.text,
    marginLeft: 8,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.bg,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: {
    padding: 16,
  },

  // Profile card
  profileCard: {
    backgroundColor: THEME.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  profileTop: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: THEME.primary,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  workerName: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.text,
  },
  workerType: {
    fontSize: 13,
    color: THEME.primary,
    fontWeight: "500",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 13,
    color: THEME.textSec,
  },
  availBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  availDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.text,
  },
  statLabel: {
    fontSize: 11,
    color: THEME.textSec,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: THEME.border,
  },

  // Tabs
  tabRow: {
    flexDirection: "row",
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#F0FDFA",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: THEME.textSec,
  },
  tabTextActive: {
    color: THEME.primary,
    fontWeight: "600",
  },

  tabContent: {
    gap: 16,
  },

  // Info tab
  infoSection: {
    marginBottom: 4,
  },
  infoSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: THEME.text,
    lineHeight: 20,
    backgroundColor: THEME.card,
    padding: 14,
    borderRadius: 10,
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  skillText: {
    fontSize: 13,
    color: THEME.primary,
    fontWeight: "500",
  },
  detailCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: THEME.textSec,
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.text,
    flex: 1,
  },

  // Reviews tab
  emptyReviews: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: THEME.textSec,
    marginTop: 12,
  },
  reviewCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 1,
  },
  reviewComment: {
    fontSize: 13,
    color: THEME.text,
    lineHeight: 19,
    marginBottom: 6,
  },
  reviewDate: {
    fontSize: 11,
    color: THEME.textSec,
  },

  // Booking form
  formField: {
    marginBottom: 4,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 6,
  },
  req: {
    color: THEME.error,
  },
  formInput: {
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.text,
  },
  formTextArea: {
    minHeight: 72,
    paddingTop: 10,
  },
  dateFields: {
    flexDirection: "row",
    gap: 12,
  },
  costEstimate: {
    backgroundColor: "#F0FDFA",
    padding: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  costLabel: {
    fontSize: 13,
    color: THEME.primary,
  },
  costValue: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.primary,
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: THEME.card,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: THEME.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  ctaBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },
});

/**
 * Booking History Screen
 * Connected to BookingContext — shows real bookings from context + API.
 * Features: filter tabs, cancel, rebook, review, live-tracking navigation.
 */

import { useBooking, type ActiveBooking } from "@/context/BookingContext";
import { getCategoryLabel } from "@/data/service-categories";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  getApiStatusDisplay,
  trackingToApiStatus,
  type ApiBookingStatus,
} from "@/types/booking-status";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// ============================================================================
// Filter tabs
// ============================================================================

const FILTER_TABS: {
  id: string;
  label: string;
  apiStatus?: ApiBookingStatus;
}[] = [
  { id: "all", label: "Tất cả" },
  { id: "active", label: "Đang xử lý" },
  { id: "completed", label: "Hoàn thành" },
  { id: "cancelled", label: "Đã hủy" },
];

// ============================================================================
// Helpers
// ============================================================================

function formatPrice(price: number): string {
  if (price === 0) return "Miễn phí";
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}tr đ`;
  return price.toLocaleString("vi-VN") + "đ";
}

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

function isActiveBooking(booking: ActiveBooking): boolean {
  const s = booking.status;
  return s !== "COMPLETED" && s !== "CANCELLED";
}

// ============================================================================
// Screen
// ============================================================================

export default function BookingHistoryScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();

  const {
    activeBookings,
    loadingBookings,
    refreshBookings,
    cancelActiveBooking,
    clearCompletedBookings,
  } = useBooking();

  const [activeTab, setActiveTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Refresh from API on mount
  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshBookings();
    setRefreshing(false);
  }, [refreshBookings]);

  // Filter bookings by tab
  const filteredBookings = useMemo(() => {
    const sorted = [...activeBookings].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    switch (activeTab) {
      case "active":
        return sorted.filter(isActiveBooking);
      case "completed":
        return sorted.filter((b) => b.status === "COMPLETED");
      case "cancelled":
        return sorted.filter((b) => b.status === "CANCELLED");
      default:
        return sorted;
    }
  }, [activeBookings, activeTab]);

  // Count badges
  const activeBadge = useMemo(
    () => activeBookings.filter(isActiveBooking).length,
    [activeBookings],
  );

  // ─── Actions ───
  const handleCancel = useCallback(
    (booking: ActiveBooking) => {
      if (Platform.OS !== "web")
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert(
        "Hủy đơn",
        `Bạn có chắc muốn hủy đơn "${getCategoryLabel(booking.serviceCategory)}"?`,
        [
          { text: "Không" },
          {
            text: "Hủy đơn",
            style: "destructive",
            onPress: () => cancelActiveBooking(booking.id),
          },
        ],
      );
    },
    [cancelActiveBooking],
  );

  const handleReview = useCallback(
    (booking: ActiveBooking) => {
      router.push(
        `/service-booking/write-review?workerId=${booking.workerId}&workerName=${encodeURIComponent(booking.workerInfo.name)}&workerAvatar=${encodeURIComponent(booking.workerInfo.avatar || "")}&bookingId=${booking.id}&category=${encodeURIComponent(getCategoryLabel(booking.serviceCategory))}` as any,
      );
    },
    [router],
  );

  const handleTrack = useCallback(
    (booking: ActiveBooking) => {
      router.push(
        `/service-booking/live-tracking?bookingId=${booking.apiBookingId || booking.id}&workerId=${booking.workerId}&workerName=${encodeURIComponent(booking.workerInfo.name)}&workerAvatar=${encodeURIComponent(booking.workerInfo.avatar || "")}&workerPhone=${encodeURIComponent(booking.workerInfo.phone || "")}&category=${encodeURIComponent(booking.serviceCategory)}` as any,
      );
    },
    [router],
  );

  const handleRebook = useCallback(
    (booking: ActiveBooking) => {
      if (Platform.OS !== "web")
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(
        `/service-booking/booking-steps?category=${booking.serviceCategory}` as any,
      );
    },
    [router],
  );

  const handleClearHistory = useCallback(() => {
    Alert.alert("Xoá lịch sử", "Xoá tất cả đơn hoàn thành/đã hủy?", [
      { text: "Huỷ" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: () => clearCompletedBookings(),
      },
    ]);
  }, [clearCompletedBookings]);

  // ─── Render booking card ───
  const renderBooking = useCallback(
    ({ item }: { item: ActiveBooking }) => {
      const apiStatus = trackingToApiStatus(
        item.status.toLowerCase() as any,
      ) as ApiBookingStatus;
      const display = getApiStatusDisplay(
        apiStatus || (item.status as ApiBookingStatus),
      );
      const categoryLabel = getCategoryLabel(item.serviceCategory);

      return (
        <View style={[styles.bookingCard, { backgroundColor: cardBg }]}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View
              style={[styles.typeIcon, { backgroundColor: display.bgColor }]}
            >
              <Ionicons
                name={display.icon as any}
                size={22}
                color={display.color}
              />
            </View>
            <View style={styles.headerInfo}>
              <Text
                style={[styles.bookingTitle, { color: textColor }]}
                numberOfLines={1}
              >
                {categoryLabel}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: display.bgColor },
                ]}
              >
                <View
                  style={[styles.statusDot, { backgroundColor: display.color }]}
                />
                <Text style={[styles.statusText, { color: display.color }]}>
                  {display.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Worker Info */}
          <View style={styles.workerInfo}>
            <Image
              source={{
                uri:
                  item.workerInfo.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(item.workerInfo.name)}&background=0D9488&color=fff`,
              }}
              style={styles.workerAvatar}
            />
            <View style={styles.workerDetails}>
              <Text style={[styles.workerName, { color: textColor }]}>
                {item.workerInfo.name}
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#FFB800" />
                <Text style={styles.ratingText}>
                  {item.workerInfo.rating.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {formatDate(item.scheduledDate)}
              </Text>
              {item.scheduledTime && (
                <>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color="#666"
                    style={{ marginLeft: 16 }}
                  />
                  <Text style={styles.detailText}>{item.scheduledTime}</Text>
                </>
              )}
            </View>
            {item.notes && (
              <View style={styles.detailRow}>
                <Ionicons name="document-text-outline" size={16} color="#666" />
                <Text style={styles.detailText} numberOfLines={1}>
                  {item.notes}
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.priceLabel}>Chi phí</Text>
              <Text
                style={[
                  styles.priceValue,
                  item.price === 0 && { color: "#4CAF50" },
                ]}
              >
                {formatPrice(item.price)}
              </Text>
            </View>

            <View style={styles.footerActions}>
              {/* Active bookings: track + cancel */}
              {isActiveBooking(item) && (
                <>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.trackBtn]}
                    onPress={() => handleTrack(item)}
                  >
                    <Ionicons name="navigate" size={16} color="#fff" />
                    <Text style={styles.trackBtnText}>Theo dõi</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.cancelBtn]}
                    onPress={() => handleCancel(item)}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={16}
                      color="#F44336"
                    />
                  </TouchableOpacity>
                </>
              )}

              {/* Completed: review + rebook */}
              {item.status === "COMPLETED" && (
                <>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.reviewBtn]}
                    onPress={() => handleReview(item)}
                  >
                    <Ionicons name="star-outline" size={16} color="#0D9488" />
                    <Text style={styles.reviewBtnText}>Đánh giá</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rebookBtn]}
                    onPress={() => handleRebook(item)}
                  >
                    <Ionicons name="refresh" size={16} color="#fff" />
                    <Text style={styles.rebookBtnText}>Đặt lại</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Cancelled: rebook */}
              {item.status === "CANCELLED" && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rebookBtn]}
                  onPress={() => handleRebook(item)}
                >
                  <Ionicons name="refresh" size={16} color="#fff" />
                  <Text style={styles.rebookBtnText}>Đặt lại</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      );
    },
    [cardBg, textColor, handleCancel, handleReview, handleTrack, handleRebook],
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "Lịch sử đặt thợ",
          headerShown: true,
          headerRight: () =>
            activeBookings.some(
              (b) => b.status === "COMPLETED" || b.status === "CANCELLED",
            ) ? (
              <TouchableOpacity
                onPress={handleClearHistory}
                style={{ paddingHorizontal: 8 }}
              >
                <Ionicons name="trash-outline" size={20} color="#F44336" />
              </TouchableOpacity>
            ) : null,
        }}
      />

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: cardBg }]}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
            {tab.id === "active" && activeBadge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeBadge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading state */}
      {loadingBookings && activeBookings.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0D9488"]}
              tintColor="#0D9488"
            />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={[styles.emptyTitle, { color: textColor }]}>
            {activeTab === "all"
              ? "Chưa có đơn đặt thợ"
              : `Không có đơn ${FILTER_TABS.find((t) => t.id === activeTab)?.label?.toLowerCase()}`}
          </Text>
          <Text style={styles.emptyDesc}>
            Đặt thợ nhanh như gọi Grab ngay nào!
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.push("/find-workers" as any)}
          >
            <LinearGradient
              colors={["#0D9488", "#0F766E"]}
              style={styles.emptyBtnGrad}
            >
              <Ionicons name="search" size={18} color="#fff" />
              <Text style={styles.emptyBtnText}>Tìm thợ ngay</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFB" },
  tabsContainer: {
    flexDirection: "row",
    padding: 4,
    margin: 16,
    borderRadius: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  tabBtnActive: { backgroundColor: "#0D9488" },
  tabText: { color: "#6B7280", fontSize: 13, fontWeight: "500" },
  tabTextActive: { color: "#fff", fontWeight: "700" },
  badge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  listContent: { padding: 16, paddingTop: 0 },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#6B7280", marginTop: 8, fontSize: 14 },
  bookingCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: { flex: 1, marginLeft: 12 },
  bookingTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: "500" },
  workerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  workerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  workerDetails: { marginLeft: 12 },
  workerName: { fontSize: 14, fontWeight: "500" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  ratingText: { fontSize: 12, color: "#666", marginLeft: 4 },
  detailsSection: { marginBottom: 16 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  detailText: { color: "#666", fontSize: 13, marginLeft: 8, flex: 1 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: { color: "#999", fontSize: 11 },
  priceValue: {
    color: "#0D9488",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  footerActions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  cancelBtn: { borderWidth: 1, borderColor: "#F44336" },
  trackBtn: { backgroundColor: "#0D9488" },
  trackBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  reviewBtn: { borderWidth: 1, borderColor: "#0D9488" },
  reviewBtnText: { color: "#0D9488", fontSize: 13 },
  rebookBtn: { backgroundColor: "#3B82F6" },
  rebookBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  emptyDesc: { color: "#666", marginTop: 8, textAlign: "center" },
  emptyBtn: { marginTop: 20 },
  emptyBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

/**
 * Tracking History Screen - Lịch sử theo dõi lộ trình
 * Shows completed and past tracking sessions with route summary
 *
 * Features:
 * - Filter by date range, vehicle type, status
 * - Route summary per booking (distance, time, cost)
 * - Tap to view route replay
 * - Statistics summary (total trips, total distance, avg time)
 */

import {
    getTrackingStatusDisplay,
    type UnifiedTrackingStatus,
} from "@/types/booking-status";
import { formatDistance, formatTravelTime } from "@/utils/geo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useCallback, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// Colors
// ============================================================================
const C = {
  primary: "#0D9488",
  primaryLight: "#F0FDFA",
  accent: "#14B8A6",
  orange: "#FF6B00",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  blue: "#3B82F6",
  text: "#1A1A1A",
  textSec: "#666",
  textMuted: "#999",
  bg: "#F5F5F5",
  white: "#FFFFFF",
};

// ============================================================================
// Types
// ============================================================================
type VehicleType =
  | "motorbike"
  | "car"
  | "truck"
  | "concrete_mixer"
  | "crane"
  | "van";

interface TrackingHistoryItem {
  id: string;
  bookingId: string;
  workerName: string;
  workerAvatar?: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  status: UnifiedTrackingStatus;
  category: string;
  totalDistance: number; // km
  totalTime: number; // minutes
  totalPrice: number;
  startAddress: string;
  endAddress: string;
  date: string;
  startTime: string;
  endTime: string;
  rating?: number;
}

const VEHICLE_CONFIG: Record<
  VehicleType,
  { label: string; icon: string; color: string }
> = {
  motorbike: { label: "Xe máy", icon: "motorbike", color: "#3B82F6" },
  car: { label: "Ô tô", icon: "car", color: "#8B5CF6" },
  truck: { label: "Xe tải", icon: "truck", color: "#F59E0B" },
  concrete_mixer: {
    label: "Xe bê tông",
    icon: "truck-delivery",
    color: "#EF4444",
  },
  crane: { label: "Xe cẩu", icon: "crane", color: "#F97316" },
  van: { label: "Xe van", icon: "van-utility", color: "#6366F1" },
};

type FilterTab = "all" | "completed" | "cancelled";

// ============================================================================
// Mock data
// ============================================================================
const MOCK_HISTORY: TrackingHistoryItem[] = [
  {
    id: "h1",
    bookingId: "BK-2026-0280",
    workerName: "Nguyễn Văn Minh",
    vehicleType: "motorbike",
    vehiclePlate: "59A-111.22",
    status: "completed",
    category: "Thợ điện - Sửa bảng điện",
    totalDistance: 3.2,
    totalTime: 18,
    totalPrice: 450000,
    startAddress: "Trạm thợ Q.1",
    endAddress: "123 Nguyễn Huệ, Q.1",
    date: "05/03/2026",
    startTime: "09:15",
    endTime: "09:33",
    rating: 5,
  },
  {
    id: "h2",
    bookingId: "BK-2026-0275",
    workerName: "Trần Bê Tông A",
    vehicleType: "concrete_mixer",
    vehiclePlate: "51D-333.44",
    status: "completed",
    category: "Đổ bê tông sàn tầng 2",
    totalDistance: 12.5,
    totalTime: 52,
    totalPrice: 6500000,
    startAddress: "Trạm trộn BT Thủ Đức",
    endAddress: "Công trình 456 Điện Biên Phủ",
    date: "04/03/2026",
    startTime: "07:00",
    endTime: "07:52",
    rating: 4,
  },
  {
    id: "h3",
    bookingId: "BK-2026-0270",
    workerName: "Lê Cẩu Hưng",
    vehicleType: "crane",
    vehiclePlate: "51D-555.66",
    status: "completed",
    category: "Cẩu thép lên tầng 5",
    totalDistance: 5.8,
    totalTime: 35,
    totalPrice: 4200000,
    startAddress: "Bãi vật liệu Q.Bình Tân",
    endAddress: "789 Lý Tự Trọng, Q.1",
    date: "03/03/2026",
    startTime: "06:30",
    endTime: "07:05",
    rating: 5,
  },
  {
    id: "h4",
    bookingId: "BK-2026-0265",
    workerName: "Phạm Tải Đức",
    vehicleType: "truck",
    vehiclePlate: "61C-777.88",
    status: "cancelled",
    category: "Chuyển vật liệu xây dựng",
    totalDistance: 0,
    totalTime: 0,
    totalPrice: 0,
    startAddress: "VLXD Hùng Phát, Q.12",
    endAddress: "Công trình Q.Tân Phú",
    date: "02/03/2026",
    startTime: "13:00",
    endTime: "13:12",
  },
  {
    id: "h5",
    bookingId: "BK-2026-0260",
    workerName: "Hoàng Văn Sơn",
    vehicleType: "motorbike",
    vehiclePlate: "59B-999.00",
    status: "completed",
    category: "Thợ sơn - Sơn lại phòng khách",
    totalDistance: 2.1,
    totalTime: 14,
    totalPrice: 800000,
    startAddress: "Q.3, TP.HCM",
    endAddress: "321 Võ Văn Tần, Q.3",
    date: "01/03/2026",
    startTime: "14:00",
    endTime: "14:14",
    rating: 4,
  },
  {
    id: "h6",
    bookingId: "BK-2026-0255",
    workerName: "Nguyễn Van Tải",
    vehicleType: "van",
    vehiclePlate: "51F-222.33",
    status: "completed",
    category: "Chuyển thiết bị điện",
    totalDistance: 8.4,
    totalTime: 28,
    totalPrice: 1200000,
    startAddress: "Chợ Nhật Tảo, Q.10",
    endAddress: "KĐT Thủ Thiêm, Q.2",
    date: "28/02/2026",
    startTime: "10:00",
    endTime: "10:28",
    rating: 5,
  },
];

// ============================================================================
// Screen
// ============================================================================
export default function TrackingHistoryScreen() {
  const insets = useSafeAreaInsets();
  const [history] = useState<TrackingHistoryItem[]>(MOCK_HISTORY);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("all");

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const filtered =
    filter === "all" ? history : history.filter((h) => h.status === filter);

  const formatPrice = (p: number) => p.toLocaleString("vi-VN") + "đ";

  // Stats
  const completedItems = history.filter((h) => h.status === "completed");
  const totalTrips = completedItems.length;
  const totalDist = completedItems.reduce((s, h) => s + h.totalDistance, 0);
  const avgTime =
    completedItems.length > 0
      ? Math.round(
          completedItems.reduce((s, h) => s + h.totalTime, 0) /
            completedItems.length,
        )
      : 0;

  // ============================================================================
  // Render history card
  // ============================================================================
  const renderHistoryCard = useCallback(
    ({ item }: { item: TrackingHistoryItem }) => {
      const vc = VEHICLE_CONFIG[item.vehicleType];
      const statusDisplay = getTrackingStatusDisplay(item.status);

      return (
        <View style={s.card}>
          {/* Date header */}
          <View style={s.cardDateRow}>
            <Text style={s.cardDate}>{item.date}</Text>
            <View
              style={[
                s.cardStatusBadge,
                { backgroundColor: statusDisplay.bgColor },
              ]}
            >
              <Ionicons
                name={statusDisplay.icon as any}
                size={10}
                color={statusDisplay.color}
              />
              <Text style={[s.cardStatusText, { color: statusDisplay.color }]}>
                {statusDisplay.label}
              </Text>
            </View>
          </View>

          {/* Main content */}
          <View style={s.cardMain}>
            <Image
              source={{
                uri:
                  item.workerAvatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(item.workerName)}&background=0D9488&color=fff&size=80`,
              }}
              style={s.cardAvatar}
            />
            <View style={s.cardInfo}>
              <Text style={s.cardWorkerName}>{item.workerName}</Text>
              <View style={s.cardVehicleRow}>
                <MaterialCommunityIcons
                  name={vc.icon as any}
                  size={12}
                  color={vc.color}
                />
                <Text style={[s.cardVehicleText, { color: vc.color }]}>
                  {vc.label}
                </Text>
                <Text style={s.cardPlate}>{item.vehiclePlate}</Text>
              </View>
              <Text style={s.cardCategory} numberOfLines={1}>
                {item.category}
              </Text>
            </View>
            {item.totalPrice > 0 && (
              <Text style={s.cardPrice}>{formatPrice(item.totalPrice)}</Text>
            )}
          </View>

          {/* Route summary */}
          <View style={s.cardRoute}>
            <View style={s.cardRouteItem}>
              <View style={[s.routeDot, { backgroundColor: C.blue }]} />
              <Text style={s.routeText} numberOfLines={1}>
                {item.startAddress}
              </Text>
            </View>
            <View style={s.routeLineVertical} />
            <View style={s.cardRouteItem}>
              <View style={[s.routeDot, { backgroundColor: C.success }]} />
              <Text style={s.routeText} numberOfLines={1}>
                {item.endAddress}
              </Text>
            </View>
          </View>

          {/* Stats row */}
          {item.status === "completed" && (
            <View style={s.cardStats}>
              <View style={s.cardStatItem}>
                <Ionicons name="navigate-outline" size={13} color={C.primary} />
                <Text style={s.cardStatText}>
                  {formatDistance(item.totalDistance)}
                </Text>
              </View>
              <View style={s.cardStatItem}>
                <Ionicons name="time-outline" size={13} color={C.warning} />
                <Text style={s.cardStatText}>
                  {formatTravelTime(item.totalTime)}
                </Text>
              </View>
              <View style={s.cardStatItem}>
                <Ionicons
                  name="hourglass-outline"
                  size={13}
                  color={C.textMuted}
                />
                <Text style={s.cardStatText}>
                  {item.startTime} → {item.endTime}
                </Text>
              </View>
              {item.rating && (
                <View style={s.cardStatItem}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={s.cardStatText}>{item.rating}/5</Text>
                </View>
              )}
            </View>
          )}

          {/* Re-book CTA */}
          {item.status === "completed" && (
            <TouchableOpacity
              style={s.rebookBtn}
              onPress={() => router.push("/find-workers" as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={14} color={C.primary} />
              <Text style={s.rebookText}>Đặt lại dịch vụ này</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    },
    [],
  );

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Lịch sử lộ trình</Text>
      </View>

      {/* Stats summary */}
      <View style={s.statsSummary}>
        <View style={s.statBox}>
          <Text style={s.statValue}>{totalTrips}</Text>
          <Text style={s.statLabel}>Chuyến</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statBox}>
          <Text style={s.statValue}>{formatDistance(totalDist)}</Text>
          <Text style={s.statLabel}>Tổng quãng đường</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statBox}>
          <Text style={s.statValue}>{formatTravelTime(avgTime)}</Text>
          <Text style={s.statLabel}>TB/chuyến</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={s.filterRow}>
        {[
          { key: "all" as FilterTab, label: "Tất cả", count: history.length },
          {
            key: "completed" as FilterTab,
            label: "Hoàn thành",
            count: history.filter((h) => h.status === "completed").length,
          },
          {
            key: "cancelled" as FilterTab,
            label: "Đã huỷ",
            count: history.filter((h) => h.status === "cancelled").length,
          },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[s.filterTab, filter === tab.key && s.filterTabActive]}
            onPress={() => setFilter(tab.key)}
          >
            <Text
              style={[
                s.filterTabText,
                filter === tab.key && s.filterTabTextActive,
              ]}
            >
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {filtered.length > 0 ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryCard}
          contentContainerStyle={[
            s.list,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.primary}
            />
          }
        />
      ) : (
        <View style={s.emptyContainer}>
          <Ionicons name="document-text-outline" size={56} color="#DDD" />
          <Text style={s.emptyTitle}>Chưa có lịch sử</Text>
          <Text style={s.emptySubtitle}>
            Lộ trình đã hoàn thành sẽ hiện ở đây
          </Text>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: { padding: 4, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: C.text },

  // Stats summary
  statsSummary: {
    flexDirection: "row",
    backgroundColor: C.white,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  statBox: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "800", color: C.primary },
  statLabel: { fontSize: 10, color: C.textMuted, marginTop: 2 },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E8E8E8",
    alignSelf: "center",
  },

  // Filter
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: C.white,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
  },
  filterTabActive: { backgroundColor: C.primaryLight },
  filterTabText: { fontSize: 12, fontWeight: "500", color: C.textSec },
  filterTabTextActive: { fontWeight: "700", color: C.primary },

  // List
  list: { padding: 16, gap: 12 },

  // Card
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 2,
  },
  cardDateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardDate: { fontSize: 12, fontWeight: "600", color: C.textMuted },
  cardStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  cardStatusText: { fontSize: 10, fontWeight: "600" },

  cardMain: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  cardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 10,
  },
  cardInfo: { flex: 1 },
  cardWorkerName: { fontSize: 14, fontWeight: "700", color: C.text },
  cardVehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  cardVehicleText: { fontSize: 11, fontWeight: "600" },
  cardPlate: { fontSize: 10, color: C.textSec, marginLeft: 4 },
  cardCategory: { fontSize: 11, color: C.textSec, marginTop: 2 },
  cardPrice: { fontSize: 14, fontWeight: "800", color: C.orange },

  // Route
  cardRoute: { marginBottom: 10, paddingLeft: 4 },
  cardRouteItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  routeDot: { width: 8, height: 8, borderRadius: 4 },
  routeText: { fontSize: 11, color: C.textSec, flex: 1 },
  routeLineVertical: {
    width: 2,
    height: 14,
    backgroundColor: "#E0E0E0",
    marginLeft: 3,
  },

  // Stats
  cardStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    marginBottom: 8,
  },
  cardStatItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardStatText: { fontSize: 11, color: C.textSec },

  // Rebook
  rebookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
    gap: 6,
  },
  rebookText: { fontSize: 12, fontWeight: "600", color: C.primary },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: C.text, marginTop: 14 },
  emptySubtitle: { fontSize: 12, color: C.textMuted, marginTop: 4 },
});

/**
 * Active Trackings Screen - Danh sách đang theo dõi
 * Shows all active bookings/deliveries being tracked in real-time
 *
 * Like Shopee's "Đơn hàng đang giao" or Grab's active rides,
 * this lists all workers/drivers/vehicles currently en route.
 *
 * Features:
 * - Active booking cards with live status + mini-map preview
 * - Vehicle type badges (xe máy, xe tải, xe bê tông, xe cẩu)
 * - Quick ETA display per booking
 * - Tap to open full route tracking
 * - Empty state when no active trackings
 * - Pull-to-refresh
 */

import {
    getTrackingStatusDisplay,
    type UnifiedTrackingStatus,
} from "@/types/booking-status";
import { formatDistance, formatTravelTime, type LatLng } from "@/utils/geo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// Colors
// ============================================================================
const C = {
  primary: "#0D9488",
  primaryDark: "#0F766E",
  accent: "#14B8A6",
  orange: "#FF6B00",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  text: "#1A1A1A",
  textSec: "#666",
  textMuted: "#999",
  bg: "#F5F5F5",
  white: "#FFFFFF",
  border: "#E0E0E0",
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

interface ActiveTracking {
  id: string;
  bookingId: string;
  workerName: string;
  workerAvatar?: string;
  workerPhone: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  status: UnifiedTrackingStatus;
  eta: number; // minutes
  distanceRemaining: number; // km
  progress: number; // 0-100
  category: string;
  totalPrice: number;
  customerAddress: string;
  workerLocation: LatLng;
  customerLocation: LatLng;
  startedAt: string;
}

const VEHICLE_CONFIG: Record<
  VehicleType,
  { label: string; icon: string; iconLib: "i" | "m"; color: string }
> = {
  motorbike: {
    label: "Xe máy",
    icon: "motorbike",
    iconLib: "m",
    color: "#3B82F6",
  },
  car: { label: "Ô tô", icon: "car", iconLib: "i", color: "#8B5CF6" },
  truck: { label: "Xe tải", icon: "truck", iconLib: "m", color: "#F59E0B" },
  concrete_mixer: {
    label: "Xe bê tông",
    icon: "truck-delivery",
    iconLib: "m",
    color: "#EF4444",
  },
  crane: { label: "Xe cẩu", icon: "crane", iconLib: "m", color: "#F97316" },
  van: { label: "Xe van", icon: "van-utility", iconLib: "m", color: "#6366F1" },
};

// ============================================================================
// Mock data
// ============================================================================
const MOCK_TRACKINGS: ActiveTracking[] = [
  {
    id: "1",
    bookingId: "BK-2026-0301",
    workerName: "Nguyễn Văn An",
    workerAvatar: "",
    workerPhone: "0901234567",
    vehicleType: "motorbike",
    vehiclePlate: "59A-123.45",
    status: "arriving",
    eta: 12,
    distanceRemaining: 2.5,
    progress: 65,
    category: "Thợ điện",
    totalPrice: 350000,
    customerAddress: "123 Nguyễn Huệ, Q.1, TP.HCM",
    workerLocation: { latitude: 10.78, longitude: 106.703 },
    customerLocation: { latitude: 10.777, longitude: 106.701 },
    startedAt: "14:30",
  },
  {
    id: "2",
    bookingId: "BK-2026-0302",
    workerName: "Trần Bê Tông",
    workerAvatar: "",
    workerPhone: "0912345678",
    vehicleType: "concrete_mixer",
    vehiclePlate: "51D-789.01",
    status: "accepted",
    eta: 28,
    distanceRemaining: 7.2,
    progress: 30,
    category: "Đổ bê tông sàn",
    totalPrice: 5500000,
    customerAddress: "456 Điện Biên Phủ, Q.3, TP.HCM",
    workerLocation: { latitude: 10.79, longitude: 106.72 },
    customerLocation: { latitude: 10.779, longitude: 106.69 },
    startedAt: "13:45",
  },
  {
    id: "3",
    bookingId: "BK-2026-0303",
    workerName: "Lê Cẩu Đại",
    workerAvatar: "",
    workerPhone: "0923456789",
    vehicleType: "crane",
    vehiclePlate: "51D-456.78",
    status: "arriving",
    eta: 18,
    distanceRemaining: 3.8,
    progress: 52,
    category: "Cẩu vật liệu lên tầng 3",
    totalPrice: 3200000,
    customerAddress: "789 Lý Tự Trọng, Q.1, TP.HCM",
    workerLocation: { latitude: 10.774, longitude: 106.698 },
    customerLocation: { latitude: 10.77, longitude: 106.694 },
    startedAt: "14:00",
  },
  {
    id: "4",
    bookingId: "BK-2026-0304",
    workerName: "Phạm Văn Tải",
    workerAvatar: "",
    workerPhone: "0934567890",
    vehicleType: "truck",
    vehiclePlate: "61C-234.56",
    status: "accepted",
    eta: 35,
    distanceRemaining: 12.0,
    progress: 15,
    category: "Chuyển vật liệu xây dựng",
    totalPrice: 2800000,
    customerAddress: "321 Võ Văn Tần, Q.3, TP.HCM",
    workerLocation: { latitude: 10.8, longitude: 106.73 },
    customerLocation: { latitude: 10.775, longitude: 106.688 },
    startedAt: "13:15",
  },
];

// ============================================================================
// Screen
// ============================================================================
export default function ActiveTrackingsScreen() {
  const insets = useSafeAreaInsets();
  const [trackings, setTrackings] = useState<ActiveTracking[]>(MOCK_TRACKINGS);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | VehicleType>("all");

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API refresh
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  }, []);

  const filteredTrackings =
    filter === "all"
      ? trackings
      : trackings.filter((t) => t.vehicleType === filter);

  const handleOpenTracking = useCallback((tracking: ActiveTracking) => {
    router.push({
      pathname: "/service-booking/worker-route-tracking",
      params: {
        bookingId: tracking.bookingId,
        workerId: tracking.id,
        workerName: tracking.workerName,
        workerAvatar: tracking.workerAvatar || "",
        workerPhone: tracking.workerPhone,
        workerLat: String(tracking.workerLocation.latitude),
        workerLng: String(tracking.workerLocation.longitude),
        customerLat: String(tracking.customerLocation.latitude),
        customerLng: String(tracking.customerLocation.longitude),
        customerAddress: tracking.customerAddress,
        category: tracking.category,
        totalPrice: String(tracking.totalPrice),
        vehicleType: tracking.vehicleType,
        vehiclePlate: tracking.vehiclePlate,
      },
    } as any);
  }, []);

  const formatPrice = (p: number) => p.toLocaleString("vi-VN") + "đ";

  // ============================================================================
  // Render booking card
  // ============================================================================
  const renderTrackingCard = useCallback(
    ({ item }: { item: ActiveTracking }) => {
      const vc = VEHICLE_CONFIG[item.vehicleType];
      const statusDisplay = getTrackingStatusDisplay(item.status);

      return (
        <TouchableOpacity
          style={s.card}
          activeOpacity={0.7}
          onPress={() => handleOpenTracking(item)}
        >
          {/* Status strip */}
          <View
            style={[
              s.cardStatusStrip,
              { backgroundColor: statusDisplay.color },
            ]}
          />

          <View style={s.cardContent}>
            {/* Top row: Worker + ETA */}
            <View style={s.cardTopRow}>
              <Image
                source={{
                  uri:
                    item.workerAvatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(item.workerName)}&background=0D9488&color=fff&size=80`,
                }}
                style={s.cardAvatar}
              />
              <View style={s.cardWorkerInfo}>
                <Text style={s.cardWorkerName}>{item.workerName}</Text>
                <View style={s.cardVehicleRow}>
                  {vc.iconLib === "m" ? (
                    <MaterialCommunityIcons
                      name={vc.icon as any}
                      size={13}
                      color={vc.color}
                    />
                  ) : (
                    <Ionicons
                      name={vc.icon as any}
                      size={13}
                      color={vc.color}
                    />
                  )}
                  <Text style={[s.cardVehicleText, { color: vc.color }]}>
                    {vc.label}
                  </Text>
                  <View style={s.cardPlateBadge}>
                    <Text style={s.cardPlateText}>{item.vehiclePlate}</Text>
                  </View>
                </View>
              </View>
              <View style={s.cardEtaBox}>
                <Text style={s.cardEtaValue}>{formatTravelTime(item.eta)}</Text>
                <Text style={s.cardEtaDist}>
                  {formatDistance(item.distanceRemaining)}
                </Text>
              </View>
            </View>

            {/* Category + Status badge */}
            <View style={s.cardMiddleRow}>
              <View
                style={[
                  s.cardStatusBadge,
                  { backgroundColor: statusDisplay.bgColor },
                ]}
              >
                <Ionicons
                  name={statusDisplay.icon as any}
                  size={12}
                  color={statusDisplay.color}
                />
                <Text
                  style={[s.cardStatusText, { color: statusDisplay.color }]}
                >
                  {statusDisplay.label}
                </Text>
              </View>
              <Text style={s.cardCategory}>{item.category}</Text>
            </View>

            {/* Progress bar */}
            <View style={s.cardProgressRow}>
              <View style={s.cardProgressTrack}>
                <View
                  style={[
                    s.cardProgressFill,
                    {
                      width: `${item.progress}%`,
                      backgroundColor: statusDisplay.color,
                    },
                  ]}
                />
              </View>
              <Text
                style={[s.cardProgressText, { color: statusDisplay.color }]}
              >
                {item.progress}%
              </Text>
            </View>

            {/* Bottom: address + price */}
            <View style={s.cardBottomRow}>
              <View style={s.cardAddressRow}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={C.textMuted}
                />
                <Text style={s.cardAddress} numberOfLines={1}>
                  {item.customerAddress}
                </Text>
              </View>
              <Text style={s.cardPrice}>{formatPrice(item.totalPrice)}</Text>
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={s.cardTrackBtn}
              onPress={() => handleOpenTracking(item)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[C.primary, C.accent]}
                style={s.cardTrackBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="navigate" size={16} color="#fff" />
                <Text style={s.cardTrackBtnText}>Xem lộ trình trực tiếp</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [handleOpenTracking],
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
        <Text style={s.headerTitle}>Đang theo dõi</Text>
        <View style={s.headerCountBadge}>
          <Text style={s.headerCountText}>{filteredTrackings.length}</Text>
        </View>
        <TouchableOpacity
          style={s.historyBtn}
          onPress={() =>
            router.push("/service-booking/tracking-history" as any)
          }
        >
          <Ionicons name="time-outline" size={22} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={s.filterRow}>
        <ScrollChip
          label="Tất cả"
          active={filter === "all"}
          count={trackings.length}
          onPress={() => setFilter("all")}
        />
        {(
          Object.entries(VEHICLE_CONFIG) as [
            VehicleType,
            (typeof VEHICLE_CONFIG)[VehicleType],
          ][]
        ).map(([type, vc]) => {
          const count = trackings.filter((t) => t.vehicleType === type).length;
          if (count === 0) return null;
          return (
            <ScrollChip
              key={type}
              label={vc.label}
              active={filter === type}
              count={count}
              color={vc.color}
              onPress={() => setFilter(type)}
            />
          );
        })}
      </View>

      {/* List */}
      {filteredTrackings.length > 0 ? (
        <FlatList
          data={filteredTrackings}
          keyExtractor={(item) => item.id}
          renderItem={renderTrackingCard}
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
          <Ionicons name="navigate-outline" size={64} color="#DDD" />
          <Text style={s.emptyTitle}>Không có lộ trình nào</Text>
          <Text style={s.emptySubtitle}>
            Khi bạn đặt thợ hoặc giao hàng, lộ trình sẽ hiện ở đây
          </Text>
          <TouchableOpacity
            style={s.emptyBtn}
            onPress={() => router.push("/find-workers" as any)}
          >
            <Text style={s.emptyBtnText}>Tìm thợ ngay</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Filter Chip component
// ============================================================================
function ScrollChip({
  label,
  active,
  count,
  color,
  onPress,
}: {
  label: string;
  active: boolean;
  count: number;
  color?: string;
  onPress: () => void;
}) {
  const chipColor = color || C.primary;
  return (
    <TouchableOpacity
      style={[
        s.chip,
        active && { backgroundColor: chipColor + "15", borderColor: chipColor },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[s.chipText, active && { color: chipColor, fontWeight: "700" }]}
      >
        {label}
      </Text>
      {count > 0 && (
        <View style={[s.chipCount, active && { backgroundColor: chipColor }]}>
          <Text style={[s.chipCountText, active && { color: "#fff" }]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
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
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700", color: C.text },
  headerCountBadge: {
    backgroundColor: C.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerCountText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  historyBtn: { padding: 4 },

  // Filters
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: C.white,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "transparent",
    gap: 4,
  },
  chipText: { fontSize: 12, fontWeight: "500", color: C.textSec },
  chipCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  chipCountText: { fontSize: 10, fontWeight: "700", color: C.textSec },

  // List
  list: { padding: 16, gap: 14 },

  // Card
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 2,
  },
  cardStatusStrip: { height: 3, width: "100%" },
  cardContent: { padding: 14 },
  cardTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  cardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F0F0",
    marginRight: 10,
  },
  cardWorkerInfo: { flex: 1 },
  cardWorkerName: { fontSize: 15, fontWeight: "700", color: C.text },
  cardVehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  cardVehicleText: { fontSize: 11, fontWeight: "600" },
  cardPlateBadge: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 2,
  },
  cardPlateText: { fontSize: 10, fontWeight: "600", color: C.text },
  cardEtaBox: { alignItems: "flex-end" },
  cardEtaValue: { fontSize: 15, fontWeight: "800", color: C.primary },
  cardEtaDist: { fontSize: 11, color: C.textMuted, marginTop: 1 },

  cardMiddleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cardStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  cardStatusText: { fontSize: 11, fontWeight: "600" },
  cardCategory: { fontSize: 12, color: C.textSec, flex: 1 },

  cardProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cardProgressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  cardProgressFill: { height: "100%", borderRadius: 3 },
  cardProgressText: {
    fontSize: 11,
    fontWeight: "700",
    minWidth: 32,
    textAlign: "right",
  },

  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  cardAddress: { fontSize: 12, color: C.textSec, flex: 1 },
  cardPrice: { fontSize: 14, fontWeight: "800", color: C.orange },

  cardTrackBtn: { borderRadius: 12, overflow: "hidden" },
  cardTrackBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    gap: 6,
  },
  cardTrackBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: C.text, marginTop: 16 },
  emptySubtitle: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: C.primary,
    borderRadius: 12,
  },
  emptyBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});

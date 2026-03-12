/**
 * Store Map Screen
 * ==================
 *
 * Bản đồ cửa hàng riêng cho app — hiển thị map + danh sách chi nhánh
 * - Web-safe canvas map với markers
 * - Real GPS distance (haversine)
 * - Chỉ đường / gọi ngay
 * - Pull-to-refresh + search
 */

import { formatDistance, haversineDistance, type LatLng } from "@/utils/geo";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Linking,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_W } = Dimensions.get("window");
const MAP_H = 240;
const MAP_PAD = 14; // % from edge

// ─── Store data ───
interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  isOpen: boolean;
  coordinates: LatLng;
  openingHours: string;
  type: "main" | "branch" | "warehouse";
}

const STORES: Store[] = [
  {
    id: "1",
    name: "Chi nhánh Quận 1",
    address: "123 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM",
    phone: "028 3822 1234",
    isOpen: true,
    coordinates: { latitude: 10.7759, longitude: 106.7005 },
    openingHours: "8:00 - 18:00",
    type: "main",
  },
  {
    id: "2",
    name: "Chi nhánh Quận 3",
    address: "456 Võ Văn Tần, P.5, Q.3, TP.HCM",
    phone: "028 3933 4567",
    isOpen: true,
    coordinates: { latitude: 10.7819, longitude: 106.6918 },
    openingHours: "8:00 - 18:00",
    type: "branch",
  },
  {
    id: "3",
    name: "Chi nhánh Thủ Đức",
    address: "789 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức, TP.HCM",
    phone: "028 3897 7890",
    isOpen: false,
    coordinates: { latitude: 10.8505, longitude: 106.7719 },
    openingHours: "8:00 - 17:00 (T2-T6)",
    type: "branch",
  },
  {
    id: "4",
    name: "Kho Bình Tân",
    address: "22 Tên Lửa, P. Bình Trị Đông B, Q. Bình Tân, TP.HCM",
    phone: "028 3620 1111",
    isOpen: true,
    coordinates: { latitude: 10.7515, longitude: 106.6044 },
    openingHours: "7:00 - 19:00",
    type: "warehouse",
  },
  {
    id: "5",
    name: "Chi nhánh Quận 7",
    address: "15 Nguyễn Lương Bằng, P. Tân Phú, Q.7, TP.HCM",
    phone: "028 5411 2233",
    isOpen: true,
    coordinates: { latitude: 10.7295, longitude: 106.7218 },
    openingHours: "8:00 - 18:00",
    type: "branch",
  },
];

// ─── Default location (HCM center) ───
const DEFAULT_LOC: LatLng = { latitude: 10.7769, longitude: 106.7009 };

// ═══════════════════════════════════════════════════════════════
// MAP CANVAS (Web-safe)
// ═══════════════════════════════════════════════════════════════
function StoreMapCanvas({
  stores,
  userLocation,
  selectedId,
  onSelect,
}: {
  stores: Store[];
  userLocation: LatLng;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  // Compute bounding box
  const allPts = [userLocation, ...stores.map((s) => s.coordinates)];
  const minLat = Math.min(...allPts.map((p) => p.latitude));
  const maxLat = Math.max(...allPts.map((p) => p.latitude));
  const minLng = Math.min(...allPts.map((p) => p.longitude));
  const maxLng = Math.max(...allPts.map((p) => p.longitude));
  const latRange = Math.max(maxLat - minLat, 0.01);
  const lngRange = Math.max(maxLng - minLng, 0.01);

  const toPos = (pt: LatLng) => ({
    top:
      MAP_PAD + (1 - (pt.latitude - minLat) / latRange) * (100 - MAP_PAD * 2),
    left: MAP_PAD + ((pt.longitude - minLng) / lngRange) * (100 - MAP_PAD * 2),
  });

  const userPos = toPos(userLocation);

  return (
    <View style={ms.mapWrap}>
      {/* Grid background */}
      <View style={ms.grid}>
        {Array.from({ length: 15 }).map((_, i) => (
          <View
            key={`gh${i}`}
            style={[
              ms.gridLine,
              { top: `${(i + 1) * 6.25}%`, width: "100%", height: 1 },
            ]}
          />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <View
            key={`gv${i}`}
            style={[
              ms.gridLine,
              { left: `${(i + 1) * 6.25}%`, height: "100%", width: 1 },
            ]}
          />
        ))}
      </View>

      {/* Road lines */}
      <View style={[ms.road, { top: "35%", width: "100%", height: 3 }]} />
      <View style={[ms.road, { top: "65%", width: "100%", height: 2 }]} />
      <View style={[ms.road, { left: "30%", height: "100%", width: 3 }]} />
      <View style={[ms.road, { left: "70%", height: "100%", width: 2 }]} />

      {/* User location */}
      <View
        style={[
          ms.markerWrap,
          { top: `${userPos.top}%`, left: `${userPos.left}%` },
        ]}
      >
        <View style={ms.userPulse} />
        <View style={ms.userDot}>
          <View style={ms.userDotInner} />
        </View>
        <Text style={ms.userLabel}>Bạn</Text>
      </View>

      {/* Store markers */}
      {stores.map((store) => {
        const pos = toPos(store.coordinates);
        const isSel = selectedId === store.id;
        const dist = haversineDistance(userLocation, store.coordinates);
        return (
          <TouchableOpacity
            key={store.id}
            activeOpacity={0.7}
            onPress={() => onSelect(store.id)}
            style={[
              ms.markerWrap,
              {
                top: `${pos.top}%`,
                left: `${pos.left}%`,
                zIndex: isSel ? 20 : 10,
              },
            ]}
          >
            <View style={[ms.storePin, isSel && ms.storePinSel]}>
              <Ionicons
                name={store.type === "warehouse" ? "cube" : "storefront"}
                size={isSel ? 16 : 13}
                color="#fff"
              />
            </View>
            {isSel && (
              <View style={ms.storeBubble}>
                <Text style={ms.storeBubbleName} numberOfLines={1}>
                  {store.name}
                </Text>
                <Text style={ms.storeBubbleDist}>{formatDistance(dist)}</Text>
              </View>
            )}
            {!isSel && (
              <Text style={ms.storeDistLabel}>{formatDistance(dist)}</Text>
            )}
          </TouchableOpacity>
        );
      })}

      {/* Legend */}
      <View style={ms.legend}>
        <View style={ms.legendItem}>
          <View style={[ms.legendDot, { backgroundColor: "#0D9488" }]} />
          <Text style={ms.legendText}>Cửa hàng</Text>
        </View>
        <View style={ms.legendItem}>
          <View style={[ms.legendDot, { backgroundColor: "#3B82F6" }]} />
          <Text style={ms.legendText}>Bạn</Text>
        </View>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════
export default function StoreMapScreen() {
  const insets = useSafeAreaInsets();
  const [userLoc, setUserLoc] = useState<LatLng>(DEFAULT_LOC);
  const [locLoading, setLocLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlatList>(null);

  // ─── Get GPS ───
  const fetchLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLoc({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch {
      // keep default
    } finally {
      setLocLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // ─── Sorted stores by distance ───
  const sortedStores = useMemo(() => {
    let list = STORES.map((s) => ({
      ...s,
      dist: haversineDistance(userLoc, s.coordinates),
    }));
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => a.dist - b.dist);
  }, [userLoc, searchQ]);

  // ─── Actions ───
  const handleDirections = (store: Store) => {
    const { latitude, longitude } = store.coordinates;
    const label = encodeURIComponent(store.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    })!;
    Linking.openURL(url).catch(() => Alert.alert("Lỗi", "Không thể mở bản đồ"));
  };

  const handleCall = (phone: string) => {
    const url = `tel:${phone.replace(/\s/g, "")}`;
    Linking.openURL(url).catch(() => Alert.alert("Lỗi", "Không thể gọi điện"));
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLocation();
    setRefreshing(false);
  }, [fetchLocation]);

  const handleSelectStore = useCallback(
    (id: string) => {
      setSelectedId((prev) => (prev === id ? null : id));
      const idx = sortedStores.findIndex((s) => s.id === id);
      if (idx >= 0) {
        listRef.current?.scrollToIndex({
          index: idx,
          animated: true,
          viewOffset: 60,
        });
      }
    },
    [sortedStores],
  );

  // ─── Render store card ───
  const renderStore = useCallback(
    ({ item }: { item: (typeof sortedStores)[0] }) => {
      const isSel = selectedId === item.id;
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleSelectStore(item.id)}
          style={[cs.card, isSel && cs.cardSel]}
        >
          {/* Top row: name + distance */}
          <View style={cs.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={cs.cardName}>{item.name}</Text>
              <View
                style={[
                  cs.statusBadge,
                  { backgroundColor: item.isOpen ? "#DCFCE7" : "#FEE2E2" },
                ]}
              >
                <Text
                  style={[
                    cs.statusText,
                    { color: item.isOpen ? "#15803D" : "#991B1B" },
                  ]}
                >
                  {item.isOpen ? "Đang mở cửa" : "Đã đóng cửa"}
                </Text>
              </View>
            </View>
            <View style={cs.distBadge}>
              <Text style={cs.distText}>{formatDistance(item.dist)}</Text>
            </View>
          </View>

          {/* Info rows */}
          <View style={cs.infoRows}>
            <View style={cs.infoRow}>
              <Ionicons name="location" size={14} color="#94A3B8" />
              <Text style={cs.infoText}>{item.address}</Text>
            </View>
            <View style={cs.infoRow}>
              <Ionicons name="call" size={14} color="#94A3B8" />
              <Text style={cs.infoText}>{item.phone}</Text>
            </View>
            <View style={cs.infoRow}>
              <Ionicons name="time" size={14} color="#94A3B8" />
              <Text style={cs.infoText}>{item.openingHours}</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={cs.actions}>
            <TouchableOpacity
              style={cs.btnPrimary}
              onPress={() => handleDirections(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="navigate" size={14} color="#fff" />
              <Text style={cs.btnPrimaryText}>Chỉ đường</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={cs.btnOutline}
              onPress={() => handleCall(item.phone)}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={14} color="#0D9488" />
              <Text style={cs.btnOutlineText}>Gọi ngay</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [selectedId, handleSelectStore],
  );

  // ─── List header (map + search) ───
  const renderHeader = () => (
    <View>
      {/* Map */}
      <StoreMapCanvas
        stores={STORES}
        userLocation={userLoc}
        selectedId={selectedId}
        onSelect={handleSelectStore}
      />

      {/* Search */}
      <View style={cs.searchWrap}>
        <Ionicons name="search" size={15} color="#94A3B8" />
        <TextInput
          nativeID="store-map-search"
          accessibilityLabel="Tìm kiếm cửa hàng"
          style={cs.searchInput}
          placeholder="Tìm chi nhánh..."
          placeholderTextColor="#94A3B8"
          value={searchQ}
          onChangeText={setSearchQ}
        />
        {searchQ.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQ("")}>
            <Ionicons name="close-circle" size={15} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Count */}
      <Text style={cs.countText}>
        {sortedStores.length} chi nhánh {searchQ ? "tìm thấy" : "gần bạn"}
      </Text>
    </View>
  );

  return (
    <View style={[cs.container, { paddingTop: insets.top }]}>
      {/* Header bar */}
      <View style={cs.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={cs.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={cs.headerTitle}>Tìm cửa hàng</Text>
          <Text style={cs.headerSub}>Tìm chi nhánh gần bạn nhất</Text>
        </View>
        {locLoading && <ActivityIndicator size="small" color="#fff" />}
      </View>

      {/* Store list */}
      <FlatList
        ref={listRef}
        data={sortedStores}
        keyExtractor={(item) => item.id}
        renderItem={renderStore}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={cs.empty}>
            <Ionicons name="storefront-outline" size={40} color="#94A3B8" />
            <Text style={cs.emptyText}>Không tìm thấy chi nhánh</Text>
          </View>
        }
        contentContainerStyle={cs.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0D9488"
            colors={["#0D9488"]}
          />
        }
        onScrollToIndexFailed={() => {}}
      />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAP STYLES
// ═══════════════════════════════════════════════════════════════
const ms = StyleSheet.create({
  mapWrap: {
    height: MAP_H,
    backgroundColor: "#E8F5F3",
    borderBottomWidth: 1,
    borderBottomColor: "#D1E7E4",
    overflow: "hidden",
    position: "relative",
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "#C8E0DC",
    opacity: 0.4,
  },
  road: {
    position: "absolute",
    backgroundColor: "#B8D4CF",
    opacity: 0.6,
    borderRadius: 1,
  },
  markerWrap: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -16 }, { translateY: -16 }],
    zIndex: 10,
  },
  // User
  userPulse: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(59,130,246,0.15)",
  },
  userDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#3B82F6",
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  userDotInner: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  userLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#3B82F6",
    marginTop: 1,
  },
  // Store pin
  storePin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  storePinSel: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#0F766E",
    borderWidth: 3,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  storeDistLabel: {
    fontSize: 8,
    fontWeight: "600",
    color: "#0D9488",
    marginTop: 1,
  },
  storeBubble: {
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    maxWidth: 120,
  },
  storeBubbleName: {
    fontSize: 9,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  storeBubbleDist: {
    fontSize: 8,
    color: "#0D9488",
    fontWeight: "600",
  },
  // Legend
  legend: {
    position: "absolute",
    bottom: 6,
    right: 8,
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 8,
    color: "#64748B",
    fontWeight: "500",
  },
});

// ═══════════════════════════════════════════════════════════════
// CARD / SCREEN STYLES
// ═══════════════════════════════════════════════════════════════
const cs = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  listContent: {
    paddingBottom: 32,
  },

  // Header
  header: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  headerSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    marginTop: 1,
  },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 8 : 5,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#1A1A1A",
  },

  // Count
  countText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 4,
  },

  // Card
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardSel: {
    borderColor: "#0D9488",
    borderWidth: 1.5,
    shadowColor: "#0D9488",
    shadowOpacity: 0.12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  distBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#F0FDFA",
  },
  distText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0D9488",
  },

  // Info
  infoRows: {
    gap: 5,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "flex-start",
  },
  infoText: {
    fontSize: 12,
    color: "#64748B",
    flex: 1,
    lineHeight: 17,
  },

  // Buttons
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: "#0D9488",
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  btnPrimaryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  btnOutline: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  btnOutlineText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0D9488",
  },

  // Empty
  empty: {
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 10,
  },
});

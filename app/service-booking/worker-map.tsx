/**
 * Worker Map Screen - Grab-style nearby worker discovery
 * Shows workers on map with distance/ETA, filter by service category
 * Bottom sheet with worker cards, book directly from map
 */

import WorkerMapView from "@/components/worker/WorkerMapView";
import {
    QUICK_FILTER_CATEGORIES,
    RADIUS_OPTIONS,
} from "@/data/service-categories";
import { useNearbyWorkers } from "@/hooks/useNearbyWorkers";
import { useUserLocation } from "@/hooks/useUserLocation";
import type { WorkerWithLocation } from "@/services/worker-location.service";
import {
    estimateTravelTime,
    formatDistance,
    formatTravelTime,
} from "@/utils/geo";
import {
    Ionicons,
    MaterialCommunityIcons,
    MaterialIcons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================================================
// SERVICE CATEGORIES (quick filter chips) — imported from @/data/service-categories
// ============================================================================

// RADIUS_OPTIONS also imported

// ============================================================================
// SCREEN
// ============================================================================

export default function WorkerMapScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState("all");
  const [showRadiusSelector, setShowRadiusSelector] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  // Location
  const { location, address, loading: locationLoading } = useUserLocation();

  // Nearby workers
  const {
    workers,
    loading: workersLoading,
    selectedWorker,
    totalFound,
    searchRadius,
    search,
    selectWorker,
    setRadius,
    setCategory,
    refresh,
  } = useNearbyWorkers(location, {
    category: activeCategory === "all" ? undefined : activeCategory,
    radiusKm: 10,
  });

  // Handlers
  const handleCategoryPress = useCallback(
    (catId: string) => {
      if (Platform.OS !== "web") Haptics.selectionAsync();
      setActiveCategory(catId);
      setCategory(catId === "all" ? undefined : catId);
    },
    [setCategory],
  );

  const handleWorkerSelect = useCallback(
    (worker: WorkerWithLocation) => {
      if (Platform.OS !== "web") Haptics.selectionAsync();
      selectWorker(worker);
    },
    [selectWorker],
  );

  const handleBookWorker = useCallback(
    (worker: WorkerWithLocation) => {
      if (Platform.OS !== "web")
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: "/service-booking/confirm-booking",
        params: {
          workerId: worker.id,
          workerName: worker.name,
          workerAvatar: worker.avatar || "",
          workerRating: String(worker.rating),
          workerDistance: String(worker.distance || 0),
          workerETA: String(worker.estimatedArrival || 15),
          workerDailyRate: String(worker.dailyRate),
          workerPhone: worker.phone || "",
          workerType: worker.workerType,
          workerLocation: worker.location,
          category: activeCategory,
          customerLat: String(location?.latitude || 0),
          customerLng: String(location?.longitude || 0),
          customerAddress: address || "",
        },
      } as any);
    },
    [activeCategory, location, address],
  );

  const handleViewProfile = useCallback((worker: WorkerWithLocation) => {
    router.push({
      pathname: "/service-booking/worker-review",
      params: {
        id: worker.id,
        name: worker.name,
        avatar: worker.avatar || "",
        rating: String(worker.rating),
        reviewCount: String(worker.reviewCount),
      },
    } as any);
  }, []);

  const handleRadiusChange = useCallback(
    (km: number) => {
      setRadius(km);
      setShowRadiusSelector(false);
      if (Platform.OS !== "web") Haptics.selectionAsync();
    },
    [setRadius],
  );

  const handleMyLocation = useCallback(() => {
    if (location) {
      search(location);
      if (Platform.OS !== "web") Haptics.selectionAsync();
    }
  }, [location, search]);

  // Sorted workers by distance
  const sortedWorkers = useMemo(
    () => [...workers].sort((a, b) => (a.distance || 0) - (b.distance || 0)),
    [workers],
  );

  // ============================================================================
  // Worker Card (horizontal & list)
  // ============================================================================

  const renderWorkerCard = useCallback(
    ({
      item,
      horizontal = true,
    }: {
      item: WorkerWithLocation;
      horizontal?: boolean;
    }) => {
      const isSelected = selectedWorker?.id === item.id;
      return (
        <TouchableOpacity
          style={[
            horizontal ? s.workerCardH : s.workerCardV,
            isSelected && s.workerCardSelected,
          ]}
          onPress={() => handleWorkerSelect(item)}
          activeOpacity={0.8}
        >
          {/* Avatar + Online dot */}
          <View style={s.avatarWrap}>
            <Image
              source={{
                uri:
                  item.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=FF6B00&color=fff`,
              }}
              style={horizontal ? s.avatarH : s.avatarV}
            />
            {item.availability === "available" && <View style={s.onlineDot} />}
            {item.verified && (
              <View style={s.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={10} color="#1976D2" />
              </View>
            )}
          </View>

          {/* Info */}
          <View style={s.workerInfo}>
            <Text style={s.workerName} numberOfLines={1}>
              {item.name}
            </Text>

            {/* Rating */}
            <View style={s.ratingRow}>
              <Ionicons name="star" size={12} color="#FFC107" />
              <Text style={s.ratingText}>
                {item.rating.toFixed(1)} ({item.reviewCount})
              </Text>
              <Text style={s.expText}>• {item.experience} năm KN</Text>
            </View>

            {/* Distance + ETA */}
            <View style={s.distRow}>
              <Ionicons name="location-outline" size={12} color="#FF6B00" />
              <Text style={s.distText}>
                {formatDistance(item.distance || 0)}
              </Text>
              <MaterialIcons
                name="access-time"
                size={12}
                color="#666"
                style={{ marginLeft: 8 }}
              />
              <Text style={s.etaText}>
                {formatTravelTime(
                  item.estimatedArrival ||
                    estimateTravelTime(item.distance || 0),
                )}
              </Text>
            </View>

            {/* Price + Book CTA */}
            <View style={s.priceRow}>
              <Text style={s.priceText}>
                {(item.dailyRate || 0).toLocaleString("vi-VN")}đ/ngày
              </Text>
              <TouchableOpacity
                style={s.bookBtn}
                onPress={() => handleBookWorker(item)}
              >
                <Text style={s.bookBtnText}>Đặt thợ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [selectedWorker, handleWorkerSelect, handleBookWorker],
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ─── HEADER ─── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Tìm thợ gần bạn</Text>
          <View style={s.locationRow}>
            <Ionicons name="location" size={12} color="#FF6B00" />
            <Text style={s.locationText} numberOfLines={1}>
              {locationLoading
                ? "Đang xác định vị trí..."
                : address || "TP. Hồ Chí Minh"}
            </Text>
          </View>
        </View>

        {/* View toggle */}
        <TouchableOpacity
          style={s.viewToggle}
          onPress={() => setViewMode(viewMode === "map" ? "list" : "map")}
        >
          <Ionicons
            name={viewMode === "map" ? "list" : "map"}
            size={22}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      {/* ─── CATEGORY CHIPS ─── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.catScroll}
        contentContainerStyle={s.catContent}
      >
        {QUICK_FILTER_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[s.catChip, activeCategory === cat.id && s.catChipActive]}
            onPress={() => handleCategoryPress(cat.id)}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={activeCategory === cat.id ? "#fff" : "#666"}
            />
            <Text
              style={[
                s.catChipText,
                activeCategory === cat.id && s.catChipTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ─── MAP VIEW ─── */}
      {viewMode === "map" && location && (
        <View style={s.mapSection}>
          <WorkerMapView
            userLocation={location}
            workers={sortedWorkers}
            selectedWorker={selectedWorker}
            onWorkerSelect={handleWorkerSelect}
            height={SCREEN_HEIGHT * 0.4}
            showRadius
            radiusKm={searchRadius}
          />

          {/* Map controls overlay */}
          <View style={s.mapControls}>
            {/* My location button */}
            <TouchableOpacity
              style={s.mapControlBtn}
              onPress={handleMyLocation}
            >
              <Ionicons name="locate" size={20} color="#333" />
            </TouchableOpacity>

            {/* Radius selector */}
            <TouchableOpacity
              style={s.mapControlBtn}
              onPress={() => setShowRadiusSelector(!showRadiusSelector)}
            >
              <MaterialCommunityIcons
                name="radius-outline"
                size={20}
                color="#333"
              />
              <Text style={s.radiusLabel}>{searchRadius}km</Text>
            </TouchableOpacity>
          </View>

          {/* Radius dropdown */}
          {showRadiusSelector && (
            <View style={s.radiusDropdown}>
              {RADIUS_OPTIONS.map((km) => (
                <TouchableOpacity
                  key={km}
                  style={[
                    s.radiusOption,
                    searchRadius === km && s.radiusOptionActive,
                  ]}
                  onPress={() => handleRadiusChange(km)}
                >
                  <Text
                    style={[
                      s.radiusOptionText,
                      searchRadius === km && s.radiusOptionTextActive,
                    ]}
                  >
                    {km} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Results count */}
          <View style={s.resultBar}>
            <Text style={s.resultText}>
              <Text style={s.resultCount}>{totalFound}</Text> thợ trong phạm vi{" "}
              {searchRadius}km
            </Text>
            <TouchableOpacity onPress={refresh}>
              <Ionicons name="refresh" size={18} color="#FF6B00" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ─── SELECTED WORKER DETAIL (Grab-style bottom card) ─── */}
      {viewMode === "map" && selectedWorker && (
        <View style={s.selectedCard}>
          <View style={s.selectedCardHandle} />
          {renderWorkerCard({ item: selectedWorker, horizontal: false })}
          <View style={s.selectedActions}>
            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => handleViewProfile(selectedWorker)}
            >
              <Ionicons name="person-circle" size={20} color="#666" />
              <Text style={s.actionBtnText}>Xem hồ sơ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, s.actionBtnPrimary]}
              onPress={() => handleBookWorker(selectedWorker)}
            >
              <LinearGradient
                colors={["#FF6B00", "#FF8F00"]}
                style={s.actionBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialCommunityIcons
                  name="account-hard-hat"
                  size={20}
                  color="#fff"
                />
                <Text style={s.actionBtnPrimaryText}>Đặt thợ ngay</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ─── WORKER LIST (horizontal scroll under map or full list) ─── */}
      {viewMode === "map" && !selectedWorker && (
        <FlatList
          data={sortedWorkers.slice(0, 10)}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            renderWorkerCard({ item, horizontal: true })
          }
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.workerListH}
          style={s.workerListHContainer}
        />
      )}

      {/* ─── LIST VIEW MODE ─── */}
      {viewMode === "list" && (
        <FlatList
          data={sortedWorkers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            renderWorkerCard({ item, horizontal: false })
          }
          contentContainerStyle={s.workerListV}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={s.listHeader}>
              {totalFound} thợ gần bạn (trong {searchRadius}km)
            </Text>
          }
          ListEmptyComponent={
            workersLoading ? (
              <View style={s.emptyState}>
                <ActivityIndicator size="large" color="#FF6B00" />
                <Text style={s.emptyText}>Đang tìm thợ...</Text>
              </View>
            ) : (
              <View style={s.emptyState}>
                <MaterialCommunityIcons
                  name="account-search"
                  size={64}
                  color="#ccc"
                />
                <Text style={s.emptyText}>Không tìm thấy thợ gần bạn</Text>
                <Text style={s.emptySubText}>Thử mở rộng phạm vi tìm kiếm</Text>
              </View>
            )
          }
        />
      )}

      {/* ─── LOADING OVERLAY ─── */}
      {(locationLoading || workersLoading) && workers.length === 0 && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={s.loadingText}>
            {locationLoading ? "Xác định vị trí..." : "Đang tìm thợ gần bạn..."}
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
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#888",
    flex: 1,
  },
  viewToggle: {
    padding: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
  },

  // Category chips
  catScroll: {
    maxHeight: 46,
    backgroundColor: "#fff",
  },
  catContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    gap: 4,
  },
  catChipActive: {
    backgroundColor: "#FF6B00",
  },
  catChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  catChipTextActive: {
    color: "#fff",
  },

  // Map section
  mapSection: {
    position: "relative",
  },
  mapControls: {
    position: "absolute",
    right: 12,
    top: 12,
    gap: 8,
  },
  mapControlBtn: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  radiusLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FF6B00",
    marginTop: 2,
  },
  radiusDropdown: {
    position: "absolute",
    right: 12,
    top: 110,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 20,
  },
  radiusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  radiusOptionActive: {
    backgroundColor: "#FFF3E0",
  },
  radiusOptionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  radiusOptionTextActive: {
    color: "#FF6B00",
    fontWeight: "700",
  },
  resultBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  resultText: {
    fontSize: 13,
    color: "#666",
  },
  resultCount: {
    fontWeight: "700",
    color: "#FF6B00",
    fontSize: 15,
  },

  // Worker cards (horizontal)
  workerListHContainer: {
    maxHeight: 160,
  },
  workerListH: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  workerCardH: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    width: SCREEN_WIDTH * 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 10,
  },

  // Worker cards (vertical/list)
  workerListV: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 100,
  },
  workerCardV: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  workerCardSelected: {
    borderWidth: 2,
    borderColor: "#FF6B00",
  },
  listHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },

  // Avatar
  avatarWrap: {
    position: "relative",
    marginRight: 12,
  },
  avatarH: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0F0F0",
  },
  avatarV: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0F0F0",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  verifiedBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 2,
  },

  // Worker info
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
  },
  ratingText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
  },
  expText: {
    fontSize: 11,
    color: "#999",
  },
  distRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  distText: {
    fontSize: 12,
    color: "#FF6B00",
    fontWeight: "600",
    marginLeft: 3,
  },
  etaText: {
    fontSize: 11,
    color: "#666",
    marginLeft: 3,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
  },
  bookBtn: {
    backgroundColor: "#FF6B00",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bookBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },

  // Selected worker card (bottom sheet)
  selectedCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  selectedCardHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDD",
    alignSelf: "center",
    marginBottom: 12,
  },
  selectedActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  actionBtnPrimary: {
    flex: 2,
    padding: 0,
    overflow: "hidden",
  },
  actionBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    width: "100%",
    borderRadius: 12,
    gap: 6,
  },
  actionBtnPrimaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
  },
  emptySubText: {
    fontSize: 13,
    color: "#bbb",
  },

  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    zIndex: 50,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});

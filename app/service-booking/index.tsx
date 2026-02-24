/**
 * Service Booking - Home Services Marketplace
 * Vua Thợ-style service listing with map & worker cards
 * Categories: AC cleaning, plumbing, electrical, painting, etc.
 */

import { getWorkers, type Worker } from "@/services/workers.api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, router, Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// SERVICE CATEGORIES
// ============================================================================
const SERVICE_CATEGORIES = [
  {
    id: "ac-cleaning",
    label: "Vệ sinh máy lạnh",
    icon: "air-conditioner" as const,
    priceRange: "120,000 - 200,000đ",
    color: "#2196F3",
  },
  {
    id: "ac-repair",
    label: "Sửa máy lạnh",
    icon: "wrench" as const,
    priceRange: "200,000 - 500,000đ",
    color: "#FF9800",
  },
  {
    id: "electrical",
    label: "Thợ điện",
    icon: "flash" as const,
    priceRange: "100,000 - 300,000đ",
    color: "#FFC107",
  },
  {
    id: "plumbing",
    label: "Thợ nước",
    icon: "water-pump" as const,
    priceRange: "150,000 - 400,000đ",
    color: "#03A9F4",
  },
  {
    id: "painting",
    label: "Thợ sơn",
    icon: "format-paint" as const,
    priceRange: "200,000 - 600,000đ",
    color: "#E91E63",
  },
  {
    id: "cleaning",
    label: "Vệ sinh nhà",
    icon: "broom" as const,
    priceRange: "200,000 - 500,000đ",
    color: "#4CAF50",
  },
  {
    id: "locksmith",
    label: "Thợ khoá",
    icon: "key-variant" as const,
    priceRange: "100,000 - 300,000đ",
    color: "#795548",
  },
  {
    id: "appliance",
    label: "Sửa đồ gia dụng",
    icon: "washing-machine" as const,
    priceRange: "150,000 - 500,000đ",
    color: "#607D8B",
  },
  {
    id: "carpentry",
    label: "Thợ mộc",
    icon: "hammer" as const,
    priceRange: "200,000 - 800,000đ",
    color: "#8D6E63",
  },
  {
    id: "welding",
    label: "Thợ hàn",
    icon: "fire" as const,
    priceRange: "200,000 - 600,000đ",
    color: "#FF5722",
  },
  {
    id: "camera",
    label: "Lắp camera",
    icon: "cctv" as const,
    priceRange: "300,000 - 1,000,000đ",
    color: "#9C27B0",
  },
  {
    id: "pest-control",
    label: "Diệt côn trùng",
    icon: "bug" as const,
    priceRange: "200,000 - 500,000đ",
    color: "#F44336",
  },
];

// ============================================================================
// MAP CATEGORY → WorkerType for API filtering
// ============================================================================
const CATEGORY_TO_WORKER_TYPE: Record<string, string> = {
  "ac-cleaning": "THO_DIEN",
  "ac-repair": "THO_DIEN",
  electrical: "THO_DIEN",
  plumbing: "THO_NUOC",
  painting: "THO_SON",
  cleaning: "NHAN_CONG",
  locksmith: "THO_SAT",
  appliance: "THO_DIEN",
  carpentry: "THO_MOC",
  welding: "THO_HAN",
  camera: "THO_CAMERA",
  "pest-control": "NHAN_CONG",
};

// ============================================================================
// WORKER VIEW MODEL (unified shape for UI)
// ============================================================================
interface WorkerViewModel {
  id: string;
  name: string;
  avatar: string;
  orders: number;
  completionRate: number;
  distance: number;
  rating: number;
  price: number;
  warranty: boolean;
  warrantyDays?: number;
}

function apiWorkerToViewModel(w: Worker): WorkerViewModel {
  return {
    id: w.id,
    name: w.name.toUpperCase(),
    avatar: w.avatar || `https://i.pravatar.cc/150?u=${w.id}`,
    orders: w.completedJobs,
    completionRate: w.completedJobs > 0 ? Math.round((w.rating / 5) * 100) : 0,
    distance: Math.round(Math.random() * 80 + 10) / 10, // placeholder until geolocation
    rating: w.rating,
    price: w.dailyRate,
    warranty: w.verified,
    warrantyDays: w.verified ? 7 : undefined,
  };
}

// ============================================================================
// MOCK WORKERS DATA (fallback when API unavailable)
// ============================================================================
const MOCK_WORKERS = [
  {
    id: "w1",
    name: "NGUYỄN LÊ ANH VŨ",
    avatar: "https://i.pravatar.cc/150?img=11",
    orders: 47,
    completionRate: 48,
    distance: 3.9,
    rating: 4.7,
    price: 150000,
    warranty: false,
  },
  {
    id: "w2",
    name: "HỒ TÙNG HOÀ",
    avatar: "https://i.pravatar.cc/150?img=12",
    orders: 55,
    completionRate: 52,
    distance: 5.1,
    rating: 5.0,
    price: 200000,
    warranty: true,
    warrantyDays: 30,
  },
  {
    id: "w3",
    name: "TRẦN MINH TUẤN",
    avatar: "https://i.pravatar.cc/150?img=13",
    orders: 120,
    completionRate: 85,
    distance: 2.3,
    rating: 4.9,
    price: 180000,
    warranty: true,
    warrantyDays: 15,
  },
  {
    id: "w4",
    name: "LÊ VĂN PHONG",
    avatar: "https://i.pravatar.cc/150?img=14",
    orders: 32,
    completionRate: 65,
    distance: 7.2,
    rating: 4.5,
    price: 130000,
    warranty: false,
  },
  {
    id: "w5",
    name: "PHẠM QUỐC HƯNG",
    avatar: "https://i.pravatar.cc/150?img=15",
    orders: 89,
    completionRate: 78,
    distance: 4.5,
    rating: 4.8,
    price: 170000,
    warranty: true,
    warrantyDays: 7,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================
export default function ServiceBookingScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState(
    SERVICE_CATEGORIES[0],
  );
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [workers, setWorkers] = useState<WorkerViewModel[]>(
    MOCK_WORKERS.map((w) => ({ ...w, warranty: w.warranty ?? false })),
  );
  const [loadingWorkers, setLoadingWorkers] = useState(false);

  // Fetch workers from API when category changes
  useEffect(() => {
    let cancelled = false;
    const fetchWorkers = async () => {
      setLoadingWorkers(true);
      try {
        const workerType = CATEGORY_TO_WORKER_TYPE[selectedCategory.id];
        const res = await getWorkers({
          workerType: workerType as any,
          available: true,
          sortBy: "rating",
          sortOrder: "desc",
          limit: 20,
        });
        if (!cancelled && res.data.length > 0) {
          setWorkers(res.data.map(apiWorkerToViewModel));
        } else if (!cancelled) {
          // Fallback to mock data
          setWorkers(
            MOCK_WORKERS.map((w) => ({ ...w, warranty: w.warranty ?? false })),
          );
        }
      } catch {
        // API unavailable — keep mock data
        if (!cancelled) {
          setWorkers(
            MOCK_WORKERS.map((w) => ({ ...w, warranty: w.warranty ?? false })),
          );
        }
      } finally {
        if (!cancelled) setLoadingWorkers(false);
      }
    };
    fetchWorkers();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory.id]);

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ";
  };

  const handleBookWorker = useCallback(
    (worker: WorkerViewModel) => {
      router.push(
        `/service-booking/schedule?workerId=${worker.id}&name=${encodeURIComponent(worker.name)}&price=${worker.price}&category=${selectedCategory.id}&categoryLabel=${encodeURIComponent(selectedCategory.label)}&avatar=${encodeURIComponent(worker.avatar)}` as Href,
      );
    },
    [selectedCategory],
  );

  const handleViewProfile = useCallback((worker: WorkerViewModel) => {
    router.push(
      `/service-booking/worker-review?id=${worker.id}&name=${encodeURIComponent(worker.name)}&avatar=${encodeURIComponent(worker.avatar)}&orders=${worker.orders}&completionRate=${worker.completionRate}&rating=${worker.rating}&price=${worker.price}` as Href,
    );
  }, []);

  const handleRequestService = useCallback(() => {
    setShowRequestModal(true);
    // Auto-dismiss after 3 seconds
    setTimeout(() => setShowRequestModal(false), 4000);
  }, []);

  const handleChatWorker = useCallback((worker: WorkerViewModel) => {
    router.push(`/messages/${worker.id}` as Href);
  }, []);

  const renderWorkerCard = useCallback(
    ({ item: worker }: { item: WorkerViewModel }) => (
      <TouchableOpacity
        style={s.workerCard}
        onPress={() => handleViewProfile(worker)}
        activeOpacity={0.7}
      >
        <View style={s.workerCardContent}>
          {/* Avatar */}
          <Image source={{ uri: worker.avatar }} style={s.workerAvatar} />

          {/* Info */}
          <View style={s.workerInfo}>
            <Text style={s.workerName}>{worker.name}</Text>
            <View style={s.workerStatsRow}>
              <Text style={s.workerStat}>• {worker.orders} đơn</Text>
              <Text style={[s.workerStat, s.workerStatHighlight]}>
                • {worker.completionRate}% hoàn thành
              </Text>
            </View>
            <View style={s.workerStatsRow}>
              <Text style={s.workerStat}>• {worker.distance} km</Text>
              <Text style={s.workerStat}>
                • {worker.rating}
                <Text style={{ color: "#FFC107" }}>★</Text>
              </Text>
            </View>
            <View style={s.workerPriceRow}>
              <View style={s.priceTag}>
                <MaterialCommunityIcons
                  name="currency-usd"
                  size={14}
                  color="#4CAF50"
                />
                <Text style={s.workerPrice}>{formatPrice(worker.price)}</Text>
              </View>
            </View>
            {worker.warranty && (
              <View style={s.warrantyBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                <Text style={s.warrantyText}>
                  Cam kết bảo hành {worker.warrantyDays} ngày
                </Text>
              </View>
            )}
          </View>

          {/* Chat Button */}
          <TouchableOpacity
            style={s.chatButton}
            onPress={() => handleChatWorker(worker)}
          >
            <Ionicons name="chatbubble-ellipses" size={22} color="#FFC107" />
          </TouchableOpacity>
        </View>

        {/* Book Button */}
        <TouchableOpacity
          style={s.bookButton}
          onPress={() => handleBookWorker(worker)}
        >
          <Text style={s.bookButtonText}>Đặt ngay</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [handleBookWorker, handleChatWorker, handleViewProfile],
  );

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{selectedCategory.label}</Text>
        <TouchableOpacity style={s.headerRight}>
          <MaterialCommunityIcons
            name="account-hard-hat"
            size={24}
            color="#FFC107"
          />
        </TouchableOpacity>
      </View>

      {/* Map Area (Placeholder) */}
      <View style={s.mapContainer}>
        <Image
          source={{
            uri: "https://maps.googleapis.com/maps/api/staticmap?center=10.8,106.65&zoom=15&size=600x300&maptype=roadmap&key=placeholder",
          }}
          style={s.mapImage}
          defaultSource={require("@/assets/images/icon.png")}
        />
        <View style={s.mapOverlay}>
          <LinearGradient
            colors={["rgba(245,245,245,0)", "rgba(245,245,245,1)"]}
            style={s.mapGradient}
          />
        </View>
        <TouchableOpacity style={s.locationButton}>
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={22}
            color="#FFC107"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Category Icons Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.categoryScroll}
          contentContainerStyle={s.categoryScrollContent}
        >
          {SERVICE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                s.categoryChip,
                selectedCategory.id === cat.id && s.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <MaterialCommunityIcons
                name={cat.icon as any}
                size={20}
                color={selectedCategory.id === cat.id ? "#fff" : cat.color}
              />
              <Text
                style={[
                  s.categoryChipText,
                  selectedCategory.id === cat.id && s.categoryChipTextActive,
                ]}
                numberOfLines={1}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* "Chi tiết" link */}
        <View style={s.detailLinkRow}>
          <TouchableOpacity>
            <Text style={s.detailLink}>Chi tiết</Text>
          </TouchableOpacity>
        </View>

        {/* Price Range */}
        <View style={s.priceRangeSection}>
          <Text style={s.priceRangeLabel}>
            Giá dự kiến nếu không phát sinh thêm{" "}
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={14}
              color="#999"
            />
          </Text>
          <Text style={s.priceRangeValue}>{selectedCategory.priceRange}</Text>
        </View>

        {/* Request Service Button */}
        <TouchableOpacity
          style={s.requestServiceButton}
          onPress={handleRequestService}
        >
          <MaterialCommunityIcons name="send" size={18} color="#fff" />
          <Text style={s.requestServiceText}>Gửi yêu cầu đến thợ khu vực</Text>
        </TouchableOpacity>

        {/* Workers List */}
        {loadingWorkers ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#FFC107" />
            <Text style={{ color: "#999", marginTop: 8, fontSize: 13 }}>
              Đang tìm thợ gần bạn...
            </Text>
          </View>
        ) : (
          <FlatList
            data={workers}
            renderItem={renderWorkerCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={s.workersList}
          />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Service Request Modal */}
      <Modal
        visible={showRequestModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRequestModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={s.modalMascot}
              resizeMode="contain"
            />
            <Text style={s.modalTitle}>
              Đã gửi yêu cầu của bạn đến thợ trong khu vực
            </Text>
            <Text style={s.modalSubtitle}>
              Quá trình này có thể sẽ mất một chút thời gian nếu thợ trong khu
              vực đang bận.
            </Text>
            <Text style={s.modalNote}>Xin quý khách thông cảm</Text>
            <TouchableOpacity
              style={s.modalButton}
              onPress={() => setShowRequestModal(false)}
            >
              <Text style={s.modalButtonText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  headerRight: {
    padding: 4,
  },

  // Map
  mapContainer: {
    height: 180,
    backgroundColor: "#E8E8E8",
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ddd",
  },
  mapOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  mapGradient: {
    flex: 1,
  },
  locationButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  // Category Scroll
  categoryScroll: {
    marginTop: 12,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  categoryChipActive: {
    backgroundColor: "#FFC107",
    borderColor: "#FFC107",
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  categoryChipTextActive: {
    color: "#fff",
  },

  // Detail Link
  detailLinkRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  detailLink: {
    fontSize: 14,
    color: "#2196F3",
    textDecorationLine: "underline",
  },

  // Price Range
  priceRangeSection: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  priceRangeLabel: {
    fontSize: 14,
    color: "#666",
  },
  priceRangeValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4CAF50",
    marginTop: 4,
  },

  // Request Service
  requestServiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#FFC107",
  },
  requestServiceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },

  // Workers List
  workersList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  workerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 12,
  },
  workerCardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  workerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E0E0E0",
  },
  workerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#333",
    letterSpacing: 0.3,
  },
  workerStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 4,
  },
  workerStat: {
    fontSize: 13,
    color: "#666",
  },
  workerStatHighlight: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  workerPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  priceTag: {
    flexDirection: "row",
    alignItems: "center",
  },
  workerPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4CAF50",
  },
  warrantyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  warrantyText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  chatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF8E1",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  bookButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFC107",
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },

  // Scroll content
  scrollContent: {
    flex: 1,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
  },
  modalMascot: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    lineHeight: 26,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
  },
  modalNote: {
    fontSize: 13,
    color: "#999",
    marginTop: 8,
  },
  modalButton: {
    marginTop: 24,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: "#FFC107",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});

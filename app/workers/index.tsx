/**
 * Workers Screen - Modern & Simplified
 * Clean, minimal design with easy-to-use filters
 * @updated 2025-01-30
 */

import { ChipFilter, FilterModal, SortBar } from "@/components/ui/ModernFilter";
import { useThemeColor } from "@/hooks/use-theme-color";
import { LOCATIONS, useWorkerStats } from "@/hooks/useWorkerStats";
import { useWorkersAPI } from "@/hooks/useWorkersAPI";
import { Worker, WorkerType } from "@/services/workers.api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// ============================================================================
// COLORS
// ============================================================================
const COLORS = {
  primary: "#FF6B35",
  primaryLight: "#FFF0EB",
  success: "#4CAF50",
  warning: "#FF9800",
  danger: "#F44336",
  text: "#212121",
  textSecondary: "#757575",
  border: "#E8E8E8",
  background: "#F8F9FA",
  white: "#FFFFFF",
  star: "#FFB800",
  online: "#00C853",
};

// ============================================================================
// FILTER OPTIONS - Gọn gàng hơn
// ============================================================================
const SPECIALTIES = [
  { id: "dien", label: "Thợ điện", icon: "flash-outline" },
  { id: "nuoc", label: "Thợ nước", icon: "water-outline" },
  { id: "son", label: "Thợ sơn", icon: "color-palette-outline" },
  { id: "moc", label: "Thợ mộc", icon: "construct-outline" },
  { id: "xay", label: "Thợ xây", icon: "cube-outline" },
  { id: "han", label: "Thợ hàn", icon: "flame-outline" },
  { id: "gach", label: "Lát gạch", icon: "apps-outline" },
  { id: "thach-cao", label: "Thạch cao", icon: "layers-outline" },
  { id: "camera", label: "Camera", icon: "videocam-outline" },
  { id: "ep-coc", label: "Ép cọc", icon: "arrow-down-outline" },
  { id: "dao-dat", label: "Đào đất", icon: "construct-outline" },
  { id: "nhan-cong", label: "Nhân công", icon: "people-outline" },
];

const SORT_OPTIONS = [
  { id: "nearest", label: "Gần nhất" },
  { id: "rating", label: "Đánh giá cao" },
  { id: "price-low", label: "Giá thấp" },
  { id: "price-high", label: "Giá cao" },
];

const FILTER_CONFIG = [
  {
    id: "availability",
    label: "Tình trạng",
    options: [
      { id: "available", label: "Sẵn sàng" },
      { id: "online", label: "Đang online" },
    ],
  },
  {
    id: "experience",
    label: "Kinh nghiệm",
    options: [
      { id: "1-3", label: "1-3 năm" },
      { id: "3-5", label: "3-5 năm" },
      { id: "5+", label: "5+ năm" },
    ],
  },
  {
    id: "price",
    label: "Mức giá",
    options: [
      { id: "low", label: "< 200K" },
      { id: "medium", label: "200-300K" },
      { id: "high", label: "> 300K" },
    ],
  },
];

// Mock data
const MOCK_WORKERS = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    specialty: "Thợ điện",
    specialtyId: "dien",
    rating: 4.9,
    reviews: 127,
    price: 200000,
    experience: 8,
    available: true,
    isOnline: true,
    avatar: "https://ui-avatars.com/api/?name=An&background=FF6B35&color=fff",
    completedJobs: 342,
    location: "Quận 1, TP.HCM",
    verified: true,
  },
  {
    id: "2",
    name: "Trần Văn Bình",
    specialty: "Thợ sơn",
    specialtyId: "son",
    rating: 4.8,
    reviews: 89,
    price: 180000,
    experience: 6,
    available: true,
    isOnline: true,
    avatar: "https://ui-avatars.com/api/?name=Binh&background=4CAF50&color=fff",
    completedJobs: 256,
    location: "Quận 3, TP.HCM",
    verified: true,
  },
  {
    id: "3",
    name: "Lê Hoàng Cường",
    specialty: "Thợ nước",
    specialtyId: "nuoc",
    rating: 4.7,
    reviews: 156,
    price: 220000,
    experience: 10,
    available: false,
    isOnline: false,
    avatar: "https://ui-avatars.com/api/?name=Cuong&background=2196F3&color=fff",
    completedJobs: 489,
    location: "Bình Thạnh, TP.HCM",
    verified: true,
  },
  {
    id: "4",
    name: "Phạm Minh Đức",
    specialty: "Thợ mộc",
    specialtyId: "moc",
    rating: 4.9,
    reviews: 203,
    price: 250000,
    experience: 12,
    available: true,
    isOnline: true,
    avatar: "https://ui-avatars.com/api/?name=Duc&background=9C27B0&color=fff",
    completedJobs: 567,
    location: "Quận 7, TP.HCM",
    verified: true,
  },
];

// ============================================================================
// WORKER CARD - Clean & Modern
// ============================================================================
interface WorkerCardProps {
  worker: any;
  onPress: () => void;
  onCall: () => void;
  onBook: () => void;
}

const WorkerCard = ({ worker, onPress, onCall, onBook }: WorkerCardProps) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
    {/* Header */}
    <View style={styles.cardHeader}>
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: worker.avatar }} style={styles.avatar} />
        {worker.isOnline && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.cardInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.workerName} numberOfLines={1}>{worker.name}</Text>
          {worker.verified && (
            <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
          )}
        </View>
        <Text style={styles.workerSpecialty}>
          {worker.specialty} • {worker.experience} năm
        </Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={COLORS.star} />
          <Text style={styles.rating}>{worker.rating}</Text>
          <Text style={styles.reviews}>({worker.reviews})</Text>
          <Text style={styles.jobs}>• {worker.completedJobs} việc</Text>
        </View>
      </View>

      <View style={[
        styles.statusBadge,
        worker.available ? styles.statusAvailable : styles.statusBusy
      ]}>
        <Text style={[
          styles.statusText,
          { color: worker.available ? COLORS.success : COLORS.danger }
        ]}>
          {worker.available ? "Sẵn sàng" : "Bận"}
        </Text>
      </View>
    </View>

    {/* Footer */}
    <View style={styles.cardFooter}>
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
        <Text style={styles.location} numberOfLines={1}>{worker.location}</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{worker.price.toLocaleString("vi-VN")}đ</Text>
        <Text style={styles.priceUnit}>/giờ</Text>
      </View>
    </View>

    {/* Actions */}
    <View style={styles.cardActions}>
      <TouchableOpacity 
        style={styles.callBtn} 
        onPress={onCall}
        disabled={!worker.available}
      >
        <Ionicons 
          name="call-outline" 
          size={18} 
          color={worker.available ? COLORS.primary : COLORS.textSecondary} 
        />
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.bookBtn, !worker.available && styles.bookBtnDisabled]}
        onPress={onBook}
        disabled={!worker.available}
      >
        <Text style={styles.bookBtnText}>
          {worker.available ? "Đặt ngay" : "Không khả dụng"}
        </Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function WorkersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { specialty: specialtyParam } = useLocalSearchParams<{ specialty?: string }>();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedSort, setSelectedSort] = useState("nearest");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("TP.HCM");
  const [refreshing, setRefreshing] = useState(false);

  // API Hooks
  const { stats, loading: statsLoading, refresh: refreshStats } = useWorkerStats();
  const {
    workers: apiWorkers,
    loading: workersLoading,
    refreshWorkers,
    loadWorkers,
  } = useWorkersAPI({ autoLoad: true });

  // Set specialty from URL
  useEffect(() => {
    if (specialtyParam) {
      const exists = SPECIALTIES.some((s) => s.id === specialtyParam);
      if (exists) setSelectedSpecialty(specialtyParam);
    }
  }, [specialtyParam]);

  // Filter workers
  const filteredWorkers = useMemo(() => {
    let workers = apiWorkers.length > 0 ? apiWorkers.map(normalizeWorker) : MOCK_WORKERS;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      workers = workers.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.specialty.toLowerCase().includes(q)
      );
    }

    if (selectedSpecialty !== "all") {
      workers = workers.filter((w) => w.specialtyId === selectedSpecialty);
    }

    if (filterValues.availability === "available") {
      workers = workers.filter((w) => w.available);
    } else if (filterValues.availability === "online") {
      workers = workers.filter((w) => w.isOnline);
    }

    // Sort
    if (selectedSort === "rating") {
      workers = [...workers].sort((a, b) => b.rating - a.rating);
    } else if (selectedSort === "price-low") {
      workers = [...workers].sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price-high") {
      workers = [...workers].sort((a, b) => b.price - a.price);
    }

    return workers;
  }, [apiWorkers, searchQuery, selectedSpecialty, selectedSort, filterValues]);

  // Stats
  const totalWorkers = filteredWorkers.length;
  const availableWorkers = filteredWorkers.filter((w) => w.available).length;
  const loading = workersLoading || statsLoading;

  // Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshWorkers(), refreshStats()]);
    setRefreshing(false);
  }, [refreshWorkers, refreshStats]);

  const handleFilterChange = (filterId: string, value: string | string[]) => {
    setFilterValues((prev) => ({ ...prev, [filterId]: value as string }));
  };

  const clearFilters = () => {
    setFilterValues({});
    setSelectedSpecialty("all");
  };

  const activeFilterCount = Object.values(filterValues).filter(
    (v) => v && v !== "all"
  ).length + (selectedSpecialty !== "all" ? 1 : 0);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, "#FF8A5B"]}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tìm thợ</Text>
          <TouchableOpacity 
            style={styles.locationBtn}
            onPress={() => setShowLocationModal(true)}
          >
            <Ionicons name="location" size={18} color={COLORS.white} />
            <Text style={styles.locationBtnText}>{selectedLocation}</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, chuyên môn..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
          <View style={styles.searchDivider} />
          <TouchableOpacity 
            style={styles.filterBtn}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options-outline" size={20} color={COLORS.primary} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Specialty Filter Chips */}
      <ChipFilter
        options={SPECIALTIES}
        selected={selectedSpecialty}
        onSelect={setSelectedSpecialty}
        showAll={true}
      />

      {/* Sort & Results */}
      <SortBar
        options={SORT_OPTIONS}
        selected={selectedSort}
        onSelect={setSelectedSort}
        resultCount={totalWorkers}
      />

      {/* Workers List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tìm thợ...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredWorkers}
          renderItem={({ item }) => (
            <WorkerCard
              worker={item}
              onPress={() => router.push(`/finishing/worker-profile/${item.id}` as any)}
              onCall={() => console.log("Call:", item.name)}
              onBook={() => router.push(`/booking/worker/${item.id}` as any)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyTitle}>Không tìm thấy thợ</Text>
              <Text style={styles.emptyText}>
                Thử thay đổi bộ lọc hoặc từ khóa khác
              </Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={FILTER_CONFIG}
        values={filterValues}
        onChange={handleFilterChange}
        onApply={() => setShowFilterModal(false)}
        onClear={clearFilters}
      />

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLocationModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn khu vực</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {LOCATIONS.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={[
                    styles.locationOption,
                    selectedLocation === loc && styles.locationOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedLocation(loc);
                    setShowLocationModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.locationOptionText,
                      selectedLocation === loc && styles.locationOptionTextActive,
                    ]}
                  >
                    {loc}
                  </Text>
                  {selectedLocation === loc && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Helper to normalize API worker
function normalizeWorker(w: Worker) {
  const labels: Record<string, string> = {
    EP_COC: "Ép cọc", DAO_DAT: "Đào đất", THO_XAY: "Thợ xây",
    THO_DIEN: "Thợ điện", THO_NUOC: "Thợ nước", THO_SON: "Thợ sơn",
    THO_MOC: "Thợ mộc", THO_HAN: "Thợ hàn", THO_GACH: "Thợ lát gạch",
    THO_THACH_CAO: "Thợ thạch cao", THO_CAMERA: "Thợ camera",
  };
  return {
    id: w.id,
    name: w.name,
    specialty: labels[w.workerType] || w.workerType,
    specialtyId: w.workerType.toLowerCase().replace("_", "-"),
    rating: w.rating || 4.5,
    reviews: w.reviewCount || 0,
    price: w.dailyRate || 300000,
    experience: w.experience || 0,
    available: w.availability === "available",
    isOnline: w.availability !== "offline",
    avatar: w.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name)}&background=FF6B35&color=fff`,
    completedJobs: w.completedJobs || 0,
    location: w.location || "",
    verified: w.verified || false,
  };
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  locationBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "500",
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  searchDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  filterBtn: {
    padding: 6,
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.white,
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  workerSpecialty: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  reviews: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  jobs: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusAvailable: {
    backgroundColor: "#E8F5E9",
  },
  statusBusy: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Card Footer
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  location: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },

  // Actions
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 12,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  bookBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  bookBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  bookBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },

  // List
  listContent: {
    padding: 16,
    paddingTop: 8,
  },

  // Loading & Empty
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  locationOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  locationOptionActive: {
    backgroundColor: COLORS.primaryLight,
  },
  locationOptionText: {
    fontSize: 15,
    color: COLORS.text,
  },
  locationOptionTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});

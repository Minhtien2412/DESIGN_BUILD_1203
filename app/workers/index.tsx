/**
 * Workers Screen - Modern & Simplified
 * Clean, minimal design with easy-to-use filters
 * @updated 2025-01-30
 */

import { ChipFilter, FilterModal, SortBar } from "@/components/ui/ModernFilter";
import { LOCATIONS, useWorkerStats } from "@/hooks/useWorkerStats";
import { useWorkersAPI } from "@/hooks/useWorkersAPI";
import { useI18n } from "@/services/i18nService";
import { Worker } from "@/services/workers.api";
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
  primary: "#0D9488",
  primaryLight: "#F0FDFA",
  accent: "#0F766E",
  accentLight: "#CCFBF1",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  background: "#F1F5F9",
  white: "#FFFFFF",
  star: "#F59E0B",
  online: "#10B981",
};

// ============================================================================
// FILTER OPTIONS - Gọn gàng hơn
// ============================================================================
const SPECIALTY_KEYS = [
  { id: "dien", labelKey: "workerList.electrician", icon: "flash-outline" },
  { id: "nuoc", labelKey: "workerList.plumber", icon: "water-outline" },
  { id: "son", labelKey: "workerList.painter", icon: "color-palette-outline" },
  { id: "moc", labelKey: "workerList.carpenter", icon: "construct-outline" },
  { id: "xay", labelKey: "workerList.mason", icon: "cube-outline" },
  { id: "han", labelKey: "workerList.welder", icon: "flame-outline" },
  { id: "gach", labelKey: "workerList.tiler", icon: "apps-outline" },
  { id: "thach-cao", labelKey: "workerList.drywall", icon: "layers-outline" },
  { id: "camera", labelKey: "workerList.camera", icon: "videocam-outline" },
  { id: "ep-coc", labelKey: "workerList.piling", icon: "arrow-down-outline" },
  {
    id: "dao-dat",
    labelKey: "workerList.excavation",
    icon: "construct-outline",
  },
  { id: "nhan-cong", labelKey: "workerList.labor", icon: "people-outline" },
];

const SORT_OPTION_KEYS = [
  { id: "nearest", labelKey: "workerList.sortNearest" },
  { id: "rating", labelKey: "workerList.sortRating" },
  { id: "price-low", labelKey: "workerList.sortPriceLow" },
  { id: "price-high", labelKey: "workerList.sortPriceHigh" },
];

const FILTER_CONFIG_KEYS = [
  {
    id: "availability",
    labelKey: "workerList.status",
    options: [
      { id: "available", labelKey: "workerList.available" },
      { id: "online", labelKey: "workerList.online" },
    ],
  },
  {
    id: "experience",
    labelKey: "workerList.experience",
    options: [
      { id: "1-3", labelKey: "workerList.exp1to3" },
      { id: "3-5", labelKey: "workerList.exp3to5" },
      { id: "5+", labelKey: "workerList.exp5plus" },
    ],
  },
  {
    id: "price",
    labelKey: "workerList.priceRange",
    options: [
      { id: "low", labelKey: "workerList.priceLow" },
      { id: "medium", labelKey: "workerList.priceMid" },
      { id: "high", labelKey: "workerList.priceHigh" },
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
    avatar:
      "https://ui-avatars.com/api/?name=Cuong&background=2196F3&color=fff",
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

const WorkerCard = ({ worker, onPress, onCall, onBook }: WorkerCardProps) => {
  const { t } = useI18n();
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: worker.avatar }} style={styles.avatar} />
          {worker.isOnline && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.workerName} numberOfLines={1}>
              {worker.name}
            </Text>
            {worker.verified && (
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLORS.primary}
              />
            )}
          </View>
          <Text style={styles.workerSpecialty}>
            {worker.specialty} •{" "}
            {t("workerList.yearsExp").replace("{n}", String(worker.experience))}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={COLORS.star} />
            <Text style={styles.rating}>{worker.rating}</Text>
            <Text style={styles.reviews}>({worker.reviews})</Text>
            <Text style={styles.jobs}>
              •{" "}
              {t("workerList.jobs").replace(
                "{n}",
                String(worker.completedJobs),
              )}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            worker.available ? styles.statusAvailable : styles.statusBusy,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: worker.available ? COLORS.success : COLORS.danger },
            ]}
          >
            {worker.available
              ? t("workerList.available")
              : t("workerList.busy")}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={COLORS.textSecondary}
          />
          <Text style={styles.location} numberOfLines={1}>
            {worker.location}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {worker.price.toLocaleString("vi-VN")}đ
          </Text>
          <Text style={styles.priceUnit}>{t("workerList.perHour")}</Text>
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
            {worker.available
              ? t("workerList.bookNow")
              : t("workerList.unavailable")}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function WorkersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useI18n();
  const { specialty: specialtyParam } = useLocalSearchParams<{
    specialty?: string;
  }>();

  // Translate static arrays for filter components
  const SPECIALTIES = useMemo(
    () => SPECIALTY_KEYS.map((s) => ({ ...s, label: t(s.labelKey) })),
    [t],
  );
  const SORT_OPTIONS = useMemo(
    () => SORT_OPTION_KEYS.map((s) => ({ ...s, label: t(s.labelKey) })),
    [t],
  );
  const FILTER_CONFIG = useMemo(
    () =>
      FILTER_CONFIG_KEYS.map((f) => ({
        ...f,
        label: t(f.labelKey),
        options: f.options.map((o) => ({ ...o, label: t(o.labelKey) })),
      })),
    [t],
  );

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
  const {
    stats,
    loading: statsLoading,
    refresh: refreshStats,
  } = useWorkerStats();
  const {
    workers: apiWorkers,
    loading: workersLoading,
    refreshWorkers,
    loadWorkers,
  } = useWorkersAPI({ autoLoad: true });

  // Set specialty from URL
  useEffect(() => {
    if (specialtyParam) {
      const exists = SPECIALTY_KEYS.some((s) => s.id === specialtyParam);
      if (exists) setSelectedSpecialty(specialtyParam);
    }
  }, [specialtyParam]);

  // Filter workers
  const filteredWorkers = useMemo(() => {
    let workers =
      apiWorkers.length > 0
        ? apiWorkers.map((w) => normalizeWorker(w, t))
        : MOCK_WORKERS;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      workers = workers.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.specialty.toLowerCase().includes(q),
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
  }, [
    apiWorkers,
    searchQuery,
    selectedSpecialty,
    selectedSort,
    filterValues,
    t,
  ]);

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

  const activeFilterCount =
    Object.values(filterValues).filter((v) => v && v !== "all").length +
    (selectedSpecialty !== "all" ? 1 : 0);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient
        colors={["#0D9488", "#0F766E", "#115E59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("workerList.findWorker")}</Text>
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
            placeholder={t("workerList.searchPlaceholder")}
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={COLORS.textSecondary}
              />
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
          <Text style={styles.loadingText}>{t("workerList.searching")}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredWorkers}
          renderItem={({ item }) => (
            <WorkerCard
              worker={item}
              onPress={() =>
                router.push(`/finishing/worker-profile/${item.id}` as any)
              }
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
              <Text style={styles.emptyTitle}>
                {t("workerList.noWorkersFound")}
              </Text>
              <Text style={styles.emptyText}>
                {t("workerList.tryOtherFilters")}
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
              <Text style={styles.modalTitle}>
                {t("workerList.selectArea")}
              </Text>
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
                      selectedLocation === loc &&
                        styles.locationOptionTextActive,
                    ]}
                  >
                    {loc}
                  </Text>
                  {selectedLocation === loc && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={COLORS.primary}
                    />
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

// Helper to normalize API worker - uses translation keys
const WORKER_TYPE_LABEL_KEYS: Record<string, string> = {
  EP_COC: "workerList.piling",
  DAO_DAT: "workerList.excavation",
  THO_XAY: "workerList.mason",
  THO_DIEN: "workerList.electrician",
  THO_NUOC: "workerList.plumber",
  THO_SON: "workerList.painter",
  THO_MOC: "workerList.carpenter",
  THO_HAN: "workerList.welder",
  THO_GACH: "workerList.tiledFloor",
  THO_THACH_CAO: "workerList.drywallWorker",
  THO_CAMERA: "workerList.cameraWorker",
  THO_SAT: "workerList.ironWorker",
  THO_COFFA: "workerList.formworker",
  NHAN_CONG: "workerList.labor",
  THO_LAM_CUA: "workerList.doorMaker",
  THO_LAN_CAN: "workerList.railingWorker",
  VAT_LIEU: "workerList.materials",
  THO_DIEN_NUOC: "workerList.plumberElectrician",
  THO_NHOM_KINH: "workerList.glassWorker",
  KY_SU: "workerList.engineer",
  GIAM_SAT: "workerList.supervisor",
};

function normalizeWorker(w: Worker, t?: (key: string) => string) {
  const translate = t || ((k: string) => k);
  const sid = w.workerType.toLowerCase().replace(/_/g, "-");
  return {
    id: w.id,
    name: w.name,
    specialty: WORKER_TYPE_LABEL_KEYS[w.workerType]
      ? translate(WORKER_TYPE_LABEL_KEYS[w.workerType])
      : w.workerType.replace(/_/g, " "),
    specialtyId: sid,
    rating: w.rating || 4.5,
    reviews: w.reviewCount || 0,
    price: w.dailyRate || 300000,
    experience: w.experience || 0,
    available: w.availability === "available",
    isOnline: w.availability !== "offline",
    avatar:
      w.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name)}&background=0D9488&color=fff`,
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
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: -0.3,
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
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
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
    fontWeight: "700",
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
    borderRadius: 14,
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

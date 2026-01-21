/**
 * Workers Screen - Modern Real-time Worker Finder
 * Optimized for construction industry with real-time availability
 * @updated 2026-01-19
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { LOCATIONS, useWorkerStats } from "@/hooks/useWorkerStats";
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
// COLORS & CONSTANTS
// ============================================================================
const COLORS = {
  primary: "#FF6B35",
  primaryLight: "#FFF0EB",
  success: "#4CAF50",
  successLight: "#E8F5E9",
  warning: "#FF9800",
  warningLight: "#FFF3E0",
  danger: "#F44336",
  text: "#212121",
  textSecondary: "#757575",
  border: "#E0E0E0",
  background: "#F5F5F5",
  white: "#FFFFFF",
  star: "#FFB800",
  online: "#00C853",
};

// Worker specialties with icons
const SPECIALTIES = [
  { id: "all", label: "Tất cả", icon: "grid-outline" },
  { id: "ep-coc", label: "Ép cọc", icon: "arrow-down-outline" },
  { id: "dao-dat", label: "Đào đất", icon: "construct-outline" },
  { id: "nhan-cong", label: "Nhân công", icon: "people-outline" },
  { id: "tho-xay", label: "Thợ xây", icon: "cube-outline" },
  { id: "tho-sat", label: "Thợ sắt", icon: "hammer-outline" },
  { id: "tho-coffa", label: "Thợ coffa", icon: "layers-outline" },
  { id: "co-khi", label: "Cơ khí", icon: "settings-outline" },
  { id: "to-tuong", label: "Tô tường", icon: "brush-outline" },
  { id: "cop-pha", label: "Cốp pha", icon: "copy-outline" },
  { id: "dien", label: "Thợ điện", icon: "flash-outline" },
  { id: "nuoc", label: "Thợ nước", icon: "water-outline" },
  { id: "son", label: "Thợ sơn", icon: "color-palette-outline" },
  { id: "moc", label: "Thợ mộc", icon: "construct-outline" },
  { id: "xay", label: "Thợ xây", icon: "cube-outline" },
  { id: "han", label: "Thợ hàn", icon: "flame-outline" },
  { id: "gach", label: "Thợ lát gạch", icon: "apps-outline" },
  { id: "thach-cao", label: "Thợ thạch cao", icon: "layers-outline" },
  { id: "camera", label: "Thợ camera", icon: "videocam-outline" },
];

// Sort options
const SORT_OPTIONS = [
  { id: "nearest", label: "Gần nhất", icon: "location-outline" },
  { id: "rating", label: "Đánh giá cao", icon: "star-outline" },
  { id: "price-low", label: "Giá thấp nhất", icon: "trending-down-outline" },
  { id: "price-high", label: "Giá cao nhất", icon: "trending-up-outline" },
  { id: "available", label: "Sẵn sàng", icon: "checkmark-circle-outline" },
];

// Mock workers data - sẽ được thay bằng API thực
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
    distance: 2.3,
    available: true,
    isOnline: true,
    avatar:
      "https://ui-avatars.com/api/?name=An&background=FF6B35&color=fff&size=128",
    completedJobs: 342,
    responseTime: "< 5 phút",
    location: "Quận 1, TP.HCM",
    verified: true,
    badges: ["top-rated", "fast-response"],
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
    distance: 1.5,
    available: true,
    isOnline: true,
    avatar:
      "https://ui-avatars.com/api/?name=Binh&background=4CAF50&color=fff&size=128",
    completedJobs: 256,
    responseTime: "< 10 phút",
    location: "Quận 3, TP.HCM",
    verified: true,
    badges: ["experienced"],
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
    distance: 3.1,
    available: false,
    isOnline: false,
    avatar:
      "https://ui-avatars.com/api/?name=Cuong&background=2196F3&color=fff&size=128",
    completedJobs: 489,
    responseTime: "< 15 phút",
    location: "Quận Bình Thạnh, TP.HCM",
    verified: true,
    badges: ["expert", "top-rated"],
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
    distance: 4.2,
    available: true,
    isOnline: true,
    avatar:
      "https://ui-avatars.com/api/?name=Duc&background=9C27B0&color=fff&size=128",
    completedJobs: 567,
    responseTime: "< 5 phút",
    location: "Quận 7, TP.HCM",
    verified: true,
    badges: ["master", "top-rated", "fast-response"],
  },
  {
    id: "5",
    name: "Hoàng Văn Em",
    specialty: "Thợ xây",
    specialtyId: "xay",
    rating: 4.6,
    reviews: 78,
    price: 190000,
    experience: 5,
    distance: 1.8,
    available: true,
    isOnline: false,
    avatar:
      "https://ui-avatars.com/api/?name=Em&background=FF9800&color=fff&size=128",
    completedJobs: 156,
    responseTime: "< 30 phút",
    location: "Quận 2, TP.HCM",
    verified: false,
    badges: [],
  },
  {
    id: "6",
    name: "Võ Thanh Phong",
    specialty: "Thợ hàn",
    specialtyId: "han",
    rating: 4.8,
    reviews: 134,
    price: 230000,
    experience: 9,
    distance: 2.7,
    available: true,
    isOnline: true,
    avatar:
      "https://ui-avatars.com/api/?name=Phong&background=E91E63&color=fff&size=128",
    completedJobs: 423,
    responseTime: "< 10 phút",
    location: "Quận Tân Bình, TP.HCM",
    verified: true,
    badges: ["expert", "fast-response"],
  },
];

// ============================================================================
// COMPONENTS
// ============================================================================

// Search Header Component
const SearchHeader = ({
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationPress,
}: {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedLocation: string;
  onLocationPress: () => void;
}) => (
  <View style={styles.searchHeader}>
    {/* Location Selector */}
    <TouchableOpacity style={styles.locationSelector} onPress={onLocationPress}>
      <Ionicons name="location" size={18} color={COLORS.primary} />
      <Text style={styles.locationText} numberOfLines={1}>
        {selectedLocation}
      </Text>
      <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
    </TouchableOpacity>

    {/* Search Input */}
    <View style={styles.searchInputContainer}>
      <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm thợ theo tên, chuyên môn..."
        placeholderTextColor={COLORS.textSecondary}
        value={searchQuery}
        onChangeText={onSearchChange}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => onSearchChange("")}>
          <Ionicons
            name="close-circle"
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// Specialty Filter Chip
const SpecialtyChip = ({
  item,
  isActive,
  onPress,
}: {
  item: (typeof SPECIALTIES)[0];
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.specialtyChip, isActive && styles.specialtyChipActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons
      name={item.icon as any}
      size={16}
      color={isActive ? COLORS.white : COLORS.textSecondary}
    />
    <Text
      style={[
        styles.specialtyChipText,
        isActive && styles.specialtyChipTextActive,
      ]}
    >
      {item.label}
    </Text>
  </TouchableOpacity>
);

// Quick Stats Bar
const QuickStatsBar = ({
  totalWorkers,
  availableWorkers,
  onlineWorkers,
}: {
  totalWorkers: number;
  availableWorkers: number;
  onlineWorkers: number;
}) => (
  <View style={styles.statsBar}>
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{totalWorkers}</Text>
      <Text style={styles.statLabel}>Tổng số thợ</Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <View style={styles.statValueRow}>
        <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
        <Text style={[styles.statValue, { color: COLORS.success }]}>
          {availableWorkers}
        </Text>
      </View>
      <Text style={styles.statLabel}>Sẵn sàng</Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <View style={styles.statValueRow}>
        <View style={[styles.statusDot, { backgroundColor: COLORS.online }]} />
        <Text style={[styles.statValue, { color: COLORS.online }]}>
          {onlineWorkers}
        </Text>
      </View>
      <Text style={styles.statLabel}>Đang online</Text>
    </View>
  </View>
);

// Worker Badge
const WorkerBadge = ({ badge }: { badge: string }) => {
  const badgeConfig: Record<
    string,
    { label: string; color: string; icon: string }
  > = {
    "top-rated": { label: "Top", color: "#FFB800", icon: "star" },
    "fast-response": { label: "Nhanh", color: "#4CAF50", icon: "flash" },
    experienced: { label: "5+ năm", color: "#2196F3", icon: "ribbon" },
    expert: { label: "Chuyên gia", color: "#9C27B0", icon: "medal" },
    master: { label: "Bậc thầy", color: "#FF5722", icon: "trophy" },
  };

  const config = badgeConfig[badge];
  if (!config) return null;

  return (
    <View
      style={[styles.workerBadge, { backgroundColor: `${config.color}20` }]}
    >
      <Ionicons name={config.icon as any} size={10} color={config.color} />
      <Text style={[styles.workerBadgeText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

// Worker Card Component
const WorkerCard = ({
  worker,
  onPress,
  onCall,
  onBook,
}: {
  worker: (typeof MOCK_WORKERS)[0];
  onPress: () => void;
  onCall: () => void;
  onBook: () => void;
}) => (
  <TouchableOpacity
    style={styles.workerCard}
    onPress={onPress}
    activeOpacity={0.95}
  >
    {/* Card Header */}
    <View style={styles.workerCardHeader}>
      {/* Avatar with online status */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: worker.avatar }} style={styles.avatar} />
        {worker.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      {/* Worker Info */}
      <View style={styles.workerMainInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.workerName}>{worker.name}</Text>
          {worker.verified && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={COLORS.primary}
            />
          )}
        </View>
        <View style={styles.specialtyRow}>
          <Text style={styles.workerSpecialty}>{worker.specialty}</Text>
          <Text style={styles.experienceText}>
            • {worker.experience} năm KN
          </Text>
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={COLORS.star} />
          <Text style={styles.ratingText}>{worker.rating}</Text>
          <Text style={styles.reviewsText}>({worker.reviews})</Text>
          <Text style={styles.completedText}>
            • {worker.completedJobs} việc
          </Text>
        </View>
      </View>

      {/* Status Badge */}
      <View
        style={[
          styles.statusBadge,
          worker.available ? styles.statusAvailable : styles.statusBusy,
        ]}
      >
        <View
          style={[
            styles.statusDotSmall,
            {
              backgroundColor: worker.available
                ? COLORS.success
                : COLORS.danger,
            },
          ]}
        />
        <Text
          style={[
            styles.statusText,
            { color: worker.available ? COLORS.success : COLORS.danger },
          ]}
        >
          {worker.available ? "Sẵn sàng" : "Bận"}
        </Text>
      </View>
    </View>

    {/* Badges */}
    {worker.badges.length > 0 && (
      <View style={styles.badgesRow}>
        {worker.badges.slice(0, 3).map((badge) => (
          <WorkerBadge key={badge} badge={badge} />
        ))}
      </View>
    )}

    {/* Location & Response */}
    <View style={styles.locationRow}>
      <View style={styles.locationInfo}>
        <Ionicons
          name="location-outline"
          size={14}
          color={COLORS.textSecondary}
        />
        <Text style={styles.locationText2}>{worker.distance} km</Text>
        <Text style={styles.locationDot}>•</Text>
        <Text style={styles.locationAddress} numberOfLines={1}>
          {worker.location}
        </Text>
      </View>
      <View style={styles.responseInfo}>
        <Ionicons name="time-outline" size={14} color={COLORS.success} />
        <Text style={styles.responseText}>{worker.responseTime}</Text>
      </View>
    </View>

    {/* Card Footer */}
    <View style={styles.workerCardFooter}>
      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Giá từ</Text>
        <Text style={styles.priceValue}>
          {worker.price.toLocaleString("vi-VN")}đ
          <Text style={styles.priceUnit}>/giờ</Text>
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.callButton}
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
          style={[
            styles.bookButton,
            !worker.available && styles.bookButtonDisabled,
          ]}
          onPress={onBook}
          disabled={!worker.available}
        >
          <Text style={styles.bookButtonText}>
            {worker.available ? "Đặt ngay" : "Không khả dụng"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

// Location Modal
const LocationModal = ({
  visible,
  selectedLocation,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedLocation: string;
  onSelect: (location: string) => void;
  onClose: () => void;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Chọn khu vực</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <ScrollView>
          {LOCATIONS.map((location) => (
            <TouchableOpacity
              key={location}
              style={[
                styles.locationOption,
                selectedLocation === location && styles.locationOptionActive,
              ]}
              onPress={() => {
                onSelect(location);
                onClose();
              }}
            >
              <Ionicons
                name={
                  selectedLocation === location
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={20}
                color={
                  selectedLocation === location
                    ? COLORS.primary
                    : COLORS.textSecondary
                }
              />
              <Text
                style={[
                  styles.locationOptionText,
                  selectedLocation === location &&
                    styles.locationOptionTextActive,
                ]}
              >
                {location}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function WorkersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const backgroundColor = useThemeColor({}, "background");

  // Get query params from URL
  const { specialty: specialtyParam } = useLocalSearchParams<{
    specialty?: string;
  }>();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedSort, setSelectedSort] = useState("nearest");
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Sài Gòn");

  // Set specialty from URL param on mount
  useEffect(() => {
    if (specialtyParam) {
      // Check if specialty exists in SPECIALTIES
      const exists = SPECIALTIES.some((s) => s.id === specialtyParam);
      if (exists) {
        setSelectedSpecialty(specialtyParam);
      }
    }
  }, [specialtyParam]);

  // Worker stats from API
  const { stats, loading, refresh } = useWorkerStats();

  // Filter and sort workers
  const filteredWorkers = useMemo(() => {
    let result = [...MOCK_WORKERS];

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(query) ||
          w.specialty.toLowerCase().includes(query)
      );
    }

    // Filter by specialty
    if (selectedSpecialty !== "all") {
      result = result.filter((w) => w.specialtyId === selectedSpecialty);
    }

    // Sort
    switch (selectedSort) {
      case "nearest":
        result.sort((a, b) => a.distance - b.distance);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "available":
        result.sort((a, b) => (b.available ? 1 : 0) - (a.available ? 1 : 0));
        break;
    }

    return result;
  }, [searchQuery, selectedSpecialty, selectedSort]);

  // Stats
  const totalWorkers = MOCK_WORKERS.length;
  const availableWorkers = MOCK_WORKERS.filter((w) => w.available).length;
  const onlineWorkers = MOCK_WORKERS.filter((w) => w.isOnline).length;

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refresh().finally(() => setRefreshing(false));
  }, [refresh]);

  const handleWorkerPress = (worker: (typeof MOCK_WORKERS)[0]) => {
    router.push(`/finishing/worker-profile/${worker.id}` as any);
  };

  const handleCall = (worker: (typeof MOCK_WORKERS)[0]) => {
    // TODO: Implement call functionality
    console.log("Calling:", worker.name);
  };

  const handleBook = (worker: (typeof MOCK_WORKERS)[0]) => {
    router.push(`/booking/worker/${worker.id}` as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Custom Header */}
      <LinearGradient
        colors={[COLORS.primary, "#FF8A5B"]}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tìm thợ</Text>
          <TouchableOpacity style={styles.mapButton}>
            <Ionicons name="map-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <SearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedLocation={selectedLocation}
          onLocationPress={() => setShowLocationModal(true)}
        />
      </LinearGradient>

      {/* Quick Stats */}
      <QuickStatsBar
        totalWorkers={totalWorkers}
        availableWorkers={availableWorkers}
        onlineWorkers={onlineWorkers}
      />

      {/* Specialty Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.specialtyFilter}
        contentContainerStyle={styles.specialtyFilterContent}
      >
        {SPECIALTIES.map((item) => (
          <SpecialtyChip
            key={item.id}
            item={item}
            isActive={selectedSpecialty === item.id}
            onPress={() => setSelectedSpecialty(item.id)}
          />
        ))}
      </ScrollView>

      {/* Sort Options */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortFilter}
        contentContainerStyle={styles.sortFilterContent}
      >
        {SORT_OPTIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.sortChip,
              selectedSort === item.id && styles.sortChipActive,
            ]}
            onPress={() => setSelectedSort(item.id)}
          >
            <Ionicons
              name={item.icon as any}
              size={14}
              color={
                selectedSort === item.id ? COLORS.primary : COLORS.textSecondary
              }
            />
            <Text
              style={[
                styles.sortChipText,
                selectedSort === item.id && styles.sortChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredWorkers.length} thợ{" "}
          {selectedSpecialty !== "all"
            ? `"${SPECIALTIES.find((s) => s.id === selectedSpecialty)?.label}"`
            : ""}{" "}
          tại {selectedLocation}
        </Text>
      </View>

      {/* Workers List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tìm thợ gần bạn...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredWorkers}
          renderItem={({ item }) => (
            <WorkerCard
              worker={item}
              onPress={() => handleWorkerPress(item)}
              onCall={() => handleCall(item)}
              onBook={() => handleBook(item)}
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
                Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
              </Text>
            </View>
          }
        />
      )}

      {/* Location Modal */}
      <LocationModal
        visible={showLocationModal}
        selectedLocation={selectedLocation}
        onSelect={setSelectedLocation}
        onClose={() => setShowLocationModal(false)}
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backButton: {
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
  mapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Search Header
  searchHeader: {
    paddingHorizontal: 16,
    gap: 10,
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
    maxWidth: 150,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },

  // Stats Bar
  statsBar: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: COLORS.border,
  },

  // Specialty Filter
  specialtyFilter: {
    backgroundColor: COLORS.white,
    maxHeight: 56,
  },
  specialtyFilterContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  specialtyChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 8,
    gap: 6,
  },
  specialtyChipActive: {
    backgroundColor: COLORS.primary,
  },
  specialtyChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  specialtyChipTextActive: {
    color: COLORS.white,
  },

  // Sort Filter
  sortFilter: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    maxHeight: 48,
  },
  sortFilterContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "transparent",
    marginRight: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  sortChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sortChipTextActive: {
    color: COLORS.primary,
    fontWeight: "500",
  },

  // Results Header
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
  },
  resultsCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Worker Card
  workerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  workerCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
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
  workerMainInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  specialtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  workerSpecialty: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
  },
  experienceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  completedText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusAvailable: {
    backgroundColor: COLORS.successLight,
  },
  statusBusy: {
    backgroundColor: "#FFEBEE",
  },
  statusDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Badges
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 6,
  },
  workerBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  workerBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },

  // Location Row
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationText2: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: "500",
  },
  locationDot: {
    color: COLORS.border,
    marginHorizontal: 6,
  },
  locationAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  responseInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  responseText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: "500",
  },

  // Card Footer
  workerCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  priceContainer: {},
  priceLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: 13,
    fontWeight: "400",
    color: COLORS.textSecondary,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
  },
  bookButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },

  // List
  listContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  locationOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    fontWeight: "500",
  },
});

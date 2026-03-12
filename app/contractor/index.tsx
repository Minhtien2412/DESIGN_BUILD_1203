/**
 * Contractor Screen - Modern & Clean
 * Simplified filter design with better UX
 * @updated 2025-01-30
 */

import { ChipFilter, FilterModal, SortBar } from "@/components/ui/ModernFilter";
import OfflineDataBanner from "@/components/ui/OfflineDataBanner";
import { CONTRACTOR_ENDPOINTS } from "@/constants/api-endpoints";
import { useThemeColor } from "@/hooks/use-theme-color";
import { apiFetch } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ============================================================================
// COLORS
// ============================================================================
const COLORS = {
  primary: "#14B8A6",
  primaryLight: "#FFF0EB",
  success: "#4CAF50",
  text: "#212121",
  textSecondary: "#757575",
  border: "#E8E8E8",
  background: "#F8F9FA",
  white: "#FFFFFF",
  star: "#FFB800",
};

// ============================================================================
// DATA
// ============================================================================
// Offline fallback data — used when API is unreachable
const FALLBACK_CONTRACTORS = [
  {
    id: "1",
    name: "Công ty TNHH Xây dựng An Phát",
    avatar: "https://ui-avatars.com/api/?name=AP&background=FF6B35&color=fff",
    rating: 4.9,
    reviews: 234,
    projects: 156,
    specialties: ["Xây nhà trọn gói", "Cải tạo", "Thiết kế"],
    verified: true,
    yearsExp: 15,
    location: "Quận 7, TP.HCM",
    minBudget: 500,
    maxBudget: 5000,
    featured: true,
  },
  {
    id: "2",
    name: "Nhà thầu Minh Quang",
    avatar: "https://ui-avatars.com/api/?name=MQ&background=4CAF50&color=fff",
    rating: 4.7,
    reviews: 189,
    projects: 98,
    specialties: ["Xây dựng dân dụng", "Hoàn thiện"],
    verified: true,
    yearsExp: 10,
    location: "Bình Thạnh, TP.HCM",
    minBudget: 300,
    maxBudget: 2000,
    featured: false,
  },
  {
    id: "3",
    name: "Xây dựng Thành Công",
    avatar: "https://ui-avatars.com/api/?name=TC&background=2196F3&color=fff",
    rating: 4.8,
    reviews: 145,
    projects: 78,
    specialties: ["Nhà phố", "Biệt thự"],
    verified: true,
    yearsExp: 12,
    location: "Thủ Đức, TP.HCM",
    minBudget: 800,
    maxBudget: 10000,
    featured: false,
  },
  {
    id: "4",
    name: "Kiến trúc Hoàng Long",
    avatar: "https://ui-avatars.com/api/?name=HL&background=9C27B0&color=fff",
    rating: 4.6,
    reviews: 98,
    projects: 45,
    specialties: ["Thiết kế nội thất", "Cải tạo"],
    verified: true,
    yearsExp: 8,
    location: "Quận 1, TP.HCM",
    minBudget: 200,
    maxBudget: 1500,
    featured: false,
  },
];

// Filter options
const QUICK_FILTERS = [
  { id: "verified", label: "Xác thực", icon: "shield-checkmark-outline" },
  { id: "featured", label: "Nổi bật", icon: "star-outline" },
  { id: "nearby", label: "Gần tôi", icon: "location-outline" },
];

const SORT_OPTIONS = [
  { id: "rating", label: "Đánh giá cao" },
  { id: "projects", label: "Nhiều dự án" },
  { id: "experience", label: "Kinh nghiệm" },
  { id: "budget-low", label: "Ngân sách thấp" },
];

const FILTER_CONFIG = [
  {
    id: "specialty",
    label: "Chuyên môn",
    options: [
      { id: "all-in-one", label: "Trọn gói" },
      { id: "renovation", label: "Cải tạo" },
      { id: "design", label: "Thiết kế" },
      { id: "construction", label: "Xây dựng" },
    ],
  },
  {
    id: "budget",
    label: "Ngân sách",
    options: [
      { id: "under500", label: "< 500 triệu" },
      { id: "500-1000", label: "500 - 1 tỷ" },
      { id: "1000-5000", label: "1 - 5 tỷ" },
      { id: "over5000", label: "> 5 tỷ" },
    ],
  },
  {
    id: "experience",
    label: "Kinh nghiệm",
    options: [
      { id: "5+", label: "5+ năm" },
      { id: "10+", label: "10+ năm" },
      { id: "15+", label: "15+ năm" },
    ],
  },
];

// ============================================================================
// CONTRACTOR CARD
// ============================================================================
interface ContractorCardProps {
  item: (typeof CONTRACTORS)[0];
  onPress: () => void;
  onContact: () => void;
}

const ContractorCard = ({ item, onPress, onContact }: ContractorCardProps) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
    {/* Featured Badge */}
    {item.featured && (
      <View style={styles.featuredBadge}>
        <Ionicons name="star" size={10} color={COLORS.white} />
        <Text style={styles.featuredText}>Nổi bật</Text>
      </View>
    )}

    {/* Header */}
    <View style={styles.cardHeader}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.cardInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {item.verified && (
            <Ionicons name="checkmark-circle" size={16} color="#2196F3" />
          )}
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={COLORS.star} />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviews}>({item.reviews})</Text>
        </View>
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={12}
            color={COLORS.textSecondary}
          />
          <Text style={styles.location}>{item.location}</Text>
        </View>
      </View>
    </View>

    {/* Stats */}
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{item.projects}</Text>
        <Text style={styles.statLabel}>Dự án</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{item.yearsExp}</Text>
        <Text style={styles.statLabel}>Năm KN</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: COLORS.primary }]}>
          {item.minBudget}-{item.maxBudget}
        </Text>
        <Text style={styles.statLabel}>Triệu</Text>
      </View>
    </View>

    {/* Specialties */}
    <View style={styles.tagsRow}>
      {item.specialties.slice(0, 3).map((spec, idx) => (
        <View key={idx} style={styles.tag}>
          <Text style={styles.tagText}>{spec}</Text>
        </View>
      ))}
    </View>

    {/* Actions */}
    <View style={styles.cardActions}>
      <TouchableOpacity style={styles.contactBtn} onPress={onContact}>
        <Ionicons name="chatbubble-outline" size={18} color={COLORS.primary} />
        <Text style={styles.contactBtnText}>Liên hệ</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.viewBtn} onPress={onPress}>
        <Text style={styles.viewBtnText}>Xem chi tiết</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function ContractorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cardBg = useThemeColor({}, "card");

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState("rating");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [contractors, setContractors] = useState(FALLBACK_CONTRACTORS);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch contractors from real API
  const fetchContractors = useCallback(async () => {
    try {
      const response = await apiFetch<{ data: typeof FALLBACK_CONTRACTORS }>(
        CONTRACTOR_ENDPOINTS.LIST,
      );
      if (
        response?.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setContractors(response.data);
        setIsOffline(false);
      } else {
        // API returned empty — use fallback
        setContractors(FALLBACK_CONTRACTORS);
        setIsOffline(true);
      }
    } catch (error) {
      console.warn("[Contractor] API unavailable, using offline data:", error);
      setContractors(FALLBACK_CONTRACTORS);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContractors();
  }, [fetchContractors]);

  // Filter contractors
  const filteredContractors = useMemo(() => {
    let results = [...contractors];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.specialties.some((s) => s.toLowerCase().includes(q)),
      );
    }

    // Quick filter
    if (activeFilter === "verified") {
      results = results.filter((c) => c.verified);
    } else if (activeFilter === "featured") {
      results = results.filter((c) => c.featured);
    }

    // Sort
    if (selectedSort === "rating") {
      results.sort((a, b) => b.rating - a.rating);
    } else if (selectedSort === "projects") {
      results.sort((a, b) => b.projects - a.projects);
    } else if (selectedSort === "experience") {
      results.sort((a, b) => b.yearsExp - a.yearsExp);
    } else if (selectedSort === "budget-low") {
      results.sort((a, b) => a.minBudget - b.minBudget);
    }

    return results;
  }, [searchQuery, activeFilter, selectedSort, filterValues, contractors]);

  const activeFilterCount =
    Object.values(filterValues).filter((v) => v && v !== "all").length +
    (activeFilter !== "all" ? 1 : 0);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContractors();
    setRefreshing(false);
  };

  const handleFilterChange = (filterId: string, value: string | string[]) => {
    setFilterValues((prev) => ({ ...prev, [filterId]: value as string }));
  };

  const clearFilters = () => {
    setFilterValues({});
    setActiveFilter("all");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Nhà thầu",
          headerShown: true,
        }}
      />

      {/* Offline Banner */}
      <OfflineDataBanner visible={isOffline} onRetry={fetchContractors} />

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm nhà thầu, chuyên môn..."
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

      {/* Quick Filters */}
      <ChipFilter
        options={QUICK_FILTERS}
        selected={activeFilter}
        onSelect={setActiveFilter}
        showAll={true}
      />

      {/* Sort & Results */}
      <SortBar
        options={SORT_OPTIONS}
        selected={selectedSort}
        onSelect={setSelectedSort}
        resultCount={filteredContractors.length}
      />

      {/* List */}
      <FlatList
        data={filteredContractors}
        renderItem={({ item }) => (
          <ContractorCard
            item={item}
            onPress={() => router.push(`/contractor/${item.id}` as any)}
            onContact={() => router.push(`/chat/contractor/${item.id}` as any)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Không tìm thấy nhà thầu</Text>
            <Text style={styles.emptyText}>Thử thay đổi bộ lọc</Text>
          </View>
        }
      />

      {/* CTA Button */}
      <TouchableOpacity
        style={[styles.ctaBtn, { bottom: insets.bottom + 16 }]}
        onPress={() => router.push("/quote-request" as any)}
      >
        <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
        <Text style={styles.ctaBtnText}>Đăng yêu cầu báo giá</Text>
      </TouchableOpacity>

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
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginBottom: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
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
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.star,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.white,
  },
  cardHeader: {
    flexDirection: "row",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 60,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
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
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  location: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 15,
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
    backgroundColor: COLORS.border,
  },

  // Tags
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },

  // Actions
  cardActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  contactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 6,
  },
  contactBtnText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  viewBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    gap: 4,
  },
  viewBtnText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
  },

  // List
  listContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },

  // Empty
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
  },

  // CTA
  ctaBtn: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

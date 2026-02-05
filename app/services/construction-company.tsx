/**
 * Construction Company Screen - Modern & Simplified
 * Clean filter design with consistent UX
 * @updated 2025-01-30
 */

import { ChipFilter, FilterModal, SortBar } from "@/components/ui/ModernFilter";
import { useUnifiedMessaging } from "@/hooks/crm/useUnifiedMessaging";
import {
    CompanyListItem,
    getConstructionCompanies,
} from "@/services/company.service";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
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

const { width } = Dimensions.get("window");

// ============================================================================
// COLORS
// ============================================================================
const COLORS = {
  primary: "#FF6B35",
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
const DEMO_IMAGES = [
  "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=400",
];

const COMPANIES = [
  {
    id: "1",
    name: "Coteccons",
    logo: "https://ui-avatars.com/api/?name=CT&background=ee4d2d&color=fff",
    scale: "large",
    region: "hcm",
    specialties: ["Cao ốc", "Khu đô thị"],
    rating: 4.9,
    reviews: 256,
    projects: 180,
    yearEstablished: 2004,
    featured: true,
    verified: true,
    image: DEMO_IMAGES[0],
  },
  {
    id: "2",
    name: "Hòa Bình Construction",
    logo: "https://ui-avatars.com/api/?name=HB&background=4caf50&color=fff",
    scale: "large",
    region: "hanoi",
    specialties: ["Nhà cao tầng", "Khách sạn"],
    rating: 4.8,
    reviews: 198,
    projects: 150,
    yearEstablished: 1983,
    featured: true,
    verified: true,
    image: DEMO_IMAGES[1],
  },
  {
    id: "3",
    name: "Ricons",
    logo: "https://ui-avatars.com/api/?name=RC&background=2196f3&color=fff",
    scale: "medium",
    region: "hcm",
    specialties: ["Nhà ở", "Cải tạo"],
    rating: 4.7,
    reviews: 142,
    projects: 95,
    yearEstablished: 1993,
    featured: false,
    verified: true,
    image: DEMO_IMAGES[2],
  },
  {
    id: "4",
    name: "Phúc Khang Corporation",
    logo: "https://ui-avatars.com/api/?name=PK&background=ff9800&color=fff",
    scale: "medium",
    region: "hcm",
    specialties: ["Biệt thự", "Resort"],
    rating: 4.8,
    reviews: 118,
    projects: 72,
    yearEstablished: 2000,
    featured: false,
    verified: true,
    image: DEMO_IMAGES[3],
  },
  {
    id: "5",
    name: "Trường Thành Construction",
    logo: "https://ui-avatars.com/api/?name=TT&background=9c27b0&color=fff",
    scale: "small",
    region: "danang",
    specialties: ["Nhà ở", "Sửa chữa"],
    rating: 4.6,
    reviews: 87,
    projects: 58,
    yearEstablished: 2010,
    featured: false,
    verified: false,
    image: DEMO_IMAGES[0],
  },
];

// Filter options
const QUICK_FILTERS = [
  { id: "featured", label: "Nổi bật", icon: "star-outline" },
  { id: "verified", label: "Xác thực", icon: "shield-checkmark-outline" },
  { id: "hcm", label: "TP.HCM", icon: "location-outline" },
  { id: "hanoi", label: "Hà Nội", icon: "location-outline" },
];

const SORT_OPTIONS = [
  { id: "rating", label: "Đánh giá cao" },
  { id: "projects", label: "Nhiều dự án" },
  { id: "experience", label: "Lâu năm" },
  { id: "name", label: "A → Z" },
];

const FILTER_CONFIG = [
  {
    id: "scale",
    label: "Quy mô",
    options: [
      { id: "large", label: "Lớn" },
      { id: "medium", label: "Trung bình" },
      { id: "small", label: "Nhỏ" },
    ],
  },
  {
    id: "specialty",
    label: "Chuyên môn",
    options: [
      { id: "highrise", label: "Cao ốc" },
      { id: "residential", label: "Nhà ở" },
      { id: "villa", label: "Biệt thự" },
      { id: "industrial", label: "Công nghiệp" },
      { id: "renovation", label: "Cải tạo" },
    ],
  },
  {
    id: "region",
    label: "Khu vực",
    options: [
      { id: "hcm", label: "TP.HCM" },
      { id: "hanoi", label: "Hà Nội" },
      { id: "danang", label: "Đà Nẵng" },
      { id: "other", label: "Khác" },
    ],
  },
];

// ============================================================================
// COMPANY CARD
// ============================================================================
interface CompanyCardProps {
  company: (typeof COMPANIES)[0];
  onPress: () => void;
  onContact: () => void;
}

const CompanyCard = ({ company, onPress, onContact }: CompanyCardProps) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
    {/* Image */}
    <Image source={{ uri: company.image }} style={styles.cardImage} />

    {/* Featured Badge */}
    {company.featured && (
      <View style={styles.featuredBadge}>
        <Ionicons name="star" size={10} color={COLORS.white} />
        <Text style={styles.featuredText}>Nổi bật</Text>
      </View>
    )}

    {/* Content */}
    <View style={styles.cardContent}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Image source={{ uri: company.logo }} style={styles.logo} />
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {company.name}
            </Text>
            {company.verified && (
              <Ionicons name="checkmark-circle" size={16} color="#2196F3" />
            )}
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={COLORS.star} />
            <Text style={styles.rating}>{company.rating}</Text>
            <Text style={styles.reviews}>({company.reviews})</Text>
            <Text style={styles.divider}>•</Text>
            <Text style={styles.projects}>{company.projects} dự án</Text>
          </View>
        </View>
      </View>

      {/* Specialties */}
      <View style={styles.tagsRow}>
        {company.specialties.slice(0, 3).map((spec, idx) => (
          <View key={idx} style={styles.tag}>
            <Text style={styles.tagText}>{spec}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.contactBtn} onPress={onContact}>
          <Ionicons
            name="chatbubble-outline"
            size={18}
            color={COLORS.primary}
          />
          <Text style={styles.contactBtnText}>Liên hệ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.viewBtn} onPress={onPress}>
          <Text style={styles.viewBtnText}>Chi tiết</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function ConstructionCompanyScreen() {
  const insets = useSafeAreaInsets();
  const { getOrCreateConversation, setCurrentConversation, conversations } =
    useUnifiedMessaging();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState("rating");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // API data state
  const [apiCompanies, setApiCompanies] = useState<CompanyListItem[]>([]);

  // Load companies from API
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const result = await getConstructionCompanies();
      if (result && Array.isArray(result)) {
        setApiCompanies(result);
      }
    } catch (error) {
      console.error("Error loading companies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter companies
  const filteredCompanies = useMemo(() => {
    // Use mock data if API returns empty
    let companies =
      apiCompanies.length > 0 ? apiCompanies.map(normalizeCompany) : COMPANIES;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      companies = companies.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.specialties.some((s: string) => s.toLowerCase().includes(q)),
      );
    }

    // Quick filter
    if (activeFilter === "featured") {
      companies = companies.filter((c) => c.featured);
    } else if (activeFilter === "verified") {
      companies = companies.filter((c) => c.verified);
    } else if (
      activeFilter === "hcm" ||
      activeFilter === "hanoi" ||
      activeFilter === "danang"
    ) {
      companies = companies.filter((c) => c.region === activeFilter);
    }

    // Filter modal values
    if (filterValues.scale) {
      companies = companies.filter((c) => c.scale === filterValues.scale);
    }
    if (filterValues.region) {
      companies = companies.filter((c) => c.region === filterValues.region);
    }

    // Sort
    if (selectedSort === "rating") {
      companies.sort((a, b) => b.rating - a.rating);
    } else if (selectedSort === "projects") {
      companies.sort((a, b) => b.projects - a.projects);
    } else if (selectedSort === "experience") {
      companies.sort((a, b) => a.yearEstablished - b.yearEstablished);
    } else if (selectedSort === "name") {
      companies.sort((a, b) => a.name.localeCompare(b.name));
    }

    return companies;
  }, [apiCompanies, searchQuery, activeFilter, selectedSort, filterValues]);

  const activeFilterCount =
    Object.values(filterValues).filter((v) => v && v !== "all").length +
    (activeFilter !== "all" ? 1 : 0);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCompanies();
    setRefreshing(false);
  };

  const handleFilterChange = (filterId: string, value: string | string[]) => {
    setFilterValues((prev) => ({ ...prev, [filterId]: value as string }));
  };

  const clearFilters = () => {
    setFilterValues({});
    setActiveFilter("all");
  };

  const handleContact = async (company: (typeof COMPANIES)[0]) => {
    try {
      const conversationId = await getOrCreateConversation({
        userId: Number(company.id),
        userName: company.name,
        userAvatar: company.logo,
        userRole: "company",
      });
      // Find the conversation and set it as current
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation) {
        setCurrentConversation(conversation);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Công ty xây dựng",
          headerShown: true,
        }}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm công ty, chuyên môn..."
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
        resultCount={filteredCompanies.length}
      />

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCompanies}
          renderItem={({ item }) => (
            <CompanyCard
              company={item}
              onPress={() => router.push(`/services/company/${item.id}` as any)}
              onContact={() => handleContact(item)}
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
              <Ionicons
                name="business-outline"
                size={64}
                color={COLORS.border}
              />
              <Text style={styles.emptyTitle}>Không tìm thấy công ty</Text>
              <Text style={styles.emptyText}>Thử thay đổi bộ lọc</Text>
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
    </View>
  );
}

// Helper to normalize API company data
function normalizeCompany(c: CompanyListItem): (typeof COMPANIES)[0] {
  return {
    id: c.id.toString(),
    name: c.name,
    logo:
      c.logo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=FF6B35&color=fff`,
    scale:
      c.scale === "Lớn"
        ? "large"
        : c.scale === "Trung bình"
          ? "medium"
          : "small",
    region: c.region?.toLowerCase().includes("hcm")
      ? "hcm"
      : c.region?.toLowerCase().includes("hà nội")
        ? "hanoi"
        : c.region?.toLowerCase().includes("đà nẵng")
          ? "danang"
          : "other",
    specialties: c.specialties || [],
    rating: c.rating || 4.5,
    reviews: c.reviews || 0,
    projects: c.projects || 0,
    yearEstablished: c.yearEstablished || 2000,
    featured: c.featured || false,
    verified: c.verified || false,
    image:
      c.featuredProjects?.[0]?.image ||
      DEMO_IMAGES[Math.floor(Math.random() * DEMO_IMAGES.length)],
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

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginBottom: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.white,
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
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardImage: {
    width: "100%",
    height: 140,
    backgroundColor: COLORS.background,
  },
  featuredBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.star,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.white,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
  },
  logo: {
    width: 48,
    height: 48,
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
  divider: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginHorizontal: 4,
  },
  projects: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
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
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 6,
  },
  contactBtnText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  viewBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    gap: 4,
  },
  viewBtnText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 13,
  },

  // List
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
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
  },
});

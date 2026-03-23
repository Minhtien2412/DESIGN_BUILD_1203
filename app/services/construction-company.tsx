/**
 * Construction Company Screen - Modern & Simplified
 * Clean filter design with consistent UX
 * Refactored: migrated to DS design system (useDS, DSModuleScreen, DSCard,
 * DSEmptyState). Keeps ChipFilter/FilterModal/SortBar from ModernFilter.
 * All business logic, API calls, filters, and navigation preserved.
 * @updated 2026-03-18
 */

import { DSCard, DSEmptyState } from "@/components/ds";
import { DSModuleScreen } from "@/components/ds/layouts";
import { ChipFilter, FilterModal, SortBar } from "@/components/ui/ModernFilter";
import { useUnifiedMessaging } from "@/hooks/crm/useUnifiedMessaging";
import { useDS } from "@/hooks/useDS";
import {
    CompanyListItem,
    getConstructionCompanies,
} from "@/services/company.service";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

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
// COMPANY CARD (DS-based)
// ============================================================================
interface CompanyCardProps {
  company: (typeof COMPANIES)[0];
  onPress: () => void;
  onContact: () => void;
}

const CompanyCard = ({ company, onPress, onContact }: CompanyCardProps) => {
  const { colors, spacing, radius, text: textStyles } = useDS();

  return (
    <DSCard
      onPress={onPress}
      variant="elevated"
      padding={0}
      style={{
        marginHorizontal: spacing.xl,
        marginBottom: spacing.xl,
        overflow: "hidden",
      }}
    >
      {/* Image */}
      <Image
        source={{ uri: company.image }}
        style={{ width: "100%", height: 140, backgroundColor: colors.bgMuted }}
      />

      {/* Featured Badge */}
      {company.featured && (
        <View
          style={{
            position: "absolute",
            top: spacing.lg,
            left: spacing.lg,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.warning,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radius.sm,
            gap: spacing.xs,
          }}
        >
          <Ionicons name="star" size={10} color={colors.textInverse} />
          <Text style={[textStyles.badge, { color: colors.textInverse }]}>
            Nổi bật
          </Text>
        </View>
      )}

      {/* Content */}
      <View style={{ padding: spacing.xl }}>
        {/* Header */}
        <View style={{ flexDirection: "row" }}>
          <Image
            source={{ uri: company.logo }}
            style={{
              width: 48,
              height: 48,
              borderRadius: radius.lg,
              backgroundColor: colors.bgMuted,
            }}
          />
          <View style={{ flex: 1, marginLeft: spacing.lg }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
              }}
            >
              <Text
                style={[
                  textStyles.bodySemibold,
                  { color: colors.text, flex: 1 },
                ]}
                numberOfLines={1}
              >
                {company.name}
              </Text>
              {company.verified && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={colors.info}
                />
              )}
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: spacing.xs,
                gap: spacing.xs,
              }}
            >
              <Ionicons name="star" size={14} color={colors.primary} />
              <Text style={[textStyles.smallBold, { color: colors.text }]}>
                {company.rating}
              </Text>
              <Text style={[textStyles.small, { color: colors.textSecondary }]}>
                ({company.reviews})
              </Text>
              <Text
                style={[
                  textStyles.small,
                  { color: colors.textSecondary, marginHorizontal: spacing.xs },
                ]}
              >
                •
              </Text>
              <Text style={[textStyles.small, { color: colors.textSecondary }]}>
                {company.projects} dự án
              </Text>
            </View>
          </View>
        </View>

        {/* Specialties */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
            marginTop: spacing.lg,
          }}
        >
          {company.specialties.slice(0, 3).map((spec, idx) => (
            <View
              key={idx}
              style={{
                backgroundColor: colors.primaryBg,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                borderRadius: radius.sm,
              }}
            >
              <Text style={[textStyles.badge, { color: colors.primary }]}>
                {spec}
              </Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View
          style={{
            flexDirection: "row",
            gap: spacing.lg,
            marginTop: spacing.xl,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: spacing.md,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.primary,
              gap: spacing.sm,
            }}
            onPress={onContact}
          >
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={[textStyles.buttonSmall, { color: colors.primary }]}>
              Liên hệ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: spacing.md,
              borderRadius: radius.md,
              backgroundColor: colors.primary,
              gap: spacing.xs,
            }}
            onPress={onPress}
          >
            <Text
              style={[textStyles.buttonSmall, { color: colors.textInverse }]}
            >
              Chi tiết
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textInverse}
            />
          </TouchableOpacity>
        </View>
      </View>
    </DSCard>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function ConstructionCompanyScreen() {
  const { colors, spacing, radius, text: textStyles } = useDS();
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
    <DSModuleScreen
      title="Công ty xây dựng"
      loading={loading}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      {/* Search Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          margin: spacing.xl,
          marginBottom: 0,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderRadius: radius.lg,
          backgroundColor: colors.bgSurface,
          gap: spacing.md,
        }}
      >
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[textStyles.body, { flex: 1, color: colors.text }]}
          placeholder="Tìm công ty, chuyên môn..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        <View
          style={{ width: 1, height: 24, backgroundColor: colors.divider }}
        />
        <TouchableOpacity
          style={{ padding: spacing.sm, position: "relative" }}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options-outline" size={20} color={colors.primary} />
          {activeFilterCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={[
                  textStyles.badge,
                  { color: colors.textInverse, fontSize: 10 },
                ]}
              >
                {activeFilterCount}
              </Text>
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

      {/* Company List */}
      {filteredCompanies.length === 0 ? (
        <DSEmptyState
          icon="business-outline"
          title="Không tìm thấy công ty"
          description="Thử thay đổi bộ lọc"
          actionLabel="Đặt lại"
          onAction={clearFilters}
        />
      ) : (
        <View style={{ paddingTop: spacing.sm }}>
          {filteredCompanies.map((item) => (
            <CompanyCard
              key={item.id}
              company={item}
              onPress={() => router.push(`/services/company/${item.id}` as any)}
              onContact={() => handleContact(item)}
            />
          ))}
        </View>
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
    </DSModuleScreen>
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

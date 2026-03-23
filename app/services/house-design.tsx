/**
 * House Design Screen
 * Danh sách công ty thiết kế nhà – tìm kiếm, lọc theo khu vực & ngân sách
 * API-integrated: fetches from backend, falls back to mock data
 *
 * Refactored: migrated to DS design system (useDS, DSModuleScreen, DSCard,
 * DSChip, DSEmptyState). All business logic, API calls, and navigation
 * preserved from original.
 */

import { DSCard, DSChip, DSEmptyState } from "@/components/ds";
import { DSModuleScreen } from "@/components/ds/layouts";
import { useUnifiedMessaging } from "@/hooks/crm/useUnifiedMessaging";
import { useDS } from "@/hooks/useDS";
import {
    getDesignCompanies,
    type CompanyListItem,
} from "@/services/company.service";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

// ─── Constants (data / filter values unchanged) ──────────────────────────────

const LOCATIONS = ["Tất cả", "Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ"] as const;

const PRICE_RANGES = [
  { label: "Tất cả", min: 0, max: Infinity },
  { label: "Dưới 5 triệu", min: 0, max: 5_000_000 },
  { label: "5-10 triệu", min: 5_000_000, max: 10_000_000 },
  { label: "Trên 10 triệu", min: 10_000_000, max: Infinity },
] as const;

const DEMO_IMAGES = [
  "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=600",
];

const LOGO_COLORS = [
  "#0D9488",
  "#2563EB",
  "#7C3AED",
  "#DC2626",
  "#EA580C",
  "#16A34A",
  "#0284C7",
  "#9333EA",
];

// ─── Types (unchanged) ──────────────────────────────────────────────────────

interface DesignCompany {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviews: number;
  projects: number;
  priceFrom: number;
  verified: boolean;
  tags: string[];
  image: string;
  logoText: string;
  logoColor: string;
}

// ─── Mapping layer: backend CompanyListItem → UI DesignCompany (unchanged) ───

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function transformCompanyData(
  companies: CompanyListItem[],
  startIndex: number,
): DesignCompany[] {
  return companies.map((c, idx) => ({
    id: String(c.id),
    name: c.name,
    city: c.location || "Hà Nội",
    rating: c.rating || 4.5,
    reviews: c.reviewCount || c.reviews || 0,
    projects: c.projects ?? Math.floor(Math.random() * 200) + 50,
    priceFrom: 5_000_000,
    verified: c.verified ?? false,
    tags: c.specialties?.length ? c.specialties : ["Thiết kế nhà"],
    image: DEMO_IMAGES[(idx + startIndex) % DEMO_IMAGES.length],
    logoText: getInitials(c.name),
    logoColor: LOGO_COLORS[(idx + startIndex) % LOGO_COLORS.length],
  }));
}

// ─── Fallback mock data (used when API is unreachable) ───────────────────────

const FALLBACK_COMPANIES: DesignCompany[] = [
  {
    id: "1",
    name: "Công ty Thiết kế A&A",
    city: "Hà Nội",
    rating: 4.8,
    reviews: 256,
    projects: 150,
    priceFrom: 5_000_000,
    verified: true,
    tags: ["Biệt thự", "Nhà phố", "Nhà vườn"],
    image: DEMO_IMAGES[0],
    logoText: "AA",
    logoColor: "#0D9488",
  },
  {
    id: "2",
    name: "Kiến Trúc Việt",
    city: "TP.HCM",
    rating: 4.9,
    reviews: 412,
    projects: 200,
    priceFrom: 7_000_000,
    verified: true,
    tags: ["Nhà vườn", "Resort", "Biệt thự"],
    image: DEMO_IMAGES[1],
    logoText: "KV",
    logoColor: "#2563EB",
  },
  {
    id: "3",
    name: "Homespace Design",
    city: "Đà Nẵng",
    rating: 4.7,
    reviews: 189,
    projects: 120,
    priceFrom: 4_500_000,
    verified: false,
    tags: ["Căn hộ", "Chung cư", "Minimalist"],
    image: DEMO_IMAGES[2],
    logoText: "HD",
    logoColor: "#7C3AED",
  },
  {
    id: "4",
    name: "Thiên Cát Architecture",
    city: "Hà Nội",
    rating: 4.6,
    reviews: 145,
    projects: 95,
    priceFrom: 6_000_000,
    verified: true,
    tags: ["Nhà phố", "Nhà 2 tầng", "Hiện đại"],
    image: DEMO_IMAGES[3],
    logoText: "TC",
    logoColor: "#DC2626",
  },
  {
    id: "5",
    name: "Modern Living Studio",
    city: "TP.HCM",
    rating: 4.5,
    reviews: 98,
    projects: 78,
    priceFrom: 5_500_000,
    verified: false,
    tags: ["Hiện đại", "Minimalist", "Nhà phố"],
    image: DEMO_IMAGES[4],
    logoText: "ML",
    logoColor: "#EA580C",
  },
  {
    id: "6",
    name: "Green Architecture",
    city: "Cần Thơ",
    rating: 4.8,
    reviews: 234,
    projects: 165,
    priceFrom: 8_000_000,
    verified: true,
    tags: ["Eco-friendly", "Nhà vườn", "Biệt thự"],
    image: DEMO_IMAGES[5],
    logoText: "GA",
    logoColor: "#16A34A",
  },
  {
    id: "7",
    name: "Đông Dương Design",
    city: "Đà Nẵng",
    rating: 4.4,
    reviews: 76,
    projects: 52,
    priceFrom: 3_500_000,
    verified: true,
    tags: ["Nhà cấp 4", "Nhà 2 tầng"],
    image: DEMO_IMAGES[6],
    logoText: "ĐD",
    logoColor: "#0284C7",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}.000.000`;
  return value.toLocaleString("vi-VN");
}

// ─── Sub-components (DS-based) ───────────────────────────────────────────────

function CompanyCard({
  company,
  onContact,
  contacting,
}: {
  company: DesignCompany;
  onContact: () => void;
  contacting: boolean;
}) {
  const { colors, spacing, radius, shadow, text: textStyles } = useDS();

  return (
    <DSCard
      onPress={() => router.push(`/services/company-detail?id=${company.id}`)}
      variant="elevated"
      padding={0}
      style={{ marginBottom: spacing.lg, overflow: "hidden" }}
    >
      {/* Cover image */}
      <View>
        <Image
          source={{ uri: company.image }}
          style={{
            width: "100%",
            height: 180,
            backgroundColor: colors.bgMuted,
          }}
        />
        {company.verified && (
          <View
            style={{
              position: "absolute",
              top: spacing.md,
              right: spacing.md,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              borderRadius: radius.sm,
              gap: spacing.xs,
            }}
          >
            <Ionicons name="checkmark-circle" size={13} color="#fff" />
            <Text style={[textStyles.badge, { color: "#fff" }]}>
              Đã xác thực
            </Text>
          </View>
        )}
      </View>

      {/* Info section */}
      <View style={{ padding: spacing.xl }}>
        {/* Header: logo + name + location */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: spacing.md,
          }}
        >
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: radius.md,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: company.logoColor,
            }}
          >
            <Text style={[textStyles.bodySemibold, { color: "#fff" }]}>
              {company.logoText}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text
              style={[textStyles.bodySemibold, { color: colors.text }]}
              numberOfLines={1}
            >
              {company.name}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.xxs,
                marginTop: 2,
              }}
            >
              <Ionicons
                name="location-sharp"
                size={12}
                color={colors.textSecondary}
              />
              <Text
                style={[textStyles.caption, { color: colors.textSecondary }]}
              >
                {company.city}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats: rating + projects */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: spacing.md,
            gap: spacing.xs,
          }}
        >
          <Ionicons name="star" size={14} color={colors.primary} />
          <Text style={[textStyles.smallBold, { color: colors.primary }]}>
            {company.rating.toFixed(1)}
          </Text>
          <Text style={[textStyles.caption, { color: colors.textTertiary }]}>
            ({company.reviews})
          </Text>
          <View
            style={{
              width: 1,
              height: 12,
              backgroundColor: colors.divider,
              marginHorizontal: spacing.md,
            }}
          />
          <Ionicons
            name="briefcase-outline"
            size={13}
            color={colors.textSecondary}
          />
          <Text
            style={[
              textStyles.small,
              { color: colors.textSecondary, marginLeft: 2 },
            ]}
          >
            {company.projects} dự án
          </Text>
        </View>

        {/* Tags */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
            marginBottom: spacing.lg,
          }}
        >
          {company.tags.slice(0, 3).map((tag) => (
            <View
              key={tag}
              style={{
                borderWidth: 1,
                borderColor: colors.primary,
                borderRadius: radius.sm,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                backgroundColor: colors.primaryBg,
              }}
            >
              <Text style={[textStyles.badge, { color: colors.primary }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer: price + contact */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              gap: spacing.xs,
            }}
          >
            <Text style={[textStyles.caption, { color: colors.textTertiary }]}>
              Từ
            </Text>
            <Text style={[textStyles.h4, { color: colors.primaryDark }]}>
              {formatPrice(company.priceFrom)}₫
            </Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.xxl,
              paddingVertical: spacing.md,
              borderRadius: radius.sm,
            }}
            onPress={onContact}
            disabled={contacting}
            activeOpacity={0.7}
          >
            {contacting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[textStyles.buttonSmall, { color: "#fff" }]}>
                Liên hệ
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </DSCard>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function HouseDesignScreen() {
  const { colors, spacing, radius, text: textStyles } = useDS();

  // ── Data & loading state (preserved from original) ──
  const [companies, setCompanies] = useState<DesignCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Filters ──
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Tất cả");
  const [selectedPriceIdx, setSelectedPriceIdx] = useState(0);
  const [contactingId, setContactingId] = useState<string | null>(null);

  // ── Messaging hook (preserved) ──
  const { getOrCreateConversation } = useUnifiedMessaging();

  // ── API fetch (preserved) ──
  const fetchCompanies = useCallback(async () => {
    try {
      setError(null);
      const response = await getDesignCompanies({
        location: selectedCity !== "Tất cả" ? selectedCity : undefined,
        search: searchQuery || undefined,
      });

      if (response.data && response.data.length > 0) {
        setCompanies(transformCompanyData(response.data, 0));
      } else {
        setCompanies(FALLBACK_COMPANIES);
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Không thể tải dữ liệu. Đang sử dụng dữ liệu demo.");
      setCompanies(FALLBACK_COMPANIES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCity, searchQuery]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCompanies();
  }, [fetchCompanies]);

  // ── Client-side filter on top of fetched data (preserved) ──
  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const priceRange = PRICE_RANGES[selectedPriceIdx];

    return companies.filter((c) => {
      if (selectedCity !== "Tất cả" && c.city !== selectedCity) return false;
      if (c.priceFrom < priceRange.min || c.priceFrom > priceRange.max)
        return false;
      if (q) {
        const nameMatch = c.name.toLowerCase().includes(q);
        const tagMatch = c.tags.some((t) => t.toLowerCase().includes(q));
        if (!nameMatch && !tagMatch) return false;
      }
      return true;
    });
  }, [companies, searchQuery, selectedCity, selectedPriceIdx]);

  // ── Contact via messaging (preserved) ──
  const handleContact = useCallback(
    async (company: DesignCompany) => {
      try {
        setContactingId(company.id);
        const conversationId = await getOrCreateConversation({
          userId: Number(company.id),
          userName: company.name,
          userRole: "HOUSE_DESIGN",
        });
        router.push(
          `/messages/chat/${conversationId}` as `/messages/chat/${string}`,
        );
      } catch (err) {
        console.error("Error creating conversation:", err);
      } finally {
        setContactingId(null);
      }
    },
    [getOrCreateConversation],
  );

  const resetFilters = () => {
    setSelectedCity("Tất cả");
    setSelectedPriceIdx(0);
    setSearchQuery("");
  };

  return (
    <DSModuleScreen
      title="Thiết kế nhà"
      gradientHeader
      loading={loading}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      {/* Error banner (preserved) */}
      {error && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.warningBg,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
            gap: spacing.md,
          }}
        >
          <Ionicons
            name="information-circle"
            size={16}
            color={colors.warning}
          />
          <Text
            style={[textStyles.caption, { flex: 1, color: colors.warning }]}
          >
            {error}
          </Text>
        </View>
      )}

      {/* Search bar */}
      <View
        style={{
          backgroundColor: colors.bgSurface,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.bgInput,
            borderRadius: radius.full,
            paddingHorizontal: spacing.xl,
            height: 42,
          }}
        >
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={[
              textStyles.body,
              {
                flex: 1,
                marginLeft: spacing.md,
                color: colors.text,
                paddingVertical: 0,
              },
            ]}
            placeholder="Tìm công ty thiết kế..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <View
        style={{
          backgroundColor: colors.bgSurface,
          paddingTop: spacing.xs,
          paddingBottom: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
        }}
      >
        {/* City row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.xs,
            gap: spacing.md,
          }}
        >
          {LOCATIONS.map((city) => (
            <DSChip
              key={city}
              label={city}
              selected={selectedCity === city}
              onPress={() => setSelectedCity(city)}
            />
          ))}
        </ScrollView>

        {/* Budget row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.xs,
            gap: spacing.md,
          }}
        >
          {PRICE_RANGES.map((range, idx) => (
            <DSChip
              key={range.label}
              label={range.label}
              selected={selectedPriceIdx === idx}
              onPress={() => setSelectedPriceIdx(idx)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Company list */}
      <View style={{ padding: spacing.xl }}>
        {filteredCompanies.length === 0 ? (
          <DSEmptyState
            icon="search-outline"
            title="Không tìm thấy kết quả"
            description="Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm"
            actionLabel="Đặt lại bộ lọc"
            onAction={resetFilters}
          />
        ) : (
          filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onContact={() => handleContact(company)}
              contacting={contactingId === company.id}
            />
          ))
        )}
      </View>
    </DSModuleScreen>
  );
}

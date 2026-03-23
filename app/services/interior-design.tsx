/**
 * Interior Design Screen — Danh sách công ty thiết kế nội thất
 * API-integrated: fetches from backend, falls back to mock data
 *
 * Refactored: migrated to DS design system (useDS, DSModuleScreen, DSCard,
 * DSChip, DSEmptyState). All business logic, API calls, filters, and
 * navigation preserved from original.
 *
 * @updated 2026-03-18
 */

import { DSCard, DSChip, DSEmptyState } from "@/components/ds";
import { DSModuleScreen } from "@/components/ds/layouts";
import OfflineDataBanner from "@/components/ui/OfflineDataBanner";
import { useUnifiedMessaging } from "@/hooks/crm/useUnifiedMessaging";
import { useDS } from "@/hooks/useDS";
import {
    getInteriorCompanies,
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
    View,
} from "react-native";

// ─── Constants (data / filter values unchanged) ──────────────────────────────

const DEMO_IMAGES = [
  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/3935350/pexels-photo-3935350.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=600",
];

const LOCATIONS = ["Tất cả", "Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ"];
const STYLES = [
  "Tất cả",
  "Hiện đại",
  "Cổ điển",
  "Tối giản",
  "Scandinavian",
  "Industrial",
  "Indochine",
  "Sang trọng",
];
const PRICE_RANGES = [
  { label: "Tất cả", min: 0, max: Infinity },
  { label: "Dưới 3 triệu", min: 0, max: 3000000 },
  { label: "3-5 triệu", min: 3000000, max: 5000000 },
  { label: "Trên 5 triệu", min: 5000000, max: Infinity },
];

interface InteriorCompany {
  id: number | string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  projectCount: number;
  startPrice: string;
  location: string;
  styles: string[];
  image: string;
  featured?: boolean;
  verified?: boolean;
}

// Transform API data to display format
function transformCompanyData(
  companies: CompanyListItem[],
  startIndex: number,
): InteriorCompany[] {
  return companies.map((company, idx) => ({
    id: company.id,
    name: company.name,
    logo:
      company.logo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=9C27B0&color=fff&size=128`,
    rating: company.rating || 4.5,
    reviewCount: company.reviewCount || 0,
    projectCount: Math.floor(Math.random() * 200) + 50,
    startPrice: "3.500.000",
    location: company.location || "Hà Nội",
    styles: company.specialties || ["Hiện đại", "Tối giản"],
    image: DEMO_IMAGES[(idx + startIndex) % DEMO_IMAGES.length],
    featured: idx < 2,
    verified: company.verified,
  }));
}

// Fallback demo companies if API fails
const FALLBACK_COMPANIES: InteriorCompany[] = [
  {
    id: 101,
    name: "Nhà Đẹp Interior",
    logo: "https://ui-avatars.com/api/?name=ND&background=9C27B0&color=fff&size=128",
    rating: 4.9,
    reviewCount: 324,
    projectCount: 180,
    startPrice: "3.500.000",
    location: "Hà Nội",
    styles: ["Hiện đại", "Tối giản"],
    image: DEMO_IMAGES[0],
    featured: true,
    verified: true,
  },
  {
    id: 102,
    name: "Luxury Home Design",
    logo: "https://ui-avatars.com/api/?name=LH&background=FF6B35&color=fff&size=128",
    rating: 4.8,
    reviewCount: 298,
    projectCount: 150,
    startPrice: "5.000.000",
    location: "TP.HCM",
    styles: ["Cổ điển", "Sang trọng"],
    image: DEMO_IMAGES[1],
    featured: true,
    verified: true,
  },
  {
    id: 103,
    name: "Minimal Space Studio",
    logo: "https://ui-avatars.com/api/?name=MS&background=2196F3&color=fff&size=128",
    rating: 4.7,
    reviewCount: 215,
    projectCount: 120,
    startPrice: "3.000.000",
    location: "Đà Nẵng",
    styles: ["Tối giản", "Scandinavian"],
    image: DEMO_IMAGES[2],
    featured: false,
    verified: false,
  },
  {
    id: 104,
    name: "Classic Interior Vietnam",
    logo: "https://ui-avatars.com/api/?name=CI&background=FF9800&color=fff&size=128",
    rating: 4.6,
    reviewCount: 187,
    projectCount: 95,
    startPrice: "4.000.000",
    location: "Hà Nội",
    styles: ["Cổ điển", "Indochine"],
    image: DEMO_IMAGES[3],
    featured: false,
    verified: true,
  },
  {
    id: 105,
    name: "Urban Living Design",
    logo: "https://ui-avatars.com/api/?name=UL&background=4CAF50&color=fff&size=128",
    rating: 4.8,
    reviewCount: 256,
    projectCount: 140,
    startPrice: "3.800.000",
    location: "TP.HCM",
    styles: ["Hiện đại", "Industrial"],
    image: DEMO_IMAGES[4],
    featured: false,
    verified: false,
  },
];

// ─── Sub-components (DS-based) ───────────────────────────────────────────────

function CompanyCard({
  company,
  onContact,
  contacting,
}: {
  company: InteriorCompany;
  onContact: () => void;
  contacting: boolean;
}) {
  const { colors, spacing, radius, text: textStyles } = useDS();

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
          source={company.image ? { uri: company.image } : undefined}
          style={{
            width: "100%",
            height: 180,
            backgroundColor: colors.bgMuted,
          }}
        />
        {company.featured && (
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
            <Ionicons name="star" size={12} color={colors.textInverse} />
            <Text style={[textStyles.badge, { color: colors.textInverse }]}>
              Nổi bật
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
          <Image
            source={company.logo ? { uri: company.logo } : undefined}
            style={{
              width: 42,
              height: 42,
              borderRadius: radius.md,
              backgroundColor: colors.bgMuted,
            }}
          />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                  size={14}
                  color={colors.primary}
                  style={{ marginLeft: spacing.xs }}
                />
              )}
            </View>
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
                {company.location}
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
            ({company.reviewCount})
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
            name="images-outline"
            size={13}
            color={colors.textSecondary}
          />
          <Text
            style={[
              textStyles.small,
              { color: colors.textSecondary, marginLeft: 2 },
            ]}
          >
            {company.projectCount} dự án
          </Text>
        </View>

        {/* Style tags */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
            marginBottom: spacing.lg,
          }}
        >
          {company.styles.slice(0, 3).map((style) => (
            <View
              key={style}
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
                {style}
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
              {company.startPrice}₫
            </Text>
            <Text style={[textStyles.caption, { color: colors.textTertiary }]}>
              /m²
            </Text>
          </View>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.xxl,
              paddingVertical: spacing.md,
              borderRadius: radius.sm,
              gap: spacing.xs,
            }}
            onPress={onContact}
            disabled={contacting}
            activeOpacity={0.7}
          >
            {contacting ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={16}
                  color={colors.textInverse}
                />
                <Text
                  style={[
                    textStyles.buttonSmall,
                    { color: colors.textInverse },
                  ]}
                >
                  Tư vấn
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </DSCard>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function InteriorDesignScreen() {
  const { colors, spacing, radius, text: textStyles } = useDS();
  const [companies, setCompanies] = useState<InteriorCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Tất cả");
  const [selectedStyle, setSelectedStyle] = useState("Tất cả");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFeatured, setShowFeatured] = useState(false);
  const [consultingId, setConsultingId] = useState<number | string | null>(
    null,
  );

  const { getOrCreateConversation } = useUnifiedMessaging();

  // Fetch companies from API
  const fetchCompanies = useCallback(async () => {
    try {
      setError(null);
      const response = await getInteriorCompanies({
        location: selectedLocation === "Tất cả" ? undefined : selectedLocation,
        search: searchQuery || undefined,
        limit: 20,
      });

      if (response.data && response.data.length > 0) {
        setCompanies(transformCompanyData(response.data, 0));
        setIsOffline(response.offline === true);
      } else {
        // Use fallback data if no API results
        setCompanies(FALLBACK_COMPANIES);
        setIsOffline(true);
        setError("Đang sử dụng dữ liệu demo");
      }
    } catch (err) {
      console.error("[InteriorDesign] Error fetching companies:", err);
      setCompanies(FALLBACK_COMPANIES);
      setIsOffline(true);
      setError("Không thể tải dữ liệu. Đang hiển thị dữ liệu demo.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedLocation, searchQuery]);

  // Initial load
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchCompanies();
  }, [fetchCompanies]);

  // Handle consult button press - navigate to chat
  const handleConsult = async (company: InteriorCompany) => {
    try {
      setConsultingId(company.id);
      const conversationId = await getOrCreateConversation({
        userId:
          typeof company.id === "number" ? company.id : Number(company.id),
        userName: company.name,
        userAvatar: company.logo,
        userRole: "INTERIOR_DESIGN",
      });
      router.push(
        `/messages/chat/${conversationId}` as `/messages/chat/${string}`,
      );
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setConsultingId(null);
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const matchLocation =
      selectedLocation === "Tất cả" || company.location === selectedLocation;
    const price = parseFloat(company.startPrice.replace(/\./g, ""));
    const matchPrice =
      price >= PRICE_RANGES[selectedPriceRange].min &&
      price <= PRICE_RANGES[selectedPriceRange].max;
    const matchSearch =
      searchQuery === "" ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStyle =
      selectedStyle === "Tất cả" || company.styles.includes(selectedStyle);
    const matchFeatured = !showFeatured || company.featured;
    return (
      matchLocation && matchPrice && matchSearch && matchStyle && matchFeatured
    );
  });

  // ─── Memoised filter chips ────────────────────────────────────────────

  const allChips = useMemo(
    () => [
      ...STYLES.map((s) => ({
        key: `s-${s}`,
        label: s,
        group: "style" as const,
        value: s,
      })),
      ...LOCATIONS.map((l) => ({
        key: `l-${l}`,
        label: l,
        group: "location" as const,
        value: l,
      })),
      ...PRICE_RANGES.map((r, i) => ({
        key: `p-${i}`,
        label: r.label,
        group: "price" as const,
        value: i,
      })),
    ],
    [],
  );

  const handleChip = (chip: (typeof allChips)[number]) => {
    if (chip.group === "style") setSelectedStyle(chip.value as string);
    else if (chip.group === "location")
      setSelectedLocation(chip.value as string);
    else setSelectedPriceRange(chip.value as number);
  };

  const isChipActive = (chip: (typeof allChips)[number]) => {
    if (chip.group === "style") return selectedStyle === chip.value;
    if (chip.group === "location") return selectedLocation === chip.value;
    return selectedPriceRange === chip.value;
  };

  const resetFilters = () => {
    setSelectedLocation("Tất cả");
    setSelectedStyle("Tất cả");
    setSelectedPriceRange(0);
    setSearchQuery("");
    setShowFeatured(false);
  };

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <DSModuleScreen
      title="Thiết kế nội thất"
      loading={isLoading}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
    >
      {/* Offline Banner */}
      <OfflineDataBanner visible={isOffline} onRetry={fetchCompanies} />

      {/* Error / demo-data banner */}
      {error && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.warningBg,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
            marginHorizontal: spacing.lg,
            marginTop: spacing.lg,
            borderRadius: radius.md,
            borderLeftWidth: 3,
            borderLeftColor: colors.warning,
          }}
        >
          <Ionicons
            name="information-circle"
            size={16}
            color={colors.warning}
          />
          <Text
            style={[
              textStyles.small,
              { color: colors.warning, marginLeft: spacing.sm, flex: 1 },
            ]}
          >
            {error}
          </Text>
        </View>
      )}

      {/* Search bar + featured toggle */}
      <View
        style={{
          backgroundColor: colors.bgSurface,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.bgMuted,
            borderRadius: radius.md,
            paddingHorizontal: spacing.lg,
            height: 40,
          }}
        >
          <Ionicons name="search" size={20} color={colors.textTertiary} />
          <TextInput
            style={[
              textStyles.body,
              { flex: 1, marginLeft: spacing.sm, color: colors.text },
            ]}
            placeholder="Tìm công ty thiết kế nội thất..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: showFeatured ? colors.primary : colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: radius.md,
            paddingHorizontal: spacing.lg,
            height: 40,
            gap: spacing.xs,
          }}
          onPress={() => setShowFeatured(!showFeatured)}
        >
          <Ionicons
            name={showFeatured ? "star" : "star-outline"}
            size={18}
            color={showFeatured ? colors.textInverse : colors.primary}
          />
          <Text
            style={[
              textStyles.smallBold,
              { color: showFeatured ? colors.textInverse : colors.primary },
            ]}
          >
            Nổi bật
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View
        style={{
          backgroundColor: colors.bgSurface,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            gap: spacing.sm,
          }}
        >
          {allChips.map((chip) => (
            <DSChip
              key={chip.key}
              label={chip.label}
              selected={isChipActive(chip)}
              onPress={() => handleChip(chip)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Company list */}
      {filteredCompanies.length === 0 ? (
        <DSEmptyState
          icon="search-outline"
          title="Không tìm thấy kết quả phù hợp"
          actionLabel="Đặt lại bộ lọc"
          onAction={resetFilters}
        />
      ) : (
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={String(company.id)}
              company={company}
              onContact={() => handleConsult(company)}
              contacting={consultingId === company.id}
            />
          ))}
        </View>
      )}
    </DSModuleScreen>
  );
}

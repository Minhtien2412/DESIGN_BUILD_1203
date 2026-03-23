/**
 * Interior Company Listing Screen
 * Lists interior design companies with search & filters
 * Route: /services/interior-company
 * @created 2026-03-05
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
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const DEMO_IMAGES = [
  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2082087/pexels-photo-2082087.jpeg?auto=compress&cs=tinysrgb&w=600",
];

const LOCATIONS = ["Tất cả", "Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ"];
const PRICE_RANGES = [
  { label: "Tất cả", min: 0, max: Infinity },
  { label: "Dưới 5 triệu", min: 0, max: 5000000 },
  { label: "5-15 triệu", min: 5000000, max: 15000000 },
  { label: "Trên 15 triệu", min: 15000000, max: Infinity },
];

interface Company {
  id: number | string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  projectCount: number;
  startPrice: string;
  location: string;
  specialties: string[];
  image: string;
  verified?: boolean;
}

function transformData(
  companies: CompanyListItem[],
  offset: number,
): Company[] {
  return companies.map((c, i) => ({
    id: c.id,
    name: c.name,
    logo:
      c.logo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=0D9488&color=fff&size=128`,
    rating: c.rating || 4.5,
    reviewCount: c.reviewCount || 0,
    projectCount: Math.floor(Math.random() * 200) + 50,
    startPrice: "8.000.000",
    location: c.location || "TP.HCM",
    specialties: c.specialties || ["Nội thất"],
    image: DEMO_IMAGES[(i + offset) % DEMO_IMAGES.length],
    verified: c.verified,
  }));
}

const FALLBACK: Company[] = [
  {
    id: 1,
    name: "Công ty TNHH Nội Thất An Khánh",
    logo: "https://ui-avatars.com/api/?name=AK&background=0D9488&color=fff&size=128",
    rating: 4.9,
    reviewCount: 320,
    projectCount: 200,
    startPrice: "10.000.000",
    location: "TP.HCM",
    specialties: ["Biệt thự", "Chung cư", "Văn phòng"],
    image: DEMO_IMAGES[0],
    verified: true,
  },
  {
    id: 2,
    name: "Nội Thất Hoàng Gia",
    logo: "https://ui-avatars.com/api/?name=HG&background=115E59&color=fff&size=128",
    rating: 4.8,
    reviewCount: 256,
    projectCount: 180,
    startPrice: "8.000.000",
    location: "Hà Nội",
    specialties: ["Tân cổ điển", "Luxury"],
    image: DEMO_IMAGES[1],
    verified: true,
  },
  {
    id: 3,
    name: "Home & Living Design",
    logo: "https://ui-avatars.com/api/?name=HLD&background=14B8A6&color=fff&size=128",
    rating: 4.7,
    reviewCount: 189,
    projectCount: 120,
    startPrice: "6.000.000",
    location: "Đà Nẵng",
    specialties: ["Minimalist", "Scandinavian"],
    image: DEMO_IMAGES[2],
    verified: false,
  },
  {
    id: 4,
    name: "Nội Thất Phú Mỹ",
    logo: "https://ui-avatars.com/api/?name=PM&background=0F766E&color=fff&size=128",
    rating: 4.6,
    reviewCount: 145,
    projectCount: 95,
    startPrice: "5.000.000",
    location: "TP.HCM",
    specialties: ["Căn hộ", "Nhà phố"],
    image: DEMO_IMAGES[3],
    verified: true,
  },
  {
    id: 5,
    name: "Vietspace Interior",
    logo: "https://ui-avatars.com/api/?name=VS&background=134E4A&color=fff&size=128",
    rating: 4.5,
    reviewCount: 98,
    projectCount: 78,
    startPrice: "7.000.000",
    location: "Hà Nội",
    specialties: ["Hiện đại", "Industrial"],
    image: DEMO_IMAGES[4],
    verified: false,
  },
  {
    id: 6,
    name: "Art Décor Nội Thất",
    logo: "https://ui-avatars.com/api/?name=AD&background=0D9488&color=fff&size=128",
    rating: 4.8,
    reviewCount: 210,
    projectCount: 160,
    startPrice: "12.000.000",
    location: "Cần Thơ",
    specialties: ["Art Deco", "Luxury"],
    image: DEMO_IMAGES[5],
    verified: true,
  },
];

export default function InteriorCompanyScreen() {
  const { colors, spacing, radius, font, text: textStyles } = useDS();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("Tất cả");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [consultingId, setConsultingId] = useState<number | string | null>(
    null,
  );

  const { getOrCreateConversation } = useUnifiedMessaging();

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await getDesignCompanies({
        location: selectedLocation !== "Tất cả" ? selectedLocation : undefined,
        search: searchQuery || undefined,
      });
      if (res.data && res.data.length > 0) {
        setCompanies(transformData(res.data, 0));
      } else {
        setCompanies(FALLBACK);
      }
    } catch {
      setError("Không thể tải dữ liệu. Đang sử dụng dữ liệu demo.");
      setCompanies(FALLBACK);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedLocation, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleContact = async (company: Company) => {
    try {
      setConsultingId(company.id);
      const cid = await getOrCreateConversation({
        userId: Number(company.id),
        userName: company.name,
        userRole: "INTERIOR_COMPANY",
      });
      router.push(`/messages/chat/${cid}` as `/messages/chat/${string}`);
    } catch (e) {
      console.error("Error creating conversation:", e);
    } finally {
      setConsultingId(null);
    }
  };

  const filtered = companies.filter((c) => {
    const matchLoc =
      selectedLocation === "Tất cả" || c.location === selectedLocation;
    const price = parseFloat(c.startPrice.replace(/\./g, ""));
    const matchPrice =
      price >= PRICE_RANGES[selectedPriceRange].min &&
      price <= PRICE_RANGES[selectedPriceRange].max;
    const matchSearch =
      !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLoc && matchPrice && matchSearch;
  });

  const renderCard = (c: Company) => (
    <DSCard
      key={String(c.id)}
      onPress={() => router.push(`/services/company-detail?id=${c.id}`)}
      variant="elevated"
      padding={0}
      style={{ marginBottom: spacing.lg, overflow: "hidden" }}
    >
      <Image
        source={c.image ? { uri: c.image } : undefined}
        style={{ width: "100%", height: 180, backgroundColor: colors.bgMuted }}
        resizeMode="cover"
      />
      {c.verified && (
        <View
          style={{
            position: "absolute",
            top: spacing.md,
            left: spacing.md,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radius.sm,
            gap: spacing.xs,
          }}
        >
          <Ionicons
            name="checkmark-circle"
            size={14}
            color={colors.textInverse}
          />
          <Text style={[textStyles.badge, { color: colors.textInverse }]}>
            Đã xác thực
          </Text>
        </View>
      )}

      <View style={{ padding: spacing.xl }}>
        {/* Header: logo + name + location */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            marginBottom: spacing.md,
          }}
        >
          <Image
            source={c.logo ? { uri: c.logo } : undefined}
            style={{ width: 44, height: 44, borderRadius: 22 }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[textStyles.bodySemibold, { color: colors.text }]}
              numberOfLines={1}
            >
              {c.name}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
                marginTop: 2,
              }}
            >
              <Ionicons
                name="location-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text
                style={[textStyles.caption, { color: colors.textSecondary }]}
              >
                {c.location}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: spacing.sm,
            gap: spacing.md,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.xs,
            }}
          >
            <Ionicons name="star" size={14} color={colors.primary} />
            <Text style={[textStyles.smallBold, { fontSize: font.size.sm }]}>
              {c.rating.toFixed(1)}
            </Text>
            <Text style={[textStyles.caption, { color: colors.textTertiary }]}>
              ({c.reviewCount})
            </Text>
          </View>
          <View
            style={{ width: 1, height: 16, backgroundColor: colors.divider }}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.xs,
            }}
          >
            <Ionicons
              name="briefcase-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
              {c.projectCount} dự án
            </Text>
          </View>
        </View>

        {/* Tags */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.xs,
            marginBottom: spacing.md,
          }}
        >
          {c.specialties.slice(0, 3).map((sp, i) => (
            <View
              key={i}
              style={{
                backgroundColor: colors.primaryBg,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: radius.sm,
              }}
            >
              <Text
                style={[
                  textStyles.caption,
                  { color: colors.primary, fontWeight: font.weight.bold },
                ]}
              >
                {sp}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer: price + CTA */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={[textStyles.caption, { color: colors.textTertiary }]}>
              Từ
            </Text>
            <Text
              style={[
                textStyles.bodySemibold,
                { color: colors.primary, fontWeight: font.weight.bold },
              ]}
            >
              {c.startPrice}₫
            </Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              borderRadius: radius.md,
            }}
            onPress={() => handleContact(c)}
            disabled={consultingId === c.id}
          >
            {consultingId === c.id ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Text
                style={[textStyles.buttonSmall, { color: colors.textInverse }]}
              >
                Liên hệ
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </DSCard>
  );

  if (loading) {
    return (
      <DSModuleScreen title="Công ty nội thất" gradientHeader>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: spacing.xxxl,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={[
              textStyles.body,
              { color: colors.textSecondary, marginTop: spacing.md },
            ]}
          >
            Đang tải danh sách...
          </Text>
        </View>
      </DSModuleScreen>
    );
  }

  return (
    <DSModuleScreen
      title="Công ty nội thất"
      gradientHeader
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      {error && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.warningBg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            gap: spacing.sm,
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

      <View
        style={{
          backgroundColor: colors.bgSurface,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.bgMuted,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            height: 44,
          }}
        >
          <Ionicons name="search" size={20} color={colors.textTertiary} />
          <TextInput
            style={{
              flex: 1,
              fontSize: font.size.sm,
              color: colors.text,
              marginLeft: spacing.sm,
            }}
            placeholder="Tìm công ty nội thất..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View
        style={{ backgroundColor: colors.bgSurface, paddingBottom: spacing.sm }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.md,
            gap: spacing.sm,
          }}
        >
          {LOCATIONS.map((loc) => (
            <DSChip
              key={loc}
              label={loc}
              selected={selectedLocation === loc}
              onPress={() => setSelectedLocation(loc)}
            />
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.md,
            gap: spacing.sm,
            marginTop: spacing.xs,
          }}
        >
          {PRICE_RANGES.map((r, i) => (
            <DSChip
              key={i}
              label={r.label}
              selected={selectedPriceRange === i}
              onPress={() => setSelectedPriceRange(i)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={{ padding: spacing.lg }}>
        {filtered.length > 0 ? (
          filtered.map((c) => renderCard(c))
        ) : (
          <DSEmptyState
            icon="search-outline"
            title="Không tìm thấy kết quả phù hợp"
            description="Thử thay đổi bộ lọc để xem thêm kết quả"
            actionLabel="Đặt lại bộ lọc"
            onAction={() => {
              setSelectedLocation("Tất cả");
              setSelectedPriceRange(0);
              setSearchQuery("");
            }}
          />
        )}
      </View>
    </DSModuleScreen>
  );
}

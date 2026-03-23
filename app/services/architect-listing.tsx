/**
 * Architect Listing Screen — Danh sách Kiến trúc sư
 * Route: /services/architect-listing
 * Refactored: DS design system (useDS, DSCard, DSChip, DSEmptyState, DSModuleScreen).
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
  "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2119714/pexels-photo-2119714.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600",
];

const LOCATIONS = ["Tất cả", "Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ"];
const EXPERIENCE = ["Tất cả", "1-3 năm", "3-5 năm", "5-10 năm", "Trên 10 năm"];

interface Architect {
  id: number | string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  projectCount: number;
  pricePerM2: string;
  location: string;
  specialties: string[];
  experience: string;
  image: string;
  verified?: boolean;
}

function transformData(
  companies: CompanyListItem[],
  offset: number,
): Architect[] {
  return companies.map((c, i) => ({
    id: c.id,
    name: c.name,
    avatar:
      c.logo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=0D9488&color=fff&size=128`,
    rating: c.rating || 4.5,
    reviewCount: c.reviewCount || 0,
    projectCount: Math.floor(Math.random() * 150) + 30,
    pricePerM2: "300.000",
    location: c.location || "TP.HCM",
    specialties: c.specialties || ["Kiến trúc"],
    experience: "5+ năm",
    image: DEMO_IMAGES[(i + offset) % DEMO_IMAGES.length],
    verified: c.verified,
  }));
}

const FALLBACK: Architect[] = [
  {
    id: 1,
    name: "KTS. Nguyễn Văn An",
    avatar: "https://ui-avatars.com/api/?name=NVA&background=0D9488&color=fff",
    rating: 4.9,
    reviewCount: 280,
    projectCount: 120,
    pricePerM2: "350.000",
    location: "Hà Nội",
    specialties: ["Biệt thự", "Nhà phố hiện đại"],
    experience: "12 năm",
    image: DEMO_IMAGES[0],
    verified: true,
  },
  {
    id: 2,
    name: "KTS. Trần Minh Đức",
    avatar: "https://ui-avatars.com/api/?name=TMD&background=115E59&color=fff",
    rating: 4.8,
    reviewCount: 210,
    projectCount: 95,
    pricePerM2: "300.000",
    location: "TP.HCM",
    specialties: ["Resort", "Nhà vườn"],
    experience: "8 năm",
    image: DEMO_IMAGES[1],
    verified: true,
  },
  {
    id: 3,
    name: "KTS. Lê Thị Hồng",
    avatar: "https://ui-avatars.com/api/?name=LTH&background=14B8A6&color=fff",
    rating: 4.7,
    reviewCount: 165,
    projectCount: 78,
    pricePerM2: "250.000",
    location: "Đà Nẵng",
    specialties: ["Căn hộ", "Chung cư cao tầng"],
    experience: "6 năm",
    image: DEMO_IMAGES[2],
    verified: false,
  },
  {
    id: 4,
    name: "KTS. Phạm Quốc Bảo",
    avatar: "https://ui-avatars.com/api/?name=PQB&background=0F766E&color=fff",
    rating: 4.9,
    reviewCount: 340,
    projectCount: 180,
    pricePerM2: "400.000",
    location: "TP.HCM",
    specialties: ["Công trình công cộng", "Nhà hàng"],
    experience: "15 năm",
    image: DEMO_IMAGES[3],
    verified: true,
  },
  {
    id: 5,
    name: "KTS. Hoàng Anh Tuấn",
    avatar: "https://ui-avatars.com/api/?name=HAT&background=134E4A&color=fff",
    rating: 4.6,
    reviewCount: 130,
    projectCount: 60,
    pricePerM2: "280.000",
    location: "Cần Thơ",
    specialties: ["Eco-house", "Nhà xanh"],
    experience: "5 năm",
    image: DEMO_IMAGES[4],
    verified: false,
  },
  {
    id: 6,
    name: "KTS. Vũ Thanh Sơn",
    avatar: "https://ui-avatars.com/api/?name=VTS&background=0D9488&color=fff",
    rating: 4.8,
    reviewCount: 250,
    projectCount: 140,
    pricePerM2: "320.000",
    location: "Hà Nội",
    specialties: ["Biệt thự cổ điển", "Văn phòng"],
    experience: "10 năm",
    image: DEMO_IMAGES[5],
    verified: true,
  },
];

export default function ArchitectListingScreen() {
  const { colors, spacing, radius, shadow, text: textStyles, font } = useDS();
  const [architects, setArchitects] = useState<Architect[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("Tất cả");
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
      if (res.data && res.data.length > 0)
        setArchitects(transformData(res.data, 0));
      else setArchitects(FALLBACK);
    } catch {
      setError("Đang sử dụng dữ liệu demo.");
      setArchitects(FALLBACK);
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

  const handleContact = async (item: Architect) => {
    try {
      setConsultingId(item.id);
      const cid = await getOrCreateConversation({
        userId: Number(item.id),
        userName: item.name,
        userRole: "ARCHITECT",
      });
      router.push(`/messages/chat/${cid}` as `/messages/chat/${string}`);
    } catch (e) {
      console.error(e);
    } finally {
      setConsultingId(null);
    }
  };

  const filtered = architects.filter((a) => {
    const matchLoc =
      selectedLocation === "Tất cả" || a.location === selectedLocation;
    const matchSearch =
      !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLoc && matchSearch;
  });

  const renderCard = (a: Architect) => (
    <DSCard
      key={String(a.id)}
      onPress={() => router.push(`/services/company-detail?id=${a.id}`)}
      variant="elevated"
      padding={0}
      style={{ marginBottom: spacing.lg, overflow: "hidden" }}
    >
      <Image
        source={{ uri: a.image }}
        style={{ width: "100%", height: 180, backgroundColor: colors.bgMuted }}
        resizeMode="cover"
      />
      {a.verified && (
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
            Xác thực
          </Text>
        </View>
      )}
      <View
        style={{
          position: "absolute",
          top: spacing.md,
          right: spacing.md,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.6)",
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          borderRadius: radius.sm,
          gap: spacing.xs,
        }}
      >
        <Ionicons name="time-outline" size={12} color={colors.textInverse} />
        <Text style={[textStyles.badge, { color: colors.textInverse }]}>
          {a.experience}
        </Text>
      </View>

      <View style={{ padding: spacing.xl }}>
        {/* Header: avatar + name + location */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            marginBottom: spacing.md,
          }}
        >
          <Image
            source={{ uri: a.avatar }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              borderWidth: 2,
              borderColor: colors.primary,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[textStyles.bodySemibold, { color: colors.text }]}
              numberOfLines={1}
            >
              {a.name}
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
                {a.location}
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
              {a.rating.toFixed(1)}
            </Text>
            <Text style={[textStyles.caption, { color: colors.textTertiary }]}>
              ({a.reviewCount})
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
              {a.projectCount} dự án
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
          {a.specialties.slice(0, 3).map((sp, i) => (
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
              {a.pricePerM2}₫/m²
            </Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              borderRadius: radius.md,
            }}
            onPress={() => handleContact(a)}
            disabled={consultingId === a.id}
          >
            {consultingId === a.id ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Text
                style={[textStyles.buttonSmall, { color: colors.textInverse }]}
              >
                Tư vấn
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </DSCard>
  );

  if (loading) {
    return (
      <DSModuleScreen title="Kiến trúc sư" gradientHeader>
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
            Đang tải danh sách kiến trúc sư...
          </Text>
        </View>
      </DSModuleScreen>
    );
  }

  return (
    <DSModuleScreen
      title="Kiến trúc sư"
      gradientHeader
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      {/* Error banner */}
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

      {/* Search bar */}
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
            placeholder="Tìm kiến trúc sư..."
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

      {/* Location filter */}
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
      </View>

      {/* Architect list */}
      <View style={{ padding: spacing.lg }}>
        {filtered.length > 0 ? (
          filtered.map((a) => renderCard(a))
        ) : (
          <DSEmptyState
            icon="search-outline"
            title="Không tìm thấy kiến trúc sư phù hợp"
            description="Thử thay đổi bộ lọc để xem thêm kết quả"
            actionLabel="Đặt lại bộ lọc"
            onAction={() => {
              setSelectedLocation("Tất cả");
              setSearchQuery("");
            }}
          />
        )}
      </View>
    </DSModuleScreen>
  );
}

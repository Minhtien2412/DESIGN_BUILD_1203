/**
 * MEP Electrical Engineer Listing — Kỹ sư thiết kế Điện
 * Route: /services/mep-electrical
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
  "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/159397/solar-panel-array-power-sun-electricity-159397.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/544966/pexels-photo-544966.jpeg?auto=compress&cs=tinysrgb&w=600",
];

const LOCATIONS = ["Tất cả", "Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ"];
const SERVICE_TYPES = [
  "Tất cả",
  "Điện dân dụng",
  "Điện công nghiệp",
  "Điện nhẹ",
  "PCCC",
];

interface MEPEngineer {
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
  certification?: string;
}

function transformData(
  companies: CompanyListItem[],
  offset: number,
): MEPEngineer[] {
  return companies.map((c, i) => ({
    id: c.id,
    name: c.name,
    avatar:
      c.logo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=FFC107&color=333&size=128`,
    rating: c.rating || 4.5,
    reviewCount: c.reviewCount || 0,
    projectCount: Math.floor(Math.random() * 80) + 15,
    pricePerM2: "200.000",
    location: c.location || "TP.HCM",
    specialties: c.specialties || ["Thiết kế điện"],
    experience: "5+ năm",
    image: DEMO_IMAGES[(i + offset) % DEMO_IMAGES.length],
    verified: c.verified,
    certification: "Chứng chỉ hành nghề MEP",
  }));
}

const FALLBACK: MEPEngineer[] = [
  {
    id: 1,
    name: "KS. Điện - Trần Văn Phong",
    avatar: "https://ui-avatars.com/api/?name=TVP&background=FFC107&color=333",
    rating: 4.9,
    reviewCount: 210,
    projectCount: 95,
    pricePerM2: "200.000",
    location: "TP.HCM",
    specialties: ["Điện dân dụng", "Hệ thống chiếu sáng"],
    experience: "12 năm",
    image: DEMO_IMAGES[0],
    verified: true,
    certification: "Hạng I - Điện",
  },
  {
    id: 2,
    name: "KS. Nguyễn Hoàng Phúc",
    avatar: "https://ui-avatars.com/api/?name=NHP&background=FF9800&color=fff",
    rating: 4.8,
    reviewCount: 185,
    projectCount: 80,
    pricePerM2: "180.000",
    location: "Hà Nội",
    specialties: ["Điện công nghiệp", "Trạm biến áp"],
    experience: "10 năm",
    image: DEMO_IMAGES[1],
    verified: true,
    certification: "Hạng I - Điện",
  },
  {
    id: 3,
    name: "KS. Lê Minh Khoa",
    avatar: "https://ui-avatars.com/api/?name=LMK&background=FFB300&color=333",
    rating: 4.7,
    reviewCount: 145,
    projectCount: 60,
    pricePerM2: "160.000",
    location: "Đà Nẵng",
    specialties: ["Điện nhẹ", "BMS", "Camera"],
    experience: "7 năm",
    image: DEMO_IMAGES[2],
    verified: false,
    certification: "Hạng II",
  },
  {
    id: 4,
    name: "KS. Phạm Quốc Đạt",
    avatar: "https://ui-avatars.com/api/?name=PQD&background=F57F17&color=fff",
    rating: 4.9,
    reviewCount: 280,
    projectCount: 120,
    pricePerM2: "250.000",
    location: "TP.HCM",
    specialties: ["PCCC", "Hệ thống báo cháy"],
    experience: "15 năm",
    image: DEMO_IMAGES[3],
    verified: true,
    certification: "Hạng I - PCCC",
  },
  {
    id: 5,
    name: "KS. Đỗ Thành Long",
    avatar: "https://ui-avatars.com/api/?name=DTL&background=E65100&color=fff",
    rating: 4.6,
    reviewCount: 110,
    projectCount: 45,
    pricePerM2: "150.000",
    location: "Cần Thơ",
    specialties: ["Năng lượng mặt trời", "Tiết kiệm điện"],
    experience: "5 năm",
    image: DEMO_IMAGES[4],
    verified: false,
    certification: "Hạng II",
  },
  {
    id: 6,
    name: "KS. Vũ Trọng Nghĩa",
    avatar: "https://ui-avatars.com/api/?name=VTN&background=FF6F00&color=fff",
    rating: 4.8,
    reviewCount: 240,
    projectCount: 105,
    pricePerM2: "230.000",
    location: "Hà Nội",
    specialties: ["Cao tầng", "Trung tâm thương mại"],
    experience: "14 năm",
    image: DEMO_IMAGES[5],
    verified: true,
    certification: "Hạng I - Điện",
  },
];

export default function MEPElectricalScreen() {
  const { colors, spacing, radius, font, text: textStyles } = useDS();
  const [engineers, setEngineers] = useState<MEPEngineer[]>([]);
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
        setEngineers(transformData(res.data, 0));
      else setEngineers(FALLBACK);
    } catch {
      setError("Đang sử dụng dữ liệu demo.");
      setEngineers(FALLBACK);
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

  const handleContact = async (item: MEPEngineer) => {
    try {
      setConsultingId(item.id);
      const cid = await getOrCreateConversation({
        userId: Number(item.id),
        userName: item.name,
        userRole: "MEP_ELECTRICAL",
      });
      router.push(`/messages/chat/${cid}` as `/messages/chat/${string}`);
    } catch (e) {
      console.error(e);
    } finally {
      setConsultingId(null);
    }
  };

  const filtered = engineers.filter((e) => {
    const matchLoc =
      selectedLocation === "Tất cả" || e.location === selectedLocation;
    const matchSearch =
      !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLoc && matchSearch;
  });

  const renderCard = (e: MEPEngineer) => (
    <DSCard
      key={String(e.id)}
      onPress={() => router.push(`/services/company-detail?id=${e.id}`)}
      variant="elevated"
      padding={0}
      style={{ marginBottom: spacing.lg, overflow: "hidden" }}
    >
      <Image
        source={e.image ? { uri: e.image } : undefined}
        style={{ width: "100%", height: 160, backgroundColor: colors.bgMuted }}
        resizeMode="cover"
      />
      {e.verified && (
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
        <Ionicons name="flash" size={12} color={colors.textInverse} />
        <Text style={[textStyles.badge, { color: colors.textInverse }]}>
          {e.experience}
        </Text>
      </View>

      <View style={{ padding: spacing.xl }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            marginBottom: spacing.sm,
          }}
        >
          <Image
            source={e.avatar ? { uri: e.avatar } : undefined}
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
              {e.name}
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
                {e.location}
              </Text>
            </View>
          </View>
        </View>

        {e.certification && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.xs,
              marginBottom: spacing.sm,
              backgroundColor: colors.primaryBg,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: radius.sm,
              alignSelf: "flex-start",
            }}
          >
            <Ionicons name="ribbon-outline" size={14} color={colors.primary} />
            <Text
              style={[
                textStyles.caption,
                { color: colors.primary, fontWeight: font.weight.semibold },
              ]}
            >
              {e.certification}
            </Text>
          </View>
        )}

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
              {e.rating.toFixed(1)}
            </Text>
            <Text style={[textStyles.caption, { color: colors.textTertiary }]}>
              ({e.reviewCount})
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
              {e.projectCount} dự án
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.xs,
            marginBottom: spacing.md,
          }}
        >
          {e.specialties.slice(0, 3).map((sp, i) => (
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
              {e.pricePerM2}₫/m²
            </Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              borderRadius: radius.md,
            }}
            onPress={() => handleContact(e)}
            disabled={consultingId === e.id}
          >
            {consultingId === e.id ? (
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
      <DSModuleScreen title="Kỹ sư thiết kế Điện" gradientHeader>
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
            Đang tải danh sách kỹ sư điện...
          </Text>
        </View>
      </DSModuleScreen>
    );
  }

  return (
    <DSModuleScreen
      title="Kỹ sư thiết kế Điện"
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
            placeholder="Tìm kỹ sư thiết kế điện..."
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
      </View>

      <View style={{ padding: spacing.lg }}>
        {filtered.length > 0 ? (
          filtered.map((e) => renderCard(e))
        ) : (
          <DSEmptyState
            icon="search-outline"
            title="Không tìm thấy kỹ sư điện phù hợp"
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

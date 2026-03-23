/**
 * MEP Plumbing Engineer Listing — Kỹ sư thiết kế Nước
 * Route: /services/mep-plumbing
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
  "https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/544966/pexels-photo-544966.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=600",
];

const LOCATIONS = ["Tất cả", "Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ"];

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
      `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=0288D1&color=fff&size=128`,
    rating: c.rating || 4.5,
    reviewCount: c.reviewCount || 0,
    projectCount: Math.floor(Math.random() * 80) + 15,
    pricePerM2: "250.000",
    location: c.location || "TP.HCM",
    specialties: c.specialties || ["Thiết kế cấp thoát nước"],
    experience: "5+ năm",
    image: DEMO_IMAGES[(i + offset) % DEMO_IMAGES.length],
    verified: c.verified,
    certification: "Chứng chỉ hành nghề MEP",
  }));
}

const FALLBACK: MEPEngineer[] = [
  {
    id: 1,
    name: "KS. Nước - Lê Quốc Tuấn",
    avatar: "https://ui-avatars.com/api/?name=LQT&background=0288D1&color=fff",
    rating: 4.9,
    reviewCount: 220,
    projectCount: 100,
    pricePerM2: "250.000",
    location: "TP.HCM",
    specialties: ["Cấp nước", "Thoát nước", "PCCC"],
    experience: "14 năm",
    image: DEMO_IMAGES[0],
    verified: true,
    certification: "Hạng I - Cấp thoát nước",
  },
  {
    id: 2,
    name: "KS. Trần Thị Thanh Hà",
    avatar: "https://ui-avatars.com/api/?name=TTH&background=0277BD&color=fff",
    rating: 4.8,
    reviewCount: 190,
    projectCount: 85,
    pricePerM2: "220.000",
    location: "Hà Nội",
    specialties: ["Xử lý nước thải", "Bể ngầm"],
    experience: "11 năm",
    image: DEMO_IMAGES[1],
    verified: true,
    certification: "Hạng I - Cấp thoát nước",
  },
  {
    id: 3,
    name: "KS. Nguyễn Hữu Tài",
    avatar: "https://ui-avatars.com/api/?name=NHT&background=039BE5&color=fff",
    rating: 4.7,
    reviewCount: 155,
    projectCount: 65,
    pricePerM2: "180.000",
    location: "Đà Nẵng",
    specialties: ["Bể bơi", "Hệ thống tưới"],
    experience: "7 năm",
    image: DEMO_IMAGES[2],
    verified: false,
    certification: "Hạng II",
  },
  {
    id: 4,
    name: "KS. Phạm Anh Khoa",
    avatar: "https://ui-avatars.com/api/?name=PAK&background=01579B&color=fff",
    rating: 4.9,
    reviewCount: 290,
    projectCount: 130,
    pricePerM2: "280.000",
    location: "TP.HCM",
    specialties: ["Cao tầng", "Khu công nghiệp"],
    experience: "16 năm",
    image: DEMO_IMAGES[3],
    verified: true,
    certification: "Hạng I - Cấp thoát nước",
  },
  {
    id: 5,
    name: "KS. Đỗ Văn Hải",
    avatar: "https://ui-avatars.com/api/?name=DVH&background=0288D1&color=fff",
    rating: 4.6,
    reviewCount: 115,
    projectCount: 48,
    pricePerM2: "160.000",
    location: "Cần Thơ",
    specialties: ["Nhà dân", "Biệt thự"],
    experience: "5 năm",
    image: DEMO_IMAGES[4],
    verified: false,
    certification: "Hạng II",
  },
  {
    id: 6,
    name: "KS. Vũ Minh Hoàng",
    avatar: "https://ui-avatars.com/api/?name=VMH&background=0277BD&color=fff",
    rating: 4.8,
    reviewCount: 250,
    projectCount: 115,
    pricePerM2: "240.000",
    location: "Hà Nội",
    specialties: ["Hệ thống HVAC", "Điều hòa"],
    experience: "13 năm",
    image: DEMO_IMAGES[5],
    verified: true,
    certification: "Hạng I - Cơ khí",
  },
];

export default function MEPPlumbingScreen() {
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
        userRole: "MEP_PLUMBING",
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
        <Ionicons name="water" size={12} color={colors.textInverse} />
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
      <DSModuleScreen title="Kỹ sư thiết kế Nước" gradientHeader>
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
            Đang tải danh sách kỹ sư nước...
          </Text>
        </View>
      </DSModuleScreen>
    );
  }

  return (
    <DSModuleScreen
      title="Kỹ sư thiết kế Nước"
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
            placeholder="Tìm kỹ sư thiết kế nước..."
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
            title="Không tìm thấy kỹ sư nước phù hợp"
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

/**
 * Home Screen Sections — Clean, composable sections using DS
 * Each section is a self-contained component that can be reused
 * @created 2026-02-24
 */

import {
    CATEGORY_ITEMS,
    DESIGN_LIVE,
    DesignServiceItem,
    REPAIR_SERVICES,
    ServiceItem,
    WorkerItem
} from "@/data/home-data";
import { getPopularVideos, VideoItem } from "@/data/videos";
import { useDS } from "@/hooks/useDS";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, router } from "expo-router";
import { memo, useMemo } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { DSSectionHeader, DSServiceIcon } from "@/components/ds";

const { width: SCREEN_W } = Dimensions.get("window");

// ═══════════════════════════════════════════════════════════════════════
// Helper: Group items into pages for horizontal paging
// ═══════════════════════════════════════════════════════════════════════

function groupIntoPages<T>(items: T[], pageSize: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += pageSize) {
    pages.push(items.slice(i, i + pageSize));
  }
  return pages;
}

// ═══════════════════════════════════════════════════════════════════════
// ServiceGridSection — 2-row x 4-col paging grid
// ═══════════════════════════════════════════════════════════════════════

interface ServiceGridSectionProps {
  title: string;
  data: ServiceItem[];
  seeMoreRoute: string;
}

export const ServiceGridSection = memo<ServiceGridSectionProps>(
  ({ title, data, seeMoreRoute }) => {
    const { colors, spacing } = useDS();
    const pages = useMemo(() => groupIntoPages(data, 8), [data]);
    const pageWidth = SCREEN_W - spacing.xl * 2;
    const itemWidth = pageWidth / 4;

    return (
      <View style={{ marginTop: spacing.lg }}>
        <DSSectionHeader title={title} seeMoreRoute={seeMoreRoute} />
        <FlatList
          data={pages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => `page-${i}`}
          renderItem={({ item: pageItems }) => (
            <View
              style={{
                width: pageWidth,
                flexDirection: "row",
                flexWrap: "wrap",
                paddingHorizontal: spacing.xl,
              }}
            >
              {pageItems.map((item) => (
                <View
                  key={item.id}
                  style={{
                    width: itemWidth,
                    alignItems: "center",
                    marginBottom: spacing.md,
                  }}
                >
                  <DSServiceIcon
                    label={item.label}
                    image={item.icon}
                    onPress={() => router.push(item.route as Href)}
                    size={52}
                  />
                </View>
              ))}
            </View>
          )}
        />
      </View>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════
// DesignServiceGridSection — With price badge
// ═══════════════════════════════════════════════════════════════════════

interface DesignServiceGridProps {
  title: string;
  data: DesignServiceItem[];
  seeMoreRoute: string;
}

export const DesignServiceGridSection = memo<DesignServiceGridProps>(
  ({ title, data, seeMoreRoute }) => {
    const { colors, spacing } = useDS();
    const pages = useMemo(() => groupIntoPages(data, 8), [data]);
    const pageWidth = SCREEN_W - spacing.xl * 2;
    const itemWidth = pageWidth / 4;

    return (
      <View style={{ marginTop: spacing.lg }}>
        <DSSectionHeader title={title} seeMoreRoute={seeMoreRoute} />
        <FlatList
          data={pages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => `dpage-${i}`}
          renderItem={({ item: pageItems }) => (
            <View
              style={{
                width: pageWidth,
                flexDirection: "row",
                flexWrap: "wrap",
                paddingHorizontal: spacing.xl,
              }}
            >
              {pageItems.map((item) => (
                <View
                  key={item.id}
                  style={{
                    width: itemWidth,
                    alignItems: "center",
                    marginBottom: spacing.md,
                  }}
                >
                  <DSServiceIcon
                    label={item.label}
                    image={item.icon}
                    subtitle={item.price}
                    onPress={() => router.push(item.route as Href)}
                    size={48}
                  />
                </View>
              ))}
            </View>
          )}
        />
      </View>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════
// WorkerGridSection — With location/count badge
// ═══════════════════════════════════════════════════════════════════════

interface WorkerGridSectionProps {
  title: string;
  data: WorkerItem[];
  seeMoreRoute: string;
}

export const WorkerGridSection = memo<WorkerGridSectionProps>(
  ({ title, data, seeMoreRoute }) => {
    const { colors, spacing, text: textStyles } = useDS();
    const pages = useMemo(() => groupIntoPages(data, 8), [data]);
    const pageWidth = SCREEN_W - spacing.xl * 2;
    const itemWidth = pageWidth / 4;

    return (
      <View style={{ marginTop: spacing.lg }}>
        <DSSectionHeader title={title} seeMoreRoute={seeMoreRoute} />
        <FlatList
          data={pages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => `wpage-${i}`}
          renderItem={({ item: pageItems }) => (
            <View
              style={{
                width: pageWidth,
                flexDirection: "row",
                flexWrap: "wrap",
                paddingHorizontal: spacing.xl,
              }}
            >
              {pageItems.map((item) => (
                <View
                  key={item.id}
                  style={{
                    width: itemWidth,
                    alignItems: "center",
                    marginBottom: spacing.md,
                  }}
                >
                  <DSServiceIcon
                    label={item.label}
                    image={item.icon}
                    subtitle={item.price || undefined}
                    onPress={() => router.push(item.route as Href)}
                    size={48}
                  />
                </View>
              ))}
            </View>
          )}
        />
      </View>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════
// RepairServicesSection — Horizontal scroll of repair service cards
// ═══════════════════════════════════════════════════════════════════════

export const RepairServicesSection = memo(() => {
  const { colors, spacing, radius, text: textStyles } = useDS();

  return (
    <View style={{ marginTop: spacing.lg }}>
      <DSSectionHeader
        title="🔧 DỊCH VỤ SỬA CHỮA TẠI NHÀ"
        seeMoreRoute="/service-booking"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          gap: spacing.md,
        }}
      >
        {REPAIR_SERVICES.map((svc) => (
          <TouchableOpacity
            key={svc.id}
            style={{ alignItems: "center", width: 72 }}
            onPress={() => router.push("/service-booking" as Href)}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: radius.lg,
                backgroundColor: svc.color + "15",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: spacing.xs,
              }}
            >
              <MaterialCommunityIcons
                name={svc.icon as any}
                size={26}
                color={svc.color}
              />
            </View>
            <Text
              style={[
                textStyles.badge,
                {
                  color: colors.text,
                  textAlign: "center",
                  lineHeight: 13,
                  fontWeight: "600",
                },
              ]}
              numberOfLines={2}
            >
              {svc.label}
            </Text>
            <Text
              style={[
                textStyles.badge,
                { color: colors.success, marginTop: 1, fontWeight: "700" },
              ]}
            >
              từ {svc.price}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* CTA Banner */}
      <TouchableOpacity
        style={{
          marginTop: spacing.lg,
          marginHorizontal: spacing.xl,
          backgroundColor: colors.primary,
          borderRadius: radius.md,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.md,
        }}
        onPress={() => router.push("/service-booking" as Href)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="account-hard-hat"
          size={20}
          color="#fff"
        />
        <Text style={[textStyles.button, { color: "#fff" }]}>
          Tìm thợ gần bạn ngay
        </Text>
        <Ionicons name="arrow-forward" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// DesignLiveSection — Horizontal live circles
// ═══════════════════════════════════════════════════════════════════════

export const DesignLiveSection = memo(() => {
  const { colors, spacing, radius, text: textStyles } = useDS();

  return (
    <View style={{ marginTop: spacing.lg }}>
      <DSSectionHeader title="DESIGN LIVE" seeMoreRoute="/live" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          gap: spacing.md,
        }}
      >
        {DESIGN_LIVE.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={{ position: "relative" }}
            onPress={() => router.push(item.route as Href)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: item.image }}
              style={{
                width: 68,
                height: 68,
                borderRadius: radius.md,
                backgroundColor: colors.bgMuted,
              }}
            />
            {item.badge && (
              <View
                style={{
                  position: "absolute",
                  top: 4,
                  left: 4,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.error,
                  paddingHorizontal: 5,
                  paddingVertical: 2,
                  borderRadius: radius.xs,
                  gap: 3,
                }}
              >
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: "#fff",
                  }}
                />
                <Text
                  style={[textStyles.badge, { color: "#fff", fontSize: 8 }]}
                >
                  LIVE
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// VideoSection — Horizontal video cards
// ═══════════════════════════════════════════════════════════════════════

export const VideoSection = memo<{
  title: string;
  seeMoreRoute: string;
}>(({ title, seeMoreRoute }) => {
  const { colors, spacing, radius, text: textStyles } = useDS();
  const videos = useMemo(
    () =>
      getPopularVideos(10).map((v: VideoItem) => ({
        id: v.id,
        label: v.title.length > 20 ? v.title.slice(0, 20) + "..." : v.title,
        image: v.thumbnail,
        duration: v.duration,
        views: v.views,
      })),
    [],
  );

  return (
    <View style={{ marginTop: spacing.lg }}>
      <DSSectionHeader title={title} seeMoreRoute={seeMoreRoute} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          gap: spacing.md,
        }}
      >
        {videos.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={{ width: 120 }}
            onPress={() => router.push("/demo-videos" as Href)}
            activeOpacity={0.8}
          >
            <View style={{ position: "relative" }}>
              <Image
                source={{ uri: item.image }}
                style={{
                  width: 120,
                  height: 80,
                  borderRadius: radius.sm,
                  backgroundColor: colors.bgMuted,
                }}
              />
              {/* Duration badge */}
              <View
                style={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  backgroundColor: "rgba(0,0,0,0.7)",
                  paddingHorizontal: 4,
                  paddingVertical: 2,
                  borderRadius: radius.xs,
                }}
              >
                <Text style={{ fontSize: 8, fontWeight: "600", color: "#fff" }}>
                  {item.duration}
                </Text>
              </View>
              {/* Play icon */}
              <View
                style={{
                  position: "absolute",
                  top: 24,
                  left: 44,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="play" size={16} color="#fff" />
              </View>
            </View>
            <Text
              style={[
                textStyles.badge,
                {
                  color: colors.text,
                  marginTop: spacing.xs,
                  fontWeight: "500",
                  lineHeight: 14,
                },
              ]}
              numberOfLines={2}
            >
              {item.label}
            </Text>
            <Text
              style={[
                textStyles.badge,
                { color: colors.textTertiary, marginTop: 1, fontSize: 8 },
              ]}
            >
              {item.views?.toLocaleString()} lượt xem
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// CategoriesSection — Horizontal category cards
// ═══════════════════════════════════════════════════════════════════════

export const CategoriesSection = memo(() => {
  const { colors, spacing, radius, text: textStyles } = useDS();

  return (
    <View style={{ marginTop: spacing.lg }}>
      <DSSectionHeader title="DANH MỤC NỔI BẬT" seeMoreRoute="/categories" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          gap: spacing.md,
        }}
      >
        {CATEGORY_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={{
              width: 96,
              backgroundColor: colors.card,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.borderLight,
              alignItems: "center",
              paddingVertical: spacing.lg,
            }}
            onPress={() => router.push(item.route as Href)}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: item.color + "15",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: spacing.md,
              }}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={28}
                color={item.color}
              />
            </View>
            <Text
              style={[
                textStyles.badge,
                {
                  color: colors.text,
                  textAlign: "center",
                  lineHeight: 14,
                  fontWeight: "500",
                },
              ]}
              numberOfLines={2}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// GreenBanner — CTA banner for construction utilities
// ═══════════════════════════════════════════════════════════════════════

export const GreenBanner = memo(() => {
  const { colors, spacing, radius, text: textStyles } = useDS();

  return (
    <View style={{ marginTop: spacing.lg, paddingHorizontal: spacing.xl }}>
      <TouchableOpacity
        onPress={() => router.push("/construction" as Href)}
        activeOpacity={0.85}
        style={{ borderRadius: radius.lg, overflow: "hidden" }}
      >
        <LinearGradient
          colors={["#0F766E", "#0D9488", "#14B8A6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: spacing.xxl,
            flexDirection: "row",
            minHeight: 130,
          }}
        >
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <View>
              <Text style={[textStyles.h3, { color: "#fff" }]}>
                Tiện ích xây dựng
              </Text>
              <Text
                style={[
                  textStyles.small,
                  { color: "rgba(255,255,255,0.85)", marginTop: 4 },
                ]}
              >
                Quản lý dự án, vật liệu, nhân công
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                borderRadius: radius.full,
                alignSelf: "flex-start",
                gap: spacing.xs,
                marginTop: spacing.md,
              }}
            >
              <Text style={[textStyles.smallMedium, { color: "#fff" }]}>
                Khám phá ngay
              </Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </View>
          </View>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Ionicons
              name="construct-outline"
              size={56}
              color="rgba(255,255,255,0.3)"
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
});

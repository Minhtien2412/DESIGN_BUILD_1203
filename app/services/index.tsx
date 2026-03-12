/**
 * Services Hub — Dịch vụ
 * Route: /services
 * Migrated to DSModuleScreen layout
 */

import { DSModuleScreen } from "@/components/ds/layouts";
import { AI_SERVICES, SERVICES } from "@/data/home-sections";
import { useDS } from "@/hooks/useDS";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, router } from "expo-router";
import { useRef } from "react";
import {
    Animated,
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ── AI Service Card ────────────────────────────────────────────────────
function AIServiceCard({ item }: { item: (typeof AI_SERVICES)[0] }) {
  const { colors, radius } = useDS();
  const scale = useRef(new Animated.Value(1)).current;

  const onIn = () =>
    Animated.spring(scale, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  const onOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => router.push(item.route as Href)}
      onPressIn={onIn}
      onPressOut={onOut}
    >
      <Animated.View
        style={[
          st.aiCard,
          {
            backgroundColor: colors.bgSurface,
            borderColor: colors.border,
            borderRadius: radius.lg,
            transform: [{ scale }],
          },
        ]}
      >
        <View
          style={[
            st.aiIconBox,
            { backgroundColor: item.color + "15", borderRadius: radius.md },
          ]}
        >
          <Text style={st.aiIcon}>{item.icon}</Text>
        </View>
        <Text style={[st.aiName, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        {item.isNew && (
          <View style={[st.hotDot, { backgroundColor: item.color }]} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Service Card ───────────────────────────────────────────────────────
function ServiceCard({ item }: { item: (typeof SERVICES)[0] }) {
  const { colors, radius, shadow } = useDS();
  const scale = useRef(new Animated.Value(1)).current;

  const onIn = () =>
    Animated.spring(scale, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  const onOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();

  return (
    <TouchableOpacity
      style={st.serviceCard}
      activeOpacity={1}
      onPress={() => router.push(item.route as Href)}
      onPressIn={onIn}
      onPressOut={onOut}
    >
      <Animated.View
        style={[
          st.serviceInner,
          shadow.xs,
          {
            backgroundColor: colors.bgSurface,
            borderColor: colors.border,
            borderRadius: radius.xl,
            transform: [{ scale }],
          },
        ]}
      >
        <View
          style={[
            st.iconWrap,
            { backgroundColor: colors.primaryLight, borderRadius: radius.lg },
          ]}
        >
          <Image source={item.icon} style={st.icon} resizeMode="contain" />
        </View>
        <Text
          style={[st.serviceName, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────
export default function ServicesHubScreen() {
  const { colors, spacing, radius, shadow } = useDS();

  return (
    <DSModuleScreen
      title="Dịch vụ"
      gradientHeader
      headerRight={
        <Pressable
          style={st.headerBtn}
          onPress={() => router.push("/search" as any)}
          hitSlop={8}
        >
          <Ionicons name="search-outline" size={22} color="#FFF" />
        </Pressable>
      }
    >
      {/* AI Services Banner */}
      <View
        style={[
          st.aiSection,
          {
            borderColor: colors.border,
            borderRadius: radius.xl,
            marginHorizontal: spacing.md,
            marginTop: spacing.md,
          },
        ]}
      >
        <View style={st.aiHeader}>
          <LinearGradient
            colors={["#7C3AED", "#A855F7"]}
            style={st.aiGradientIcon}
          >
            <MaterialCommunityIcons name="robot-happy" size={18} color="#fff" />
          </LinearGradient>
          <Text style={[st.aiTitle, { color: "#6D28D9" }]}>Tư vấn AI</Text>
          <View style={[st.newBadge, { backgroundColor: colors.primary }]}>
            <Text style={st.newBadgeText}>MỚI</Text>
          </View>
        </View>
        <Text style={[st.aiSubtitle, { color: colors.textSecondary }]}>
          Trợ lý AI thông minh tư vấn mọi vấn đề về xây dựng
        </Text>
        <View style={st.aiRow}>
          {AI_SERVICES.map((svc) => (
            <AIServiceCard key={svc.id} item={svc} />
          ))}
        </View>
      </View>

      {/* Marketplace Banner */}
      <Pressable
        style={[
          st.marketBanner,
          {
            marginHorizontal: spacing.md,
            marginTop: spacing.md,
            borderRadius: radius.xl,
          },
        ]}
        onPress={() => router.push("/services/marketplace" as Href)}
      >
        <LinearGradient
          colors={[colors.primary, "#14B8A6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[st.marketGradient, { borderRadius: radius.xl }]}
        >
          <View style={st.bannerLeft}>
            <View style={st.bannerIcon}>
              <Ionicons name="storefront" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.bannerTitle}>Services Marketplace</Text>
              <Text style={st.bannerSub}>Tìm & đặt dịch vụ chuyên nghiệp</Text>
            </View>
          </View>
          <View style={st.bannerArrow}>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </View>
        </LinearGradient>
      </Pressable>

      {/* Section Header */}
      <View
        style={[
          st.sectionHead,
          { paddingHorizontal: spacing.md, marginTop: spacing.md },
        ]}
      >
        <Text style={[st.sectionTitle, { color: colors.text }]}>
          Tất cả dịch vụ
        </Text>
        <Text
          style={[
            st.sectionCount,
            {
              color: colors.primary,
              backgroundColor: colors.primaryLight,
              borderRadius: radius.sm,
            },
          ]}
        >
          {SERVICES.length}
        </Text>
      </View>

      {/* Services Grid */}
      <View style={[st.grid, { padding: spacing.sm, gap: spacing.sm }]}>
        {SERVICES.map((svc) => (
          <ServiceCard key={svc.id} item={svc} />
        ))}
      </View>

      <View style={{ height: 80 }} />
    </DSModuleScreen>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  // AI Section
  aiSection: {
    backgroundColor: "#FAF5FF",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  aiGradientIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  aiTitle: { fontSize: 16, fontWeight: "800" },
  newBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  newBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  aiSubtitle: { fontSize: 13, marginBottom: 12 },
  aiRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  aiCard: {
    width: 68,
    alignItems: "center",
    padding: 8,
    borderWidth: 1,
    position: "relative",
  },
  aiIconBox: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  aiIcon: { fontSize: 20 },
  aiName: {
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 13,
  },
  hotDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Marketplace Banner
  marketBanner: {
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  marketGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
  },
  bannerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 2,
  },
  bannerSub: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  bannerArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Section
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 6,
  },
  sectionTitle: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
  sectionCount: {
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 3,
    overflow: "hidden",
  },

  // Grid
  grid: { flexDirection: "row", flexWrap: "wrap" },
  serviceCard: { width: "31%", aspectRatio: 1 },
  serviceInner: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  iconWrap: {
    width: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: { width: 32, height: 32 },
  serviceName: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 16,
  },
});

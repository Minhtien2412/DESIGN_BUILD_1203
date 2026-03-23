/**
 * Construction Services Hub
 * Route: /construction
 * Migrated to DS tokens + DSModuleScreen
 */

import { DSModuleScreen } from "@/components/ds/layouts";
import { useDS } from "@/hooks/useDS";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

// ── Data ───────────────────────────────────────────────────────────────
const CONSTRUCTION_SERVICES = [
  {
    id: "project-info",
    label: "Thông tin công trình",
    desc: "Chi tiết dự án, ngân sách",
    icon: "information-circle-outline" as const,
    route: "/construction/project-info",
    color: "#8B5CF6",
    badge: "New",
  },
  {
    id: "progress",
    label: "Tiến độ thi công",
    desc: "Theo dõi tiến độ công trình",
    icon: "analytics-outline" as const,
    route: "/construction/progress",
    color: "#0D9488",
    badge: "Hot",
  },
  {
    id: "tracking",
    label: "Theo dõi công trình",
    desc: "Real-time tracking",
    icon: "location-outline" as const,
    route: "/construction/tracking",
    color: "#0D9488",
  },
  {
    id: "villa",
    label: "Tiến độ biệt thự",
    desc: "Villa progress tracking",
    icon: "home-outline" as const,
    route: "/construction/villa-progress",
    color: "#666666",
  },
  {
    id: "board",
    label: "Board tiến độ",
    desc: "Kanban style board",
    icon: "grid-outline" as const,
    route: "/construction/progress-board",
    color: "#0D9488",
  },
  {
    id: "concrete",
    label: "Lịch đổ bê tông",
    desc: "Concrete schedule",
    icon: "calendar-outline" as const,
    route: "/construction/concrete-schedule-map",
    color: "#000000",
  },
  {
    id: "map-view",
    label: "Bản đồ công trình",
    desc: "Map view",
    icon: "map-outline" as const,
    route: "/construction/map-view",
    color: "#06B6D4",
  },
  {
    id: "payment",
    label: "Thanh toán tiến độ",
    desc: "Payment progress",
    icon: "card-outline" as const,
    route: "/construction/payment-progress",
    color: "#666666",
  },
  {
    id: "booking",
    label: "Đặt lịch thi công",
    desc: "Book construction",
    icon: "calendar-number-outline" as const,
    route: "/construction/booking",
    color: "#666666",
  },
  {
    id: "vlxd",
    label: "Ép cọc - BT - VLXD",
    desc: "Đặt hàng vật liệu xây dựng",
    icon: "cube-outline" as const,
    route: "/vlxd",
    color: "#0D9488",
    badge: "New",
  },
];

const HIRING_SERVICES = [
  {
    id: "ep-coc",
    label: "Ép cọc",
    icon: "⚡",
    route: "/utilities/ep-coc",
    price: "Từ 50K/m",
  },
  {
    id: "dao-dat",
    label: "Đào đất",
    icon: "🚜",
    route: "/utilities/dao-dat",
    price: "Từ 80K/m³",
  },
  {
    id: "be-tong",
    label: "Bê tông",
    icon: "🏗️",
    route: "/utilities/be-tong",
    price: "Từ 1.2M/m³",
  },
  {
    id: "vat-lieu",
    label: "Vật liệu",
    icon: "📦",
    route: "/utilities/vat-lieu",
    price: "Liên hệ",
  },
  {
    id: "tho-xay",
    label: "Thợ xây",
    icon: "👷",
    route: "/utilities/tho-xay",
    price: "Từ 400K/ngày",
  },
  {
    id: "dien-nuoc",
    label: "Điện nước",
    icon: "💡",
    route: "/utilities/tho-dien-nuoc",
    price: "Từ 350K/ngày",
  },
  {
    id: "coffa",
    label: "Cốp pha",
    icon: "🔧",
    route: "/utilities/tho-coffa",
    price: "Từ 500K/ngày",
  },
  {
    id: "design",
    label: "Thiết kế",
    icon: "✏️",
    route: "/utilities/design-team",
    price: "Từ 50K/m²",
  },
];

const QUICK_LINKS = [
  {
    id: "materials",
    label: "Vật liệu",
    icon: "cube-outline" as const,
    route: "/materials/index",
    color: "#666666",
  },
  {
    id: "equipment",
    label: "Thiết bị",
    icon: "hardware-chip-outline" as const,
    route: "/equipment/index",
    color: "#0D9488",
  },
  {
    id: "safety",
    label: "An toàn",
    icon: "shield-checkmark-outline" as const,
    route: "/safety/index",
    color: "#000000",
  },
  {
    id: "quality",
    label: "QC/QA",
    icon: "checkmark-circle-outline" as const,
    route: "/quality-assurance/index",
    color: "#0D9488",
  },
];

// ── Components ─────────────────────────────────────────────────────────
function QuickLinks() {
  const { colors, radius } = useDS();
  return (
    <View style={st.quickRow}>
      {QUICK_LINKS.map((item) => (
        <Pressable
          key={item.id}
          style={st.qlItem}
          onPress={() => router.push(item.route as any)}
        >
          <View
            style={[
              st.qlIcon,
              { backgroundColor: item.color + "15", borderRadius: radius.lg },
            ]}
          >
            <Ionicons name={item.icon} size={22} color={item.color} />
          </View>
          <Text style={[st.qlLabel, { color: colors.text }]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ServiceCard({ item }: { item: (typeof CONSTRUCTION_SERVICES)[0] }) {
  const { colors, radius, shadow } = useDS();
  return (
    <Pressable
      style={[
        st.svcCard,
        shadow.xs,
        {
          backgroundColor: colors.bgSurface,
          borderColor: colors.border,
          borderRadius: radius.xl,
          width: CARD_W,
        },
      ]}
      onPress={() => router.push(item.route as any)}
    >
      <View
        style={[
          st.svcIconBox,
          { backgroundColor: item.color + "15", borderRadius: radius.lg },
        ]}
      >
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      {item.badge && (
        <View
          style={[
            st.badge,
            { backgroundColor: colors.primary, borderRadius: radius.sm },
          ]}
        >
          <Text style={st.badgeText}>{item.badge}</Text>
        </View>
      )}
      <Text style={[st.svcLabel, { color: colors.text }]}>{item.label}</Text>
      <Text style={[st.svcDesc, { color: colors.textTertiary }]}>
        {item.desc}
      </Text>
    </Pressable>
  );
}

function HiringCard({ item }: { item: (typeof HIRING_SERVICES)[0] }) {
  const { colors, radius } = useDS();
  return (
    <Pressable
      style={[
        st.hireCard,
        {
          backgroundColor: colors.bgSurface,
          borderColor: colors.border,
          borderRadius: radius.lg,
        },
      ]}
      onPress={() => router.push(item.route as any)}
    >
      <View style={[st.hireIconBox, { borderRadius: radius.md }]}>
        <Text style={st.emoji}>{item.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[st.hireLabel, { color: colors.text }]}>{item.label}</Text>
        <Text style={[st.hirePrice, { color: colors.primary }]}>
          {item.price}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────
export default function ConstructionMenuScreen() {
  const { colors, spacing, radius, shadow } = useDS();

  return (
    <DSModuleScreen
      title="Dịch vụ thi công"
      headerRight={
        <Pressable
          onPress={() => router.push("/construction-progress" as any)}
          hitSlop={8}
          style={{ padding: 8 }}
        >
          <Ionicons name="construct-outline" size={24} color={colors.text} />
        </Pressable>
      }
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Hero Banner */}
      <Pressable
        style={[
          st.hero,
          shadow.md,
          {
            borderRadius: radius.xl,
            marginHorizontal: spacing.md,
            marginTop: spacing.md,
          },
        ]}
        onPress={() => router.push("/construction/progress" as any)}
      >
        <LinearGradient
          colors={[colors.primary, "#14B8A6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[st.heroGrad, { borderRadius: radius.xl }]}
        >
          <View style={st.heroContent}>
            <View style={{ flex: 1 }}>
              <Text style={st.heroTitle}>Tư vấn miễn phí</Text>
              <Text style={st.heroSub}>Hỗ trợ thiết kế & báo giá 24/7</Text>
              <View style={[st.heroBtn, { borderRadius: radius.md }]}>
                <Text style={[st.heroBtnText, { color: colors.primary }]}>
                  Liên hệ ngay
                </Text>
              </View>
            </View>
            <Ionicons
              name="construct"
              size={64}
              color="rgba(255,255,255,0.3)"
            />
          </View>
        </LinearGradient>
      </Pressable>

      {/* Quick Links */}
      <View
        style={{ marginVertical: spacing.lg, paddingHorizontal: spacing.md }}
      >
        <QuickLinks />
      </View>

      {/* Construction Services */}
      <View style={{ paddingHorizontal: spacing.md }}>
        <View style={st.sectionHead}>
          <Text style={[st.sectionTitle, { color: colors.text }]}>
            Quản lý thi công
          </Text>
          <Pressable
            onPress={() => router.push("/construction/progress" as any)}
          >
            <Text style={[st.seeAll, { color: colors.primary }]}>
              Xem tất cả
            </Text>
          </Pressable>
        </View>
        <View style={[st.grid, { gap: spacing.sm }]}>
          {CONSTRUCTION_SERVICES.map((svc) => (
            <ServiceCard key={svc.id} item={svc} />
          ))}
        </View>
      </View>

      {/* Hiring Services */}
      <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
        <View style={st.sectionHead}>
          <Text style={[st.sectionTitle, { color: colors.text }]}>
            Thuê dịch vụ
          </Text>
          <Pressable onPress={() => router.push("/utilities" as any)}>
            <Text style={[st.seeAll, { color: colors.primary }]}>
              Xem tất cả
            </Text>
          </Pressable>
        </View>
        <View style={{ gap: 8 }}>
          {HIRING_SERVICES.map((svc) => (
            <HiringCard key={svc.id} item={svc} />
          ))}
        </View>
      </View>

      {/* CTA */}
      <Pressable
        style={[
          st.cta,
          shadow.md,
          {
            borderRadius: radius.xl,
            marginHorizontal: spacing.md,
            marginTop: spacing.lg,
          },
        ]}
        onPress={() => router.push("/services/house-design" as any)}
      >
        <LinearGradient
          colors={[colors.primary, "#14B8A6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[st.ctaGrad, { borderRadius: radius.xl }]}
        >
          <View style={st.ctaInner}>
            <Ionicons name="home" size={32} color="#fff" />
            <View>
              <Text style={st.ctaTitle}>Thiết kế nhà</Text>
              <Text style={st.ctaSub}>Miễn phí tư vấn thiết kế</Text>
            </View>
          </View>
          <View style={[st.ctaBtn, { borderRadius: radius.md }]}>
            <Text style={[st.ctaBtnText, { color: colors.primary }]}>
              Bắt đầu
            </Text>
          </View>
        </LinearGradient>
      </Pressable>

      <View style={{ height: 100 }} />
    </DSModuleScreen>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  // Quick links
  quickRow: { flexDirection: "row", justifyContent: "space-between" },
  qlItem: { alignItems: "center", width: (width - 48) / 4 },
  qlIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  qlLabel: { fontSize: 12, fontWeight: "500", textAlign: "center" },

  // Section
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", letterSpacing: -0.2 },
  seeAll: { fontSize: 14, fontWeight: "500" },

  // Grid & cards
  grid: { flexDirection: "row", flexWrap: "wrap" },
  svcCard: {
    padding: 16,
    borderWidth: 1,
    position: "relative",
    marginBottom: 8,
  },
  svcIconBox: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 10, fontWeight: "600", color: "#fff" },
  svcLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  svcDesc: { fontSize: 12 },

  // Hiring
  hireCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
  },
  hireIconBox: {
    width: 44,
    height: 44,
    backgroundColor: "#FFF5F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  emoji: { fontSize: 22 },
  hireLabel: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  hirePrice: { fontSize: 12, fontWeight: "500" },

  // Hero
  hero: { overflow: "hidden" },
  heroGrad: { padding: 20 },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.9)", marginBottom: 16 },
  heroBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  heroBtnText: { fontSize: 14, fontWeight: "600" },

  // CTA
  cta: { overflow: "hidden" },
  ctaGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  ctaInner: { flexDirection: "row", alignItems: "center", gap: 12 },
  ctaTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  ctaSub: { fontSize: 13, color: "rgba(255,255,255,0.9)", marginTop: 2 },
  ctaBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  ctaBtnText: { fontSize: 14, fontWeight: "600" },
});

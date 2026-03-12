/**
 * Dashboard Index — Role-based Dashboard
 * Route: /dashboard
 * Migrated to DS tokens
 */

import { useAuth } from "@/context/AuthContext";
import { useDS } from "@/hooks/useDS";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW } = Dimensions.get("window");

// ── Data ───────────────────────────────────────────────────────────────
const DASHBOARDS = [
  {
    id: "admin",
    titleVi: "Trung tâm Admin",
    desc: "Quản lý hệ thống, người dùng, báo cáo",
    icon: "shield-checkmark" as const,
    route: "/dashboard/admin",
    gradient: ["#1a1a2e", "#16213e"] as [string, string],
    stats: { users: 128, reports: 45 },
    roles: ["admin"],
  },
  {
    id: "engineer",
    titleVi: "Trung tâm Kỹ sư",
    desc: "Dự án, tiến độ, chất lượng công trình",
    icon: "construct" as const,
    route: "/dashboard/engineer",
    gradient: ["#0f3460", "#16213e"] as [string, string],
    stats: { projects: 12, tasks: 67 },
    roles: ["engineer", "employee"],
  },
  {
    id: "client",
    titleVi: "Trung tâm Khách hàng",
    desc: "Theo dõi dự án, thanh toán, hỗ trợ",
    icon: "home" as const,
    route: "/dashboard/client",
    gradient: ["#1a1a2e", "#0f3460"] as [string, string],
    stats: { active: 3, pending: 2 },
    roles: ["user", "client"],
  },
];

const QUICK_ACTIONS = [
  {
    id: "projects",
    icon: "folder" as const,
    label: "Dự án",
    route: "/(tabs)/projects",
    color: "#6366f1",
  },
  {
    id: "reports",
    icon: "bar-chart" as const,
    label: "Báo cáo",
    route: "/reports/index",
    color: "#14B8A6",
  },
  {
    id: "timeline",
    icon: "time" as const,
    label: "Timeline",
    route: "/timeline/index",
    color: "#f59e0b",
  },
  {
    id: "budget",
    icon: "wallet" as const,
    label: "Ngân sách",
    route: "/budget/index",
    color: "#10b981",
  },
  {
    id: "tasks",
    icon: "checkbox" as const,
    label: "Nhiệm vụ",
    route: "/tasks",
    color: "#8b5cf6",
  },
  {
    id: "team",
    icon: "people" as const,
    label: "Nhóm",
    route: "/team",
    color: "#ec4899",
  },
];

const RECENT = [
  {
    id: "1",
    title: "Dự án Alpha cập nhật",
    time: "5 phút trước",
    icon: "folder" as const,
  },
  {
    id: "2",
    title: "Hoàn thành task #234",
    time: "15 phút trước",
    icon: "checkmark-circle" as const,
  },
  {
    id: "3",
    title: "Tin nhắn mới từ đội dự án",
    time: "1 giờ trước",
    icon: "chatbubble" as const,
  },
];

// ── DashboardCard ──────────────────────────────────────────────────────
function DashboardCard({
  item,
  index,
  onPress,
}: {
  item: (typeof DASHBOARDS)[0];
  index: number;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        st.cardWrap,
        {
          opacity: scale,
          transform: [
            { scale: Animated.multiply(scale, press) },
            {
              translateY: scale.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(press, {
            toValue: 0.96,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(press, { toValue: 1, useNativeDriver: true }).start()
        }
      >
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={st.dashCard}
        >
          <View style={st.decor1} />
          <View style={st.decor2} />
          <View style={st.cardHead}>
            <View style={st.cardIcon}>
              <Ionicons name={item.icon} size={28} color="#fff" />
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="rgba(255,255,255,0.5)"
            />
          </View>
          <View style={{ marginTop: 16 }}>
            <Text style={st.cardTitle}>{item.titleVi}</Text>
            <Text style={st.cardDesc}>{item.desc}</Text>
          </View>
          <View style={st.cardStats}>
            {Object.entries(item.stats).map(([k, v]) => (
              <View key={k} style={{ alignItems: "flex-start" }}>
                <Text style={st.statVal}>{v}</Text>
                <Text style={st.statLabel}>{k}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────
export default function DashboardIndexScreen() {
  const { user } = useAuth();
  const { colors, spacing, radius, shadow, isDark } = useDS();
  const insets = useSafeAreaInsets();
  const fade = useRef(new Animated.Value(0)).current;
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    if (user?.role === "admin") router.replace("/dashboard/admin");
    else if (user?.role === "engineer" || user?.role === "employee")
      router.replace("/dashboard/engineer");
  }, [user]);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(
      h < 12 ? "Chào buổi sáng" : h < 18 ? "Chào buổi chiều" : "Chào buổi tối",
    );
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const go = useCallback((route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(route as any);
  }, []);

  return (
    <View
      style={[
        st.screen,
        { backgroundColor: colors.bg, paddingTop: insets.top },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: 40,
        }}
      >
        {/* Header */}
        <Animated.View style={[st.header, { opacity: fade }]}>
          <Pressable
            style={[st.backBtn, { backgroundColor: colors.bgSurface }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[st.greeting, { color: colors.textTertiary }]}>
              {greeting},
            </Text>
            <Text style={[st.userName, { color: colors.text }]}>
              {user?.name || "Người dùng"}
            </Text>
          </View>
          <Pressable
            style={[st.notifBtn, { backgroundColor: colors.bgSurface }]}
            onPress={() => router.push("/(tabs)/notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.text}
            />
            <View style={st.notifBadge}>
              <Text style={st.notifBadgeText}>3</Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* Section: Dashboards */}
        <View style={st.sectionHead}>
          <Text style={[st.sectionTitle, { color: colors.text }]}>
            Bảng điều khiển
          </Text>
          <Text style={[st.sectionSub, { color: colors.textTertiary }]}>
            Chọn workspace phù hợp với bạn
          </Text>
        </View>
        <View style={{ gap: 16 }}>
          {DASHBOARDS.map((d, i) => (
            <DashboardCard
              key={d.id}
              item={d}
              index={i}
              onPress={() => go(d.route)}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={st.sectionHead}>
          <Text style={[st.sectionTitle, { color: colors.text }]}>
            Truy cập nhanh
          </Text>
        </View>
        <View style={[st.qaGrid, { gap: spacing.sm }]}>
          {QUICK_ACTIONS.map((item) => (
            <Pressable
              key={item.id}
              style={[st.qa, { width: (SW - 40 - 24) / 3 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(item.route as any);
              }}
            >
              <View
                style={[
                  st.qaIcon,
                  {
                    backgroundColor: item.color + "15",
                    borderRadius: radius.lg,
                  },
                ]}
              >
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={[st.qaLabel, { color: colors.textSecondary }]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={st.sectionHead}>
          <Text style={[st.sectionTitle, { color: colors.text }]}>
            Hoạt động gần đây
          </Text>
          <Pressable>
            <Text style={[st.seeAll, { color: colors.primary }]}>
              Xem tất cả
            </Text>
          </Pressable>
        </View>
        <View
          style={[
            st.activityBox,
            shadow.xs,
            {
              backgroundColor: colors.bgSurface,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          {RECENT.map((a, i) => (
            <View
              key={a.id}
              style={[
                st.actItem,
                i < RECENT.length - 1 && {
                  borderBottomColor: colors.divider,
                  borderBottomWidth: 1,
                },
              ]}
            >
              <View
                style={[
                  st.actIcon,
                  { backgroundColor: colors.bgMuted, borderRadius: radius.md },
                ]}
              >
                <Ionicons name={a.icon} size={18} color={colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[st.actTitle, { color: colors.text }]}>
                  {a.title}
                </Text>
                <Text style={[st.actTime, { color: colors.textTertiary }]}>
                  {a.time}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textTertiary}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: { fontSize: 13, fontWeight: "500" },
  userName: { fontSize: 18, fontWeight: "700", marginTop: 2 },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  notifBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  sectionHead: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  sectionSub: { fontSize: 14, marginTop: 4, width: "100%" },
  seeAll: { fontSize: 14, fontWeight: "600" },

  // Cards
  cardWrap: { width: "100%" },
  dashCard: {
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
    minHeight: 160,
  },
  decor1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  decor2: {
    position: "absolute",
    bottom: -40,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  cardDesc: { fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 20 },
  cardStats: { flexDirection: "row", marginTop: 16, gap: 24 },
  statVal: { fontSize: 24, fontWeight: "700", color: "#fff" },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    textTransform: "capitalize",
    marginTop: 2,
  },

  // Quick Actions
  qaGrid: { flexDirection: "row", flexWrap: "wrap" },
  qa: { alignItems: "center", paddingVertical: 16 },
  qaIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  qaLabel: { fontSize: 12, fontWeight: "500", textAlign: "center" },

  // Activity
  activityBox: { borderWidth: 1, overflow: "hidden" },
  actItem: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  actIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  actTitle: { fontSize: 14, fontWeight: "500" },
  actTime: { fontSize: 12, marginTop: 2 },
});

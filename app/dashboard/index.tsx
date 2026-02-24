/**
 * Dashboard Index - Modern Role-based Dashboard
 * Minimalist design with glass morphism and animations
 * @route /dashboard/index
 */

import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Dashboard configurations by role
const DASHBOARD_CONFIGS = [
  {
    id: "admin",
    title: "Admin Hub",
    titleVi: "Trung tâm Admin",
    desc: "Quản lý hệ thống, người dùng, báo cáo",
    icon: "shield-checkmark",
    route: "/dashboard/admin",
    gradient: ["#1a1a2e", "#16213e"],
    stats: { users: 128, reports: 45 },
    roles: ["admin"],
  },
  {
    id: "engineer",
    title: "Engineer Hub",
    titleVi: "Trung tâm Kỹ sư",
    desc: "Dự án, tiến độ, chất lượng công trình",
    icon: "construct",
    route: "/dashboard/engineer",
    gradient: ["#0f3460", "#16213e"],
    stats: { projects: 12, tasks: 67 },
    roles: ["engineer", "employee"],
  },
  {
    id: "client",
    title: "Client Hub",
    titleVi: "Trung tâm Khách hàng",
    desc: "Theo dõi dự án, thanh toán, hỗ trợ",
    icon: "home",
    route: "/dashboard/client",
    gradient: ["#1a1a2e", "#0f3460"],
    stats: { active: 3, pending: 2 },
    roles: ["user", "client"],
  },
];

const QUICK_ACTIONS = [
  {
    id: "projects",
    icon: "folder",
    label: "Dự án",
    route: "/(tabs)/projects",
    color: "#6366f1",
  },
  {
    id: "reports",
    icon: "bar-chart",
    label: "Báo cáo",
    route: "/reports/index",
    color: "#14B8A6",
  },
  {
    id: "timeline",
    icon: "time",
    label: "Timeline",
    route: "/timeline/index",
    color: "#f59e0b",
  },
  {
    id: "budget",
    icon: "wallet",
    label: "Ngân sách",
    route: "/budget/index",
    color: "#10b981",
  },
  {
    id: "tasks",
    icon: "checkbox",
    label: "Nhiệm vụ",
    route: "/tasks",
    color: "#8b5cf6",
  },
  {
    id: "team",
    icon: "people",
    label: "Nhóm",
    route: "/team",
    color: "#ec4899",
  },
];

const RECENT_ACTIVITY = [
  {
    id: "1",
    type: "project",
    title: "Dự án Alpha cập nhật",
    time: "5 phút trước",
    icon: "folder",
  },
  {
    id: "2",
    type: "task",
    title: "Hoàn thành task #234",
    time: "15 phút trước",
    icon: "checkmark-circle",
  },
  {
    id: "3",
    type: "message",
    title: "Tin nhắn mới từ đội dự án",
    time: "1 giờ trước",
    icon: "chatbubble",
  },
];

// Animated Card Component
const DashboardCard = ({
  item,
  index,
  onPress,
}: {
  item: (typeof DASHBOARD_CONFIGS)[0];
  index: number;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: scaleAnim,
          transform: [
            { scale: Animated.multiply(scaleAnim, pressAnim) },
            {
              translateY: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.cardTouchable}
      >
        <LinearGradient
          colors={item.gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.dashboardCard}
        >
          {/* Decorative circles */}
          <View style={styles.cardDecor1} />
          <View style={styles.cardDecor2} />

          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrap}>
              <Ionicons name={item.icon as any} size={28} color="#fff" />
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{item.titleVi}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </View>

          <View style={styles.cardStats}>
            {Object.entries(item.stats).map(([key, value]) => (
              <View key={key} style={styles.statItem}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{key}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Quick Action Button
const QuickActionButton = ({
  item,
  index,
}: {
  item: (typeof QUICK_ACTIONS)[0];
  index: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: 300 + index * 50,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(item.route as any);
  }, [item.route]);

  return (
    <Animated.View
      style={[
        styles.quickActionWrap,
        {
          opacity: scaleAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.quickAction}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View
          style={[styles.quickIconWrap, { backgroundColor: item.color + "15" }]}
        >
          <Ionicons name={item.icon as any} size={22} color={item.color} />
        </View>
        <Text style={styles.quickLabel}>{item.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function DashboardIndexScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [greeting, setGreeting] = useState("");

  // Auto-redirect based on user role
  useEffect(() => {
    if (user?.role === "admin") {
      router.replace("/dashboard/admin");
    } else if (user?.role === "engineer" || user?.role === "employee") {
      router.replace("/dashboard/engineer");
    }
  }, [user]);

  // Greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Chào buổi sáng");
    else if (hour < 18) setGreeting("Chào buổi chiều");
    else setGreeting("Chào buổi tối");

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDashboardPress = useCallback((route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(route as any);
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={["top"]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: surfaceColor }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={textColor} />
          </TouchableOpacity>

          <View style={styles.headerTextWrap}>
            <Text style={[styles.greeting, { color: textColor + "80" }]}>
              {greeting},
            </Text>
            <Text style={[styles.userName, { color: textColor }]}>
              {user?.name || "Người dùng"}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.notifButton, { backgroundColor: surfaceColor }]}
            onPress={() => router.push("/(tabs)/notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={textColor}
            />
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Bảng điều khiển
          </Text>
          <Text style={[styles.sectionSubtitle, { color: textColor + "60" }]}>
            Chọn workspace phù hợp với bạn
          </Text>
        </View>

        {/* Dashboard Cards */}
        <View style={styles.cardsContainer}>
          {DASHBOARD_CONFIGS.map((item, index) => (
            <DashboardCard
              key={item.id}
              item={item}
              index={index}
              onPress={() => handleDashboardPress(item.route)}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Truy cập nhanh
          </Text>
        </View>

        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((item, index) => (
            <QuickActionButton key={item.id} item={item} index={index} />
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Hoạt động gần đây
          </Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.activityContainer,
            { backgroundColor: surfaceColor, borderColor },
          ]}
        >
          {RECENT_ACTIVITY.map((activity, index) => (
            <View
              key={activity.id}
              style={[
                styles.activityItem,
                index < RECENT_ACTIVITY.length - 1 && {
                  borderBottomColor: borderColor,
                  borderBottomWidth: 1,
                },
              ]}
            >
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: isDark ? "#374151" : "#f3f4f6" },
                ]}
              >
                <Ionicons
                  name={activity.icon as any}
                  size={18}
                  color={textColor}
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: textColor }]}>
                  {activity.title}
                </Text>
                <Text
                  style={[styles.activityTime, { color: textColor + "60" }]}
                >
                  {activity.time}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={textColor + "40"}
              />
            </View>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  greeting: {
    fontSize: 13,
    fontWeight: "500",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  notifButton: {
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
  notifBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 28,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: 4,
    width: "100%",
  },
  seeAll: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "600",
  },
  cardsContainer: {
    gap: 16,
  },
  cardWrapper: {
    width: "100%",
  },
  cardTouchable: {
    width: "100%",
  },
  dashboardCard: {
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
    minHeight: 160,
  },
  cardDecor1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  cardDecor2: {
    position: "absolute",
    bottom: -40,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    marginTop: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 20,
  },
  cardStats: {
    flexDirection: "row",
    marginTop: 16,
    gap: 24,
  },
  statItem: {
    alignItems: "flex-start",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    textTransform: "capitalize",
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionWrap: {
    width: (SCREEN_WIDTH - 40 - 24) / 3,
  },
  quickAction: {
    alignItems: "center",
    paddingVertical: 16,
  },
  quickIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
    textAlign: "center",
  },
  activityContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  activityTime: {
    fontSize: 12,
    marginTop: 2,
  },
  bottomPadding: {
    height: 40,
  },
});

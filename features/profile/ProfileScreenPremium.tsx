/**
 * ProfileScreenPremium - Luxury Modern Profile Tab
 * Premium glassmorphism UI, animated hero header, parallax scroll,
 * BE data integration via profileService
 * @created 2026-02-06
 */

import { useAuth } from "@/features/auth";
import profileService, {
    getProfileCompletion,
    getRoleDisplayName,
    isUserVerified,
    UserProfile,
    UserStats,
} from "@/services/profileService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, router } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActionSheetIOS,
    Alert,
    Animated,
    Dimensions,
    Easing,
    Image,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from "react-native";

const { width: SW } = Dimensions.get("window");
const STATUS_H = StatusBar.currentHeight ?? 44;
const HEADER_H = 300;
const AVATAR_SZ = 100;

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const T = {
  // Premium palette
  gold: "#D4AF37",
  goldLight: "#F5E6B8",
  goldDark: "#B8860B",
  primary: "#0D9488",
  primaryLight: "#CCFBF1",
  accent: "#8B5CF6",
  accentLight: "#F5F3FF",
  success: "#10B981",
  successLight: "#D1FAE5",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  cyan: "#06B6D4",
  cyanLight: "#CFFAFE",
  rose: "#EC4899",
  roseLight: "#FCE7F3",
  teal: "#14B8A6",

  white: "#FFFFFF",
  bg: "#F8FAFC",
  bgDark: "#0F172A",
  surface: "#FFFFFF",
  surfaceDark: "#1E293B",
  text: "#0F172A",
  textDark: "#F1F5F9",
  textSec: "#64748B",
  textSecDark: "#94A3B8",
  border: "#E2E8F0",
  borderDark: "#334155",

  // Spacing
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  // Radius
  rSm: 8,
  rMd: 12,
  rLg: 16,
  rXl: 20,
  rFull: 999,

  // Shadow
  shadow: Platform.select({
    ios: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 3 },
  }),
  shadowMd: Platform.select({
    ios: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
    },
    android: { elevation: 6 },
  }),
  shadowLg: Platform.select({
    ios: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
    },
    android: { elevation: 10 },
  }),
};

// ============================================================================
// HOOKS
// ============================================================================
const useEntranceAnim = (delay = 0) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    const a = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]);
    a.start();
    return () => a.stop();
  }, [delay, opacity, translateY]);
  return { opacity, transform: [{ translateY }] };
};

// ============================================================================
// MENU CONFIGURATION
// ============================================================================
interface MenuItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  route?: string;
  action?: string; // action identifier
  badge?: number;
  color: string;
  bgColor: string;
}

interface MenuSection {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    id: "account",
    title: "Tài khoản",
    icon: "person-circle-outline",
    items: [
      {
        id: "edit",
        icon: "create-outline",
        title: "Chỉnh sửa hồ sơ",
        subtitle: "Tên, ảnh, thông tin cá nhân",
        route: "/profile/edit",
        color: T.primary,
        bgColor: T.primaryLight,
      },
      {
        id: "security",
        icon: "shield-checkmark-outline",
        title: "Bảo mật & Quyền riêng tư",
        subtitle: "Mật khẩu, 2FA, quyền truy cập",
        route: "/profile/security",
        color: T.accent,
        bgColor: T.accentLight,
      },
      {
        id: "addresses",
        icon: "location-outline",
        title: "Địa chỉ",
        subtitle: "Quản lý địa chỉ giao hàng",
        route: "/profile/addresses",
        color: T.success,
        bgColor: T.successLight,
      },
      {
        id: "payment",
        icon: "card-outline",
        title: "Thanh toán",
        subtitle: "Ví, thẻ, lịch sử thanh toán",
        route: "/profile/payment",
        color: T.warning,
        bgColor: T.warningLight,
      },
    ],
  },
  {
    id: "workspace",
    title: "Công việc",
    icon: "briefcase-outline",
    items: [
      {
        id: "projects",
        icon: "folder-open-outline",
        title: "Dự án của tôi",
        route: "/projects",
        color: T.primary,
        bgColor: T.primaryLight,
      },
      {
        id: "tasks",
        icon: "checkbox-outline",
        title: "Công việc & Tiến độ",
        route: "/tasks",
        color: T.cyan,
        bgColor: T.cyanLight,
      },
      {
        id: "orders",
        icon: "receipt-outline",
        title: "Đơn hàng",
        route: "/orders",
        color: T.warning,
        bgColor: T.warningLight,
      },
      {
        id: "contracts",
        icon: "document-text-outline",
        title: "Hợp đồng",
        route: "/contracts",
        color: T.accent,
        bgColor: T.accentLight,
      },
    ],
  },
  {
    id: "engagement",
    title: "Cá nhân",
    icon: "heart-outline",
    items: [
      {
        id: "favorites",
        icon: "heart-outline",
        title: "Đã lưu",
        route: "/favorites",
        color: T.danger,
        bgColor: T.dangerLight,
      },
      {
        id: "history",
        icon: "time-outline",
        title: "Lịch sử xem",
        route: "/profile/history",
        color: T.textSec,
        bgColor: "#F1F5F9",
      },
      {
        id: "reviews",
        icon: "star-outline",
        title: "Đánh giá của tôi",
        route: "/profile/reviews",
        color: "#EAB308",
        bgColor: "#FEF9C3",
      },
      {
        id: "points",
        icon: "diamond-outline",
        title: "Điểm thưởng",
        subtitle: "Tích lũy & đổi ưu đãi",
        route: "/profile/rewards",
        color: T.rose,
        bgColor: T.roseLight,
      },
    ],
  },
  {
    id: "support",
    title: "Hỗ trợ",
    icon: "help-circle-outline",
    items: [
      {
        id: "help",
        icon: "chatbubble-ellipses-outline",
        title: "Trợ giúp & Chat hỗ trợ",
        route: "/customer-support",
        color: T.primary,
        bgColor: T.primaryLight,
      },
      {
        id: "feedback",
        icon: "megaphone-outline",
        title: "Góp ý & Phản hồi",
        route: "/feedback",
        color: T.success,
        bgColor: T.successLight,
      },
      {
        id: "about",
        icon: "information-circle-outline",
        title: "Về ứng dụng",
        route: "/about",
        color: T.textSec,
        bgColor: "#F1F5F9",
      },
      {
        id: "terms",
        icon: "document-outline",
        title: "Điều khoản dịch vụ",
        route: "/terms",
        color: T.textSec,
        bgColor: "#F1F5F9",
      },
    ],
  },
];

const QUICK_ACTIONS = [
  {
    id: "messages",
    icon: "chatbubbles" as const,
    label: "Tin nhắn",
    color: "#0D9488",
    bgColor: "#CCFBF1",
    route: "/messages",
  },
  {
    id: "calls",
    icon: "call" as const,
    label: "Cuộc gọi",
    color: "#10B981",
    bgColor: "#D1FAE5",
    route: "/call/history",
  },
  {
    id: "contacts",
    icon: "people" as const,
    label: "Danh bạ",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    route: "/contacts",
  },
  {
    id: "calendar",
    icon: "calendar" as const,
    label: "Lịch hẹn",
    color: "#F59E0B",
    bgColor: "#FEF3C7",
    route: "/booking",
  },
  {
    id: "ai",
    icon: "sparkles" as const,
    label: "AI Trợ lý",
    color: "#EC4899",
    bgColor: "#FCE7F3",
    route: "/ai-hub",
  },
  {
    id: "settings",
    icon: "settings" as const,
    label: "Cài đặt",
    color: "#64748B",
    bgColor: "#F1F5F9",
    route: "/profile/settings",
  },
];

// ============================================================================
// SKELETON LOADING
// ============================================================================
const SkeletonPulse = memo(
  ({
    width,
    height,
    radius = 8,
    style,
  }: {
    width: number | string;
    height: number;
    radius?: number;
    style?: any;
  }) => {
    const pulse = useRef(new Animated.Value(0.3)).current;
    useEffect(() => {
      const a = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      a.start();
      return () => a.stop();
    }, [pulse]);
    return (
      <Animated.View
        style={[
          {
            width: width as any,
            height,
            borderRadius: radius,
            backgroundColor: "#E2E8F0",
            opacity: pulse,
          },
          style,
        ]}
      />
    );
  },
);

const ProfileSkeleton = memo(() => (
  <View style={{ flex: 1, backgroundColor: T.bg }}>
    <LinearGradient
      colors={["#1E3A5F", "#0D9488", "#0D9488"]}
      style={{
        height: HEADER_H,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SkeletonPulse
        width={AVATAR_SZ}
        height={AVATAR_SZ}
        radius={AVATAR_SZ / 2}
        style={{ marginTop: 40 }}
      />
      <SkeletonPulse
        width={160}
        height={20}
        radius={10}
        style={{ marginTop: 16 }}
      />
      <SkeletonPulse
        width={200}
        height={14}
        radius={7}
        style={{ marginTop: 8 }}
      />
    </LinearGradient>
    <View
      style={{
        flexDirection: "row",
        marginHorizontal: 16,
        marginTop: -28,
        gap: 10,
      }}
    >
      {[1, 2, 3].map((i) => (
        <SkeletonPulse key={i} width={(SW - 52) / 3} height={80} radius={16} />
      ))}
    </View>
    <View style={{ margin: 16, gap: 12 }}>
      {[1, 2, 3, 4].map((i) => (
        <SkeletonPulse key={i} width="100%" height={56} radius={12} />
      ))}
    </View>
  </View>
));

// ============================================================================
// STAT CARD
// ============================================================================
const StatCard = memo(
  ({
    icon,
    value,
    label,
    color,
    bgColor,
    delay,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    value: number | string;
    label: string;
    color: string;
    bgColor: string;
    delay: number;
  }) => {
    const anim = useEntranceAnim(delay);
    return (
      <Animated.View style={[statStyles.card, anim]}>
        <View style={[statStyles.iconWrap, { backgroundColor: bgColor }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={statStyles.value}>{value}</Text>
        <Text style={statStyles.label}>{label}</Text>
      </Animated.View>
    );
  },
);

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: T.white,
    borderRadius: T.rLg,
    padding: T.md,
    alignItems: "center",
    ...T.shadowMd,
  } as any,
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  value: { fontSize: 18, fontWeight: "800", color: T.text },
  label: { fontSize: 10, color: T.textSec, marginTop: 2, fontWeight: "500" },
});

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function ProfileScreenPremium() {
  const { user, signOut, isAuthenticated, updateAvatar } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalProjects: 0,
    completedProjects: 0,
    inProgressProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalOrders: 0,
    savedItems: 0,
    totalViews: 0,
    monthlyGrowth: 0,
  });
  const [notifCount, setNotifCount] = useState(0);

  // Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  const c = useMemo(
    () => ({
      bg: isDark ? T.bgDark : T.bg,
      surface: isDark ? T.surfaceDark : T.surface,
      text: isDark ? T.textDark : T.text,
      textSec: isDark ? T.textSecDark : T.textSec,
      border: isDark ? T.borderDark : T.border,
      gradStart: isDark ? "#0F172A" : "#1E3A5F",
      gradMid: isDark ? "#1E3A5F" : "#0D9488",
      gradEnd: isDark ? "#0D9488" : "#0D9488",
    }),
    [isDark],
  );

  // Animated ring rotation
  useEffect(() => {
    const a = Animated.loop(
      Animated.timing(ringAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      }),
    );
    a.start();
    return () => a.stop();
  }, [ringAnim]);

  const ringRotate = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Parallax header
  const headerTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_H],
    outputRange: [0, -HEADER_H / 3],
    extrapolate: "clamp",
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_H / 2],
    outputRange: [1, 0.3],
    extrapolate: "clamp",
  });

  // ======================== Data Fetch ========================
  const fetchData = useCallback(async () => {
    try {
      const [profileData, statsData, notifications, favorites, orders] =
        await Promise.all([
          profileService.getProfile(),
          profileService.getUserStats(),
          profileService.getUserNotifications(),
          profileService.getUserFavorites(),
          profileService.getUserOrders(),
        ]);
      if (profileData) setProfile(profileData);
      setStats({
        ...statsData,
        savedItems: favorites.length,
        totalOrders: orders.length,
      });
      setNotifCount(notifications.length);
    } catch (err) {
      console.warn("[ProfilePremium] fetch error:", err);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [isAuthenticated, fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // ======================== Handlers ========================
  const handleSignOut = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const handleAvatarPress = () => {
    const options = ["Hủy", "Chụp ảnh", "Chọn từ thư viện", "Xóa ảnh"];
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
          title: "Thay đổi ảnh đại diện",
        },
        (idx) => {
          if (idx === 1 || idx === 2)
            Alert.alert("Thông báo", "Tính năng đang phát triển");
          else if (idx === 3) handleDeleteAvatar();
        },
      );
    } else {
      Alert.alert("Ảnh đại diện", "Chọn phương thức", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Chụp ảnh",
          onPress: () => Alert.alert("Thông báo", "Đang phát triển"),
        },
        {
          text: "Chọn thư viện",
          onPress: () => Alert.alert("Thông báo", "Đang phát triển"),
        },
        { text: "Xóa ảnh", style: "destructive", onPress: handleDeleteAvatar },
      ]);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await profileService.deleteAvatar();
      await updateAvatar("");
      Alert.alert("Thành công", "Đã xóa ảnh đại diện");
    } catch {
      Alert.alert("Lỗi", "Không thể xóa ảnh");
    }
  };

  const handleMenuPress = (item: MenuItem) => {
    if (item.route) router.push(item.route as Href);
  };

  // ======================== Guest ========================
  if (!isAuthenticated) {
    return (
      <View style={[s.container, { backgroundColor: c.bg }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <LinearGradient
          colors={[c.gradStart, c.gradMid, c.gradEnd]}
          style={s.guestGradient}
        >
          <View style={s.guestRing}>
            <Ionicons name="person" size={60} color="rgba(255,255,255,0.9)" />
          </View>
          <Text style={s.guestTitle}>Chào mừng bạn!</Text>
          <Text style={s.guestSub}>Đăng nhập để khám phá đầy đủ tính năng</Text>
          <TouchableOpacity
            style={s.guestLoginBtn}
            onPress={() => router.push("/(auth)/login" as Href)}
          >
            <Text style={s.guestLoginText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.guestRegBtn}
            onPress={() => router.push("/(auth)/register" as Href)}
          >
            <Text style={s.guestRegText}>Tạo tài khoản mới</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // ======================== Loading ========================
  if (loading) return <ProfileSkeleton />;

  // ======================== Profile Data ========================
  const dp = profile || {
    id: user?.id || 0,
    email: user?.email || "",
    name: user?.name || user?.email?.split("@")[0] || "Người dùng",
    avatar: user?.avatar,
    role: (user?.role || "CLIENT") as UserProfile["role"],
    createdAt: "",
    updatedAt: "",
  };
  const completion = getProfileCompletion(profile);
  const roleName = getRoleDisplayName(dp.role);
  const verified = isUserVerified(profile);

  // ======================== Render ========================
  return (
    <View style={[s.container, { backgroundColor: c.bg }]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
            colors={["#fff"]}
            progressViewOffset={HEADER_H / 2}
          />
        }
      >
        {/* ==================== HERO HEADER ==================== */}
        <Animated.View
          style={{
            transform: [{ translateY: headerTranslate }],
            opacity: headerOpacity,
          }}
        >
          <LinearGradient
            colors={[c.gradStart, c.gradMid, c.gradEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.header}
          >
            {/* Decorative circles */}
            <View style={s.decCircle1} />
            <View style={s.decCircle2} />

            {/* Top actions */}
            <View style={s.headerActions}>
              <TouchableOpacity
                style={s.headerBtn}
                onPress={() => router.push("/crm-notifications" as Href)}
              >
                <Ionicons name="notifications-outline" size={20} color="#fff" />
                {notifCount > 0 && (
                  <View style={s.notifBadge}>
                    <Text style={s.notifBadgeText}>
                      {notifCount > 99 ? "99+" : notifCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={s.headerBtn}
                onPress={() => router.push("/profile/qr-code" as Href)}
              >
                <Ionicons name="qr-code-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={s.headerBtn}
                onPress={() => router.push("/profile/settings" as Href)}
              >
                <Ionicons name="settings-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Avatar with animated ring */}
            <View style={s.avatarContainer}>
              <Animated.View
                style={[s.avatarRing, { transform: [{ rotate: ringRotate }] }]}
              >
                <LinearGradient
                  colors={[T.gold, T.goldLight, T.gold, T.goldDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.avatarRingGradient}
                />
              </Animated.View>
              <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
                {dp.avatar ? (
                  <Image source={{ uri: dp.avatar }} style={s.avatar} />
                ) : (
                  <LinearGradient
                    colors={["#0D9488", "#0F766E"]}
                    style={s.avatar}
                  >
                    <Text style={s.avatarLetter}>
                      {dp.name[0]?.toUpperCase()}
                    </Text>
                  </LinearGradient>
                )}
                <View style={s.cameraIcon}>
                  <Ionicons name="camera" size={12} color="#fff" />
                </View>
                {verified && (
                  <View style={s.verifiedBadge}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Name & Role */}
            <Text style={s.userName}>{dp.name}</Text>
            <Text style={s.userEmail}>{dp.email}</Text>
            <View style={s.rolePill}>
              <MaterialCommunityIcons name="crown" size={13} color={T.gold} />
              <Text style={s.roleText}>{roleName}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ==================== STATS ROW ==================== */}
        <View style={s.statsRow}>
          <StatCard
            icon="folder-open-outline"
            value={stats.totalProjects}
            label="Dự án"
            color={T.primary}
            bgColor={T.primaryLight}
            delay={100}
          />
          <StatCard
            icon="checkmark-done-outline"
            value={stats.completedProjects}
            label="Hoàn thành"
            color={T.success}
            bgColor={T.successLight}
            delay={200}
          />
          <StatCard
            icon="cart-outline"
            value={stats.totalOrders}
            label="Đơn hàng"
            color={T.warning}
            bgColor={T.warningLight}
            delay={300}
          />
        </View>

        {/* ==================== PROFILE COMPLETION ==================== */}
        {completion < 100 && (
          <TouchableOpacity
            style={[s.completionCard, { backgroundColor: c.surface }]}
            onPress={() => router.push("/profile/edit" as Href)}
            activeOpacity={0.8}
          >
            <View style={s.completionTop}>
              <View style={{ flex: 1 }}>
                <Text style={[s.completionTitle, { color: c.text }]}>
                  Hoàn thiện hồ sơ
                </Text>
                <Text style={[s.completionSub, { color: c.textSec }]}>
                  Hồ sơ đầy đủ giúp tăng uy tín
                </Text>
              </View>
              <View style={s.completionCircle}>
                <Text style={s.completionPct}>{completion}%</Text>
              </View>
            </View>
            <View style={[s.completionBarBg, { backgroundColor: c.border }]}>
              <LinearGradient
                colors={["#0D9488", "#8B5CF6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[s.completionBarFill, { width: `${completion}%` }]}
              />
            </View>
            <View style={s.completionCta}>
              <Text style={s.completionCtaText}>Hoàn thiện ngay</Text>
              <Ionicons name="arrow-forward" size={14} color={T.primary} />
            </View>
          </TouchableOpacity>
        )}

        {/* ==================== QUICK ACTIONS ==================== */}
        <View style={[s.qaCard, { backgroundColor: c.surface }]}>
          <Text style={[s.qaTitle, { color: c.text }]}>Truy cập nhanh</Text>
          <View style={s.qaGrid}>
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={s.qaItem}
                onPress={() => router.push(a.route as Href)}
                activeOpacity={0.7}
              >
                <View style={[s.qaIcon, { backgroundColor: a.bgColor }]}>
                  <Ionicons name={a.icon} size={22} color={a.color} />
                  {a.id === "messages" && notifCount > 0 && (
                    <View style={s.qaBadge}>
                      <Text style={s.qaBadgeText}>
                        {notifCount > 9 ? "9+" : notifCount}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[s.qaLabel, { color: c.text }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ==================== MENU SECTIONS ==================== */}
        {MENU_SECTIONS.map((section, sIdx) => (
          <View
            key={section.id}
            style={[s.menuCard, { backgroundColor: c.surface }]}
          >
            <View style={s.menuHeader}>
              <Ionicons name={section.icon} size={16} color={T.primary} />
              <Text style={[s.menuHeaderText, { color: c.text }]}>
                {section.title}
              </Text>
            </View>
            {section.items.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  s.menuItem,
                  idx < section.items.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: c.border,
                  },
                ]}
                onPress={() => handleMenuPress(item)}
                activeOpacity={0.6}
              >
                <View
                  style={[s.menuIconWrap, { backgroundColor: item.bgColor }]}
                >
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <View style={s.menuContent}>
                  <Text style={[s.menuTitle, { color: c.text }]}>
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text style={[s.menuSub, { color: c.textSec }]}>
                      {item.subtitle}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={c.textSec} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* ==================== SIGN OUT ==================== */}
        <TouchableOpacity
          style={[s.signOutBtn, { backgroundColor: c.surface }]}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={T.danger} />
          <Text style={s.signOutText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={[s.version, { color: c.textSec }]}>
          Phiên bản 2.0.0 • Build 2026.02.06
        </Text>
        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const s = StyleSheet.create({
  container: { flex: 1 },

  // ====== GUEST ======
  guestGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: T.xxxl,
  },
  guestRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: T.xxl,
  },
  guestTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: T.sm,
  },
  guestSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: T.xxxl,
    lineHeight: 20,
  },
  guestLoginBtn: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 56,
    borderRadius: T.rFull,
    marginBottom: T.md,
  },
  guestLoginText: { color: "#0D9488", fontSize: 16, fontWeight: "700" },
  guestRegBtn: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: T.rFull,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  guestRegText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  // ====== HEADER ======
  header: {
    height: HEADER_H,
    paddingTop: STATUS_H + T.sm,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  decCircle1: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  decCircle2: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  headerActions: {
    flexDirection: "row",
    alignSelf: "flex-end",
    paddingHorizontal: T.lg,
    marginBottom: T.md,
    gap: T.sm,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: T.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "rgba(37,99,235,1)",
  },
  notifBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },

  // ====== AVATAR ======
  avatarContainer: { position: "relative", marginBottom: T.md },
  avatarRing: {
    position: "absolute",
    top: -6,
    left: -6,
    width: AVATAR_SZ + 12,
    height: AVATAR_SZ + 12,
    borderRadius: (AVATAR_SZ + 12) / 2,
    overflow: "hidden",
  },
  avatarRingGradient: {
    width: "100%",
    height: "100%",
    borderRadius: (AVATAR_SZ + 12) / 2,
  },
  avatar: {
    width: AVATAR_SZ,
    height: AVATAR_SZ,
    borderRadius: AVATAR_SZ / 2,
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
  },
  avatarLetter: { fontSize: 38, fontWeight: "700", color: "#fff" },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: T.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#fff",
  },
  verifiedBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: T.success,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  // ====== NAME ======
  userName: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 2 },
  userEmail: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginBottom: T.sm,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: T.rFull,
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
  },
  roleText: { color: T.goldLight, fontSize: 12, fontWeight: "700" },

  // ====== STATS ======
  statsRow: {
    flexDirection: "row",
    marginHorizontal: T.lg,
    marginTop: -28,
    gap: 10,
  },

  // ====== COMPLETION ======
  completionCard: {
    marginHorizontal: T.lg,
    marginTop: T.lg,
    borderRadius: T.rLg,
    padding: T.lg,
    ...T.shadow,
  } as any,
  completionTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: T.md,
  },
  completionTitle: { fontSize: 15, fontWeight: "700" },
  completionSub: { fontSize: 11, marginTop: 2 },
  completionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: T.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  completionPct: { fontSize: 13, fontWeight: "800", color: T.primary },
  completionBarBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  completionBarFill: { height: "100%", borderRadius: 3 },
  completionCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: T.md,
    gap: 4,
  },
  completionCtaText: { fontSize: 13, fontWeight: "600", color: T.primary },

  // ====== QUICK ACTIONS ======
  qaCard: {
    marginHorizontal: T.lg,
    marginTop: T.lg,
    borderRadius: T.rLg,
    padding: T.lg,
    ...T.shadow,
  } as any,
  qaTitle: { fontSize: 14, fontWeight: "700", marginBottom: T.md },
  qaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 0 },
  qaItem: { width: "33.33%", alignItems: "center", paddingVertical: T.sm },
  qaIcon: {
    width: 48,
    height: 48,
    borderRadius: T.rFull,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    position: "relative",
  },
  qaLabel: { fontSize: 11, fontWeight: "600" },
  qaBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: T.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  qaBadgeText: { color: "#fff", fontSize: 8, fontWeight: "800" },

  // ====== MENU SECTIONS ======
  menuCard: {
    marginHorizontal: T.lg,
    marginTop: T.lg,
    borderRadius: T.rLg,
    overflow: "hidden",
    ...T.shadow,
  } as any,
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: T.lg,
    paddingTop: T.lg,
    paddingBottom: T.sm,
  },
  menuHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: T.lg,
    paddingVertical: 14,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: T.rMd,
    alignItems: "center",
    justifyContent: "center",
    marginRight: T.md,
  },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 14, fontWeight: "600" },
  menuSub: { fontSize: 11, marginTop: 1 },

  // ====== SIGN OUT ======
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: T.lg,
    marginTop: T.xl,
    borderRadius: T.rLg,
    padding: T.lg,
    gap: T.sm,
    borderWidth: 1,
    borderColor: T.dangerLight,
    ...T.shadow,
  } as any,
  signOutText: { fontSize: 15, fontWeight: "700", color: T.danger },

  // ====== VERSION ======
  version: {
    textAlign: "center",
    fontSize: 11,
    marginTop: T.lg,
    marginBottom: T.sm,
  },
});

/**
 * Profile Screen - Redesigned with proper BE integration
 * Uses correct API routes from baotienweb.cloud
 * @updated 2026-01-30
 *
 * BE Routes used:
 * - GET  /auth/me      → Get current user
 * - GET  /profile      → Get profile details
 * - PATCH /profile     → Update profile
 * - GET  /projects     → Get user projects (for stats)
 * - GET  /tasks        → Get user tasks (for stats)
 * - GET  /notifications → Get notifications count
 */

import { MODERN_COLORS } from "@/constants/modern-theme";
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
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_HEIGHT = 260;
const AVATAR_SIZE = 100;

// ============================================
// Menu Items Configuration
// ============================================
interface MenuItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  route?: string;
  action?: () => void;
  badge?: number;
  color?: string;
}

type MenuSection = MenuItem[];

const MENU_SECTIONS: Record<string, MenuSection> = {
  account: [
    {
      id: "edit",
      icon: "person-outline",
      title: "Chỉnh sửa thông tin",
      route: "/profile/edit",
    },
    {
      id: "security",
      icon: "shield-checkmark-outline",
      title: "Bảo mật",
      subtitle: "Mật khẩu, 2FA",
      route: "/profile/security",
    },
    {
      id: "notifications",
      icon: "notifications-outline",
      title: "Thông báo",
      route: "/notifications",
    },
    {
      id: "privacy",
      icon: "lock-closed-outline",
      title: "Quyền riêng tư",
      route: "/profile/privacy",
    },
  ],
  features: [
    {
      id: "projects",
      icon: "briefcase-outline",
      title: "Dự án của tôi",
      route: "/projects",
    },
    {
      id: "tasks",
      icon: "checkbox-outline",
      title: "Công việc",
      route: "/tasks",
    },
    {
      id: "favorites",
      icon: "heart-outline",
      title: "Đã lưu",
      route: "/favorites",
    },
    {
      id: "history",
      icon: "time-outline",
      title: "Lịch sử xem",
      route: "/profile/history",
    },
  ],
  support: [
    {
      id: "help",
      icon: "help-circle-outline",
      title: "Trợ giúp",
      route: "/help",
    },
    {
      id: "feedback",
      icon: "chatbox-ellipses-outline",
      title: "Góp ý",
      route: "/feedback",
    },
    {
      id: "about",
      icon: "information-circle-outline",
      title: "Về ứng dụng",
      route: "/about",
    },
    {
      id: "terms",
      icon: "document-text-outline",
      title: "Điều khoản",
      route: "/terms",
    },
  ],
};

// ============================================
// Quick Actions Configuration
// ============================================
const QUICK_ACTIONS = [
  {
    id: "messages",
    icon: "chatbubbles",
    label: "Tin nhắn",
    color: "#0068FF",
    route: "/messages",
  },
  {
    id: "calls",
    icon: "call",
    label: "Cuộc gọi",
    color: "#00B14F",
    route: "/call/history",
  },
  {
    id: "contacts",
    icon: "people",
    label: "Danh bạ",
    color: "#8b5cf6",
    route: "/contacts",
  },
  {
    id: "settings",
    icon: "settings",
    label: "Cài đặt",
    color: "#64748b",
    route: "/profile/settings",
  },
];

export default function ProfileScreenRedesigned() {
  const { user, signOut, isAuthenticated, updateAvatar } = useAuth();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  const [notificationCount, setNotificationCount] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Colors
  const colors = useMemo(
    () => ({
      background: isDarkMode ? "#0f172a" : MODERN_COLORS.background,
      surface: isDarkMode ? "#1e293b" : MODERN_COLORS.surface,
      text: isDarkMode ? "#f1f5f9" : MODERN_COLORS.text,
      textSecondary: isDarkMode ? "#94a3b8" : MODERN_COLORS.textSecondary,
      divider: isDarkMode ? "#334155" : MODERN_COLORS.divider,
      cardBg: isDarkMode ? "#1e293b" : "#ffffff",
    }),
    [isDarkMode],
  );

  // ============================================
  // Data Fetching
  // ============================================
  const fetchProfileData = useCallback(async () => {
    try {
      // Fetch profile, stats, favorites, orders, and notifications in parallel
      const [profileData, statsData, notifications, favorites, orders] =
        await Promise.all([
          profileService.getProfile(),
          profileService.getUserStats(),
          profileService.getUserNotifications(),
          profileService.getUserFavorites(),
          profileService.getUserOrders(),
        ]);

      if (profileData) {
        setProfile(profileData);
      }

      // Merge stats with favorites and orders count
      setStats({
        ...statsData,
        savedItems: favorites.length,
        totalOrders: orders.length,
      });
      setNotificationCount(notifications.length);
    } catch (error) {
      console.error("[Profile] Error fetching data:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      await fetchProfileData();
      setIsLoading(false);

      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    };

    loadData();
  }, [isAuthenticated, fetchProfileData]);

  // ============================================
  // Handlers
  // ============================================
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const handleAvatarPress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Hủy", "Chụp ảnh", "Chọn từ thư viện", "Xóa ảnh"],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
          title: "Thay đổi ảnh đại diện",
        },
        async (index) => {
          if (index === 1) handleCameraUpload();
          else if (index === 2) handleGalleryUpload();
          else if (index === 3) handleDeleteAvatar();
        },
      );
    } else {
      Alert.alert("Thay đổi ảnh đại diện", "Chọn phương thức", [
        { text: "Hủy", style: "cancel" },
        { text: "Chụp ảnh", onPress: handleCameraUpload },
        { text: "Chọn từ thư viện", onPress: handleGalleryUpload },
        { text: "Xóa ảnh", style: "destructive", onPress: handleDeleteAvatar },
      ]);
    }
  };

  const handleCameraUpload = async () => {
    // TODO: Implement camera upload
    Alert.alert("Thông báo", "Tính năng đang phát triển");
  };

  const handleGalleryUpload = async () => {
    // TODO: Implement gallery upload
    Alert.alert("Thông báo", "Tính năng đang phát triển");
  };

  const handleDeleteAvatar = async () => {
    try {
      await profileService.deleteAvatar();
      await updateAvatar("");
      Alert.alert("Thành công", "Đã xóa ảnh đại diện");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xóa ảnh đại diện");
    }
  };

  const handleMenuPress = (item: MenuItem) => {
    if (item.action) {
      item.action();
    } else if (item.route) {
      router.push(item.route as any);
    }
  };

  // ============================================
  // Guest Mode
  // ============================================
  if (!isAuthenticated) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <View style={styles.guestContainer}>
          <LinearGradient
            colors={["#3b82f6", "#1d4ed8"]}
            style={styles.guestAvatar}
          >
            <Ionicons name="person" size={60} color="#fff" />
          </LinearGradient>
          <Text style={[styles.guestTitle, { color: colors.text }]}>
            Chưa đăng nhập
          </Text>
          <Text style={[styles.guestSubtitle, { color: colors.textSecondary }]}>
            Đăng nhập để sử dụng đầy đủ tính năng
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.registerButton, { borderColor: colors.divider }]}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={[styles.registerButtonText, { color: colors.text }]}>
              Tạo tài khoản mới
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // Loading State
  // ============================================
  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Đang tải...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // Profile Data
  // ============================================
  const displayProfile = profile || {
    id: user?.id || 0,
    email: user?.email || "",
    name: user?.name || user?.email?.split("@")[0] || "Người dùng",
    avatar: user?.avatar,
    role: (user?.role || "CLIENT") as UserProfile["role"],
    createdAt: "",
    updatedAt: "",
  };

  const profileCompletion = getProfileCompletion(profile);
  const roleName = getRoleDisplayName(displayProfile.role);
  const verified = isUserVerified(profile);

  // ============================================
  // Render
  // ============================================
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#fff"]}
            tintColor="#fff"
            progressViewOffset={100}
          />
        }
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={["#1a365d", "#2563eb", "#3b82f6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Header Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("/profile/qr-code")}
            >
              <Ionicons name="qr-code-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("/profile/settings")}
            >
              <Ionicons name="settings-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handleAvatarPress}
            activeOpacity={0.8}
          >
            {displayProfile.avatar ? (
              <Image
                source={{ uri: displayProfile.avatar }}
                style={styles.avatar}
              />
            ) : (
              <LinearGradient
                colors={["#3b82f6", "#1d4ed8"]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {displayProfile.name[0].toUpperCase()}
                </Text>
              </LinearGradient>
            )}
            <View style={styles.cameraButton}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
            {verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          {/* User Info */}
          <Text style={styles.userName}>{displayProfile.name}</Text>
          <Text style={styles.userEmail}>{displayProfile.email}</Text>

          {/* Role Badge */}
          <View style={styles.roleBadge}>
            <MaterialCommunityIcons name="account-tie" size={14} color="#fff" />
            <Text style={styles.roleText}>{roleName}</Text>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: colors.cardBg,
            },
          ]}
        >
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.totalProjects}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Dự án
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.divider }]}
          />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.totalTasks}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Công việc
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.divider }]}
          />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.completedProjects}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Hoàn thành
            </Text>
          </View>
        </Animated.View>

        {/* Profile Completion */}
        {profileCompletion < 100 && (
          <View
            style={[styles.completionCard, { backgroundColor: colors.cardBg }]}
          >
            <View style={styles.completionHeader}>
              <Text style={[styles.completionTitle, { color: colors.text }]}>
                Hoàn thiện hồ sơ
              </Text>
              <Text
                style={[
                  styles.completionPercent,
                  { color: MODERN_COLORS.primary },
                ]}
              >
                {profileCompletion}%
              </Text>
            </View>
            <View
              style={[
                styles.completionBarBg,
                { backgroundColor: colors.divider },
              ]}
            >
              <LinearGradient
                colors={["#3b82f6", "#8b5cf6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.completionBarFill,
                  { width: `${profileCompletion}%` },
                ]}
              />
            </View>
            <TouchableOpacity
              style={styles.completionButton}
              onPress={() => router.push("/profile/edit")}
            >
              <Text style={styles.completionButtonText}>Hoàn thiện ngay</Text>
              <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View
          style={[
            styles.quickActionsContainer,
            { backgroundColor: colors.cardBg },
          ]}
        >
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickAction}
              onPress={() => router.push(action.route as any)}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: action.color },
                ]}
              >
                <Ionicons name={action.icon as any} size={22} color="#fff" />
                {action.id === "messages" && notificationCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu Sections */}
        {Object.entries(MENU_SECTIONS).map(([section, items]) => (
          <Animated.View
            key={section}
            style={[
              styles.menuSection,
              {
                backgroundColor: colors.cardBg,
                opacity: fadeAnim,
              },
            ]}
          >
            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              {section === "account"
                ? "TÀI KHOẢN"
                : section === "features"
                  ? "TÍNH NĂNG"
                  : "HỖ TRỢ"}
            </Text>
            {items.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index < items.length - 1 && {
                    borderBottomColor: colors.divider,
                    borderBottomWidth: 1,
                  },
                ]}
                onPress={() => handleMenuPress(item)}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[
                      styles.menuIcon,
                      { backgroundColor: isDarkMode ? "#1e3a5f" : "#eff6ff" },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color="#3b82f6"
                    />
                  </View>
                  <View>
                    <Text style={[styles.menuTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                    {item.subtitle && (
                      <Text
                        style={[
                          styles.menuSubtitle,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {item.subtitle}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </Animated.View>
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: colors.cardBg }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.signOutText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          Phiên bản 1.0.0 • Build 2026.01.30
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },

  // Guest
  guestContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  guestAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 12,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  registerButton: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  // Header
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  // Avatar
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#fff",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  verifiedBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  // User Info
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: "100%",
  },

  // Profile Completion
  completionCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  completionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  completionPercent: {
    fontSize: 15,
    fontWeight: "700",
  },
  completionBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  completionBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  completionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 10,
  },
  completionButtonText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  // Menu Sections
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // Sign Out
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  signOutText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  // Version
  versionText: {
    textAlign: "center",
    fontSize: 12,
    marginBottom: 8,
  },
});

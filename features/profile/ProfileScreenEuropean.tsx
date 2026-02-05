/**
 * Profile Screen - Premium European Design
 * Modern gradient header, 3D card effects, achievements & QR code
 * @updated 2026-01-24
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    Modal,
    Platform,
    RefreshControl,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useUnifiedBadge } from "@/context/UnifiedBadgeContext";
import { apiFetch } from "@/services/api";
import avatarService, { AvatarUploadProgress } from "@/services/avatarService";

const { width, height } = Dimensions.get("window");

// ============================================================================
// DESIGN TOKENS - Premium European Style
// ============================================================================
const COLORS = {
  // Primary palette
  bg: "#F8FAFC",
  white: "#FFFFFF",
  primary: "#10B981",
  primaryDark: "#059669",
  primaryLight: "#34D399",
  accent: "#6366F1",
  accentLight: "#818CF8",

  // Text
  text: "#0F172A",
  textSecondary: "#64748B",
  textLight: "#94A3B8",
  textMuted: "#CBD5E1",

  // Semantic
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",

  // Surfaces
  border: "#E2E8F0",
  cardBg: "#FFFFFF",
  glass: "rgba(255,255,255,0.85)",

  // Gradients
  gradientStart: "#10B981",
  gradientMid: "#059669",
  gradientEnd: "#047857",
  gradientAccent: "#6366F1",
};

const SHADOWS = {
  small: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  large: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 12,
  },
  card3D: {
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
};

// ============================================================================
// TYPES
// ============================================================================
interface UserStats {
  totalProjects: number;
  completedProjects: number;
  totalOrders: number;
  savedItems: number;
}

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  color: string;
}

interface SocialLink {
  platform: string;
  icon: string;
  url?: string;
  color: string;
}

interface MenuItem {
  icon: string;
  title: string;
  subtitle?: string;
  route?: string;
  action?: () => void;
  color?: string;
  badge?: string | number;
  rightIcon?: string;
}

// ============================================================================
// ACHIEVEMENTS DATA
// ============================================================================
const ACHIEVEMENTS: Achievement[] = [
  {
    id: "1",
    icon: "star",
    title: "Thành viên mới",
    description: "Tạo tài khoản thành công",
    unlocked: true,
    color: "#F59E0B",
  },
  {
    id: "2",
    icon: "shield-checkmark",
    title: "Bảo mật cao",
    description: "Bật xác thực 2FA",
    unlocked: false,
    progress: 0,
    color: "#10B981",
  },
  {
    id: "3",
    icon: "cart",
    title: "Người mua sắm",
    description: "Hoàn thành 10 đơn hàng",
    unlocked: false,
    progress: 30,
    color: "#6366F1",
  },
  {
    id: "4",
    icon: "chatbubbles",
    title: "Kết nối",
    description: "Nhắn tin với 5 người",
    unlocked: true,
    color: "#EC4899",
  },
  {
    id: "5",
    icon: "trophy",
    title: "VIP",
    description: "Chi tiêu trên 10 triệu",
    unlocked: false,
    progress: 65,
    color: "#F97316",
  },
];

const SOCIAL_LINKS: SocialLink[] = [
  { platform: "facebook", icon: "logo-facebook", color: "#1877F2" },
  { platform: "instagram", icon: "logo-instagram", color: "#E4405F" },
  { platform: "linkedin", icon: "logo-linkedin", color: "#0A66C2" },
  { platform: "twitter", icon: "logo-twitter", color: "#1DA1F2" },
];

// ============================================================================
// GUEST MODE SCREEN - Premium Design
// ============================================================================
const GuestScreen = memo(() => {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Gradient Background */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View
        style={[
          styles.guestContainer,
          {
            paddingTop: insets.top + 60,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo/Icon */}
        <View style={styles.guestLogoContainer}>
          <View style={styles.guestLogoRing}>
            <Ionicons name="person" size={48} color={COLORS.white} />
          </View>
          <View style={styles.guestLogoPulse} />
        </View>

        <Text style={styles.guestTitle}>Chào mừng bạn!</Text>
        <Text style={styles.guestSubtitle}>
          Đăng nhập để khám phá hàng ngàn{"\n"}sản phẩm và dịch vụ
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryButtonText}>Đăng nhập</Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={COLORS.gradientStart}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/(auth)/register")}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Tạo tài khoản mới</Text>
        </TouchableOpacity>

        {/* Social Login */}
        <View style={styles.socialLoginContainer}>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>hoặc tiếp tục với</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            {["logo-google", "logo-facebook", "logo-apple"].map(
              (icon, index) => (
                <TouchableOpacity
                  key={icon}
                  style={styles.socialButton}
                  activeOpacity={0.8}
                >
                  <Ionicons name={icon as any} size={24} color={COLORS.white} />
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
});

// ============================================================================
// PROFILE HEADER - Premium Gradient Design
// ============================================================================
const ProfileHeader = memo<{
  user: any;
  onAvatarPress: () => void;
  onQRPress: () => void;
  avatarUploading: boolean;
  uploadProgress: number;
  profileCompletion: number;
  badges: { messages: number; missedCalls: number; notifications: number };
}>(
  ({
    user,
    onAvatarPress,
    onQRPress,
    avatarUploading,
    uploadProgress,
    profileCompletion,
    badges,
  }) => {
    const insets = useSafeAreaInsets();
    const name = user?.name || user?.email?.split("@")[0] || "Người dùng";
    const email = user?.email || "";
    const isVerified = !!(user?.phone || user?.companyVerified);
    const totalBadges =
      badges.messages + badges.missedCalls + badges.notifications;

    return (
      <View style={styles.headerWrapper}>
        {/* Gradient Background */}
        <LinearGradient
          colors={[
            COLORS.gradientStart,
            COLORS.gradientMid,
            COLORS.gradientEnd,
          ]}
          style={[styles.headerGradient, { paddingTop: insets.top }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header Actions */}
          <View style={styles.headerTopBar}>
            <Text style={styles.headerTitle}>Hồ sơ</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => router.push("/notifications")}
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={COLORS.white}
                />
                {totalBadges > 0 && (
                  <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>
                      {totalBadges > 99 ? "99+" : totalBadges}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => router.push("/profile/settings")}
              >
                <Ionicons
                  name="settings-outline"
                  size={22}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfoContainer}>
            {/* Avatar with 3D Effect */}
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={onAvatarPress}
              disabled={avatarUploading}
              activeOpacity={0.9}
            >
              <View style={styles.avatar3DWrapper}>
                <View style={styles.avatarShadow} />
                <View style={styles.avatarRing}>
                  {user?.avatar ? (
                    <Image
                      source={{ uri: user.avatar }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {name[0].toUpperCase()}
                      </Text>
                    </View>
                  )}

                  {avatarUploading && (
                    <View style={styles.avatarOverlay}>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.uploadProgressText}>
                        {uploadProgress}%
                      </Text>
                    </View>
                  )}
                </View>

                {/* Camera Badge */}
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={12} color={COLORS.white} />
                </View>

                {/* Verified Badge */}
                {isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={COLORS.white}
                    />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* User Details */}
            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{name}</Text>
                {isVerified && (
                  <View style={styles.verifiedTag}>
                    <Ionicons
                      name="shield-checkmark"
                      size={12}
                      color={COLORS.white}
                    />
                    <Text style={styles.verifiedTagText}>Đã xác thực</Text>
                  </View>
                )}
              </View>
              <Text style={styles.userEmail}>{email}</Text>

              {/* Role & Level */}
              <View style={styles.userMeta}>
                <View style={styles.roleBadge}>
                  <Ionicons name="person" size={12} color={COLORS.white} />
                  <Text style={styles.roleText}>
                    {user?.role === "ADMIN"
                      ? "Admin"
                      : user?.role === "ENGINEER"
                        ? "Kỹ sư"
                        : "Khách hàng"}
                  </Text>
                </View>
                <View style={styles.levelBadge}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.levelText}>VIP</Text>
                </View>
              </View>
            </View>

            {/* QR Code Button */}
            <TouchableOpacity
              style={styles.qrButton}
              onPress={onQRPress}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Profile Completion Card - Floating */}
        {profileCompletion < 100 && (
          <View style={styles.completionCardWrapper}>
            <View style={styles.completionCard}>
              <View style={styles.completionLeft}>
                <View style={styles.completionCircle}>
                  <Text style={styles.completionPercent}>
                    {profileCompletion}%
                  </Text>
                </View>
              </View>
              <View style={styles.completionRight}>
                <Text style={styles.completionTitle}>Hoàn thiện hồ sơ</Text>
                <Text style={styles.completionDesc}>
                  Hoàn thành để nhận ưu đãi
                </Text>
                <View style={styles.completionBarBg}>
                  <View
                    style={[
                      styles.completionBarFill,
                      { width: `${profileCompletion}%` },
                    ]}
                  />
                </View>
              </View>
              <TouchableOpacity
                style={styles.completionBtn}
                onPress={() => router.push("/profile/edit")}
              >
                <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  },
);

// ============================================================================
// ACHIEVEMENTS SECTION - 3D Cards
// ============================================================================
const AchievementsSection = memo<{ achievements: Achievement[] }>(
  ({ achievements }) => {
    return (
      <View style={styles.achievementsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Thành tựu</Text>
          <TouchableOpacity
            onPress={() => router.push("/profile/achievements")}
          >
            <Text style={styles.sectionLink}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.achievementsScroll}
        >
          {achievements.map((achievement, index) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                !achievement.unlocked && styles.achievementCardLocked,
              ]}
            >
              <View
                style={[
                  styles.achievementIcon,
                  { backgroundColor: achievement.color + "20" },
                ]}
              >
                <Ionicons
                  name={achievement.icon as any}
                  size={24}
                  color={
                    achievement.unlocked ? achievement.color : COLORS.textMuted
                  }
                />
                {!achievement.unlocked && (
                  <View style={styles.achievementLock}>
                    <Ionicons
                      name="lock-closed"
                      size={10}
                      color={COLORS.white}
                    />
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.achievementTitle,
                  !achievement.unlocked && styles.achievementTitleLocked,
                ]}
              >
                {achievement.title}
              </Text>
              <Text style={styles.achievementDesc} numberOfLines={2}>
                {achievement.description}
              </Text>
              {achievement.progress !== undefined && !achievement.unlocked && (
                <View style={styles.achievementProgress}>
                  <View style={styles.achievementProgressBg}>
                    <View
                      style={[
                        styles.achievementProgressFill,
                        {
                          width: `${achievement.progress}%`,
                          backgroundColor: achievement.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.achievementProgressText}>
                    {achievement.progress}%
                  </Text>
                </View>
              )}
            </View>
          ))}
        </Animated.ScrollView>
      </View>
    );
  },
);

// ============================================================================
// STATS SECTION - 3D Card Effects
// ============================================================================
const StatsSection = memo<{ stats: UserStats; isLoading: boolean }>(
  ({ stats, isLoading }) => {
    const statItems = [
      {
        icon: "folder",
        value: stats.totalProjects,
        label: "Dự án",
        color: COLORS.info,
        gradient: ["#3B82F6", "#1D4ED8"],
      },
      {
        icon: "checkmark-done",
        value: stats.completedProjects,
        label: "Hoàn thành",
        color: COLORS.success,
        gradient: ["#10B981", "#059669"],
      },
      {
        icon: "cart",
        value: stats.totalOrders,
        label: "Đơn hàng",
        color: COLORS.warning,
        gradient: ["#F59E0B", "#D97706"],
      },
      {
        icon: "heart",
        value: stats.savedItems,
        label: "Yêu thích",
        color: COLORS.danger,
        gradient: ["#EF4444", "#DC2626"],
      },
    ];

    return (
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          {statItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.statCard}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <View style={styles.statSkeleton} />
              ) : (
                <>
                  <LinearGradient
                    colors={item.gradient as any}
                    style={styles.statIconBg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={COLORS.white}
                    />
                  </LinearGradient>
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  },
);

// ============================================================================
// QUICK ACTIONS - Premium Glass Cards
// ============================================================================
const QuickActions = memo<{
  badges: { messages: number; missedCalls: number; notifications: number };
}>(({ badges }) => {
  const actions = [
    {
      icon: "chatbubbles",
      label: "Tin nhắn",
      gradient: ["#0EA5E9", "#0284C7"],
      route: "/communications",
      badge: badges.messages,
    },
    {
      icon: "call",
      label: "Cuộc gọi",
      gradient: ["#10B981", "#059669"],
      route: "/call/history",
      badge: badges.missedCalls,
    },
    {
      icon: "people",
      label: "Danh bạ",
      gradient: ["#8B5CF6", "#7C3AED"],
      route: "/messages",
      badge: 0,
    },
    {
      icon: "notifications",
      label: "Thông báo",
      gradient: ["#F59E0B", "#D97706"],
      route: "/notifications",
      badge: badges.notifications,
    },
  ];

  return (
    <View style={styles.quickActionsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Liên lạc nhanh</Text>
      </View>
      <View style={styles.quickActionsRow}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickActionItem}
            onPress={() => router.push(action.route as any)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={action.gradient as any}
              style={styles.quickActionIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name={action.icon as any}
                size={24}
                color={COLORS.white}
              />
              {action.badge > 0 && (
                <View style={styles.quickActionBadge}>
                  <Text style={styles.quickActionBadgeText}>
                    {action.badge > 99 ? "99+" : action.badge}
                  </Text>
                </View>
              )}
            </LinearGradient>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

// ============================================================================
// SOCIAL LINKS SECTION
// ============================================================================
const SocialLinksSection = memo(() => {
  const handleSocialPress = (platform: string) => {
    Alert.alert("Liên kết", `Kết nối với ${platform}`, [
      { text: "Hủy", style: "cancel" },
      { text: "Kết nối", onPress: () => {} },
    ]);
  };

  return (
    <View style={styles.socialSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kết nối mạng xã hội</Text>
        <TouchableOpacity>
          <Text style={styles.sectionLink}>Quản lý</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.socialLinksRow}>
        {SOCIAL_LINKS.map((link) => (
          <TouchableOpacity
            key={link.platform}
            style={[
              styles.socialLinkBtn,
              { backgroundColor: link.color + "15" },
            ]}
            onPress={() => handleSocialPress(link.platform)}
            activeOpacity={0.8}
          >
            <Ionicons name={link.icon as any} size={22} color={link.color} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.socialAddBtn} activeOpacity={0.8}>
          <Ionicons name="add" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ============================================================================
// QR CODE MODAL
// ============================================================================
const QRCodeModal = memo<{
  visible: boolean;
  onClose: () => void;
  user: any;
}>(({ visible, onClose, user }) => {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Kết nối với tôi trên ứng dụng! ID: ${user?.id || "user123"}`,
        title: "Chia sẻ hồ sơ",
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.qrModalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.qrModalContent}>
          <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientEnd]}
            style={styles.qrModalHeader}
          >
            <Text style={styles.qrModalTitle}>Mã QR của tôi</Text>
            <TouchableOpacity style={styles.qrModalClose} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.qrCodeContainer}>
            <View style={styles.qrCodeWrapper}>
              {/* QR Code placeholder - would use actual QRCode component */}
              <View style={styles.qrCodePlaceholder}>
                <Ionicons name="qr-code" size={120} color={COLORS.primary} />
              </View>
            </View>
            <Text style={styles.qrUserName}>{user?.name || "Người dùng"}</Text>
            <Text style={styles.qrUserId}>ID: {user?.id || "user123"}</Text>
          </View>

          <View style={styles.qrActions}>
            <TouchableOpacity style={styles.qrActionBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color={COLORS.primary} />
              <Text style={styles.qrActionText}>Chia sẻ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qrActionBtn}>
              <Ionicons
                name="download-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.qrActionText}>Lưu ảnh</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

// ============================================================================
// MENU SECTION - Enhanced
// ============================================================================
const MenuSection = memo<{ title: string; items: MenuItem[] }>(
  ({ title, items }) => (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.menuCard}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index < items.length - 1 && styles.menuItemBorder,
            ]}
            onPress={
              item.action ||
              (item.route ? () => router.push(item.route as any) : undefined)
            }
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.menuIconBg,
                { backgroundColor: (item.color || COLORS.primary) + "15" },
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={item.color || COLORS.primary}
              />
            </View>
            <View style={styles.menuTextContainer}>
              <Text
                style={[
                  styles.menuTitle,
                  item.color === COLORS.danger && { color: COLORS.danger },
                ]}
              >
                {item.title}
              </Text>
              {item.subtitle && (
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              )}
            </View>
            <View style={styles.menuRight}>
              {item.badge !== undefined && (
                <View
                  style={[
                    styles.menuBadge,
                    { backgroundColor: item.color || COLORS.primary },
                  ]}
                >
                  <Text style={styles.menuBadgeText}>{item.badge}</Text>
                </View>
              )}
              <Ionicons
                name={(item.rightIcon || "chevron-forward") as any}
                size={18}
                color={COLORS.textLight}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ),
);

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function ProfileScreenEuropean() {
  const insets = useSafeAreaInsets();
  const { user, signOut, isAuthenticated, updateAvatar } = useAuth();
  const { badges, refreshAllBadges } = useUnifiedBadge();

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    totalProjects: 0,
    completedProjects: 0,
    totalOrders: 0,
    savedItems: 0,
  });

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fetch user stats
  const fetchUserStats = useCallback(async () => {
    try {
      const response = await apiFetch("/user/stats");
      if (response) {
        setUserStats({
          totalProjects: response.totalProjects || 12,
          completedProjects: response.completedProjects || 8,
          totalOrders: response.totalOrders || 23,
          savedItems: response.savedItems || 45,
        });
      }
    } catch (error) {
      // Fallback data
      setUserStats({
        totalProjects: 12,
        completedProjects: 8,
        totalOrders: 23,
        savedItems: 45,
      });
    }
  }, []);

  // Load data
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      fetchUserStats().finally(() => {
        setIsLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchUserStats]);

  // Profile completion
  const profileCompletion = useMemo(() => {
    let completed = 0;
    if (user?.name) completed++;
    if (user?.email) completed++;
    if (user?.phone) completed++;
    if (user?.avatar) completed++;
    if (user?.location?.address) completed++;
    return Math.round((completed / 5) * 100);
  }, [user]);

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUserStats(), refreshAllBadges()]);
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const handleAvatarUpload = () => {
    const options = ["Hủy", "Chụp ảnh", "Chọn từ thư viện"];
    if (user?.avatar) options.push("Xóa ảnh");

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 0,
          destructiveButtonIndex: options.length - 1,
          title: "Thay đổi ảnh đại diện",
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) await uploadFromCamera();
          else if (buttonIndex === 2) await uploadFromGallery();
          else if (buttonIndex === 3 && user?.avatar) await deleteAvatar();
        },
      );
    } else {
      Alert.alert("Thay đổi ảnh đại diện", "Chọn phương thức", [
        { text: "Hủy", style: "cancel" },
        { text: "Chụp ảnh", onPress: uploadFromCamera },
        { text: "Chọn từ thư viện", onPress: uploadFromGallery },
        ...(user?.avatar
          ? [
              {
                text: "Xóa ảnh",
                style: "destructive" as const,
                onPress: deleteAvatar,
              },
            ]
          : []),
      ]);
    }
  };

  const uploadFromCamera = async () => {
    try {
      setAvatarUploading(true);
      setUploadProgress(0);
      const result = await avatarService.pickAndUpload(
        "camera",
        { maxSizeMB: 2, compressQuality: 0.8 },
        (progress: AvatarUploadProgress) =>
          setUploadProgress(progress.percentage),
      );
      if (result.success && result.url) {
        await updateAvatar(result.url);
        Alert.alert("Thành công", "Đã cập nhật ảnh đại diện");
      } else if (result.error) {
        Alert.alert("Lỗi", result.error);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể chụp ảnh");
    } finally {
      setAvatarUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadFromGallery = async () => {
    try {
      setAvatarUploading(true);
      setUploadProgress(0);
      const result = await avatarService.pickAndUpload(
        "gallery",
        { maxSizeMB: 2, compressQuality: 0.8 },
        (progress: AvatarUploadProgress) =>
          setUploadProgress(progress.percentage),
      );
      if (result.success && result.url) {
        await updateAvatar(result.url);
        Alert.alert("Thành công", "Đã cập nhật ảnh đại diện");
      } else if (result.error) {
        Alert.alert("Lỗi", result.error);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể chọn ảnh");
    } finally {
      setAvatarUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteAvatar = async () => {
    Alert.alert("Xóa ảnh đại diện", "Bạn có chắc muốn xóa?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            setAvatarUploading(true);
            const result = await avatarService.delete();
            if (result.success) {
              await updateAvatar("");
              Alert.alert("Thành công", "Đã xóa ảnh đại diện");
            }
          } catch (error: any) {
            Alert.alert("Lỗi", error.message);
          } finally {
            setAvatarUploading(false);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Xóa tài khoản",
      "Hành động này không thể hoàn tác. Bạn có chắc?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch("/user/account", { method: "DELETE" });
              Alert.alert("Thành công", "Đã xóa tài khoản", [
                { text: "OK", onPress: () => signOut() },
              ]);
            } catch (error: any) {
              Alert.alert("Lỗi", error.detail || "Không thể xóa tài khoản");
            }
          },
        },
      ],
    );
  };

  // Guest mode
  if (!isAuthenticated) {
    return <GuestScreen />;
  }

  // Menu items - Premium style
  const accountMenuItems: MenuItem[] = [
    {
      icon: "person-outline",
      title: "Thông tin cá nhân",
      subtitle: "Cập nhật hồ sơ của bạn",
      route: "/profile/edit",
    },
    {
      icon: "phone-portrait-outline",
      title: "Xác thực số điện thoại",
      subtitle: user?.phone ? "Đã xác thực" : "Chưa xác thực",
      route: "/profile/verify-phone",
      color: user?.phone ? COLORS.success : COLORS.primary,
      badge: user?.phone ? "✓" : undefined,
    },
    {
      icon: "shield-outline",
      title: "Xác thực 2 bước (2FA)",
      subtitle: "Bảo mật tài khoản nâng cao",
      route: "/profile/security",
      color: COLORS.accent,
    },
    {
      icon: "key-outline",
      title: "Đổi mật khẩu",
      subtitle: "Bảo mật tài khoản",
      route: "/profile/change-password",
    },
    {
      icon: "finger-print-outline",
      title: "Đăng nhập sinh trắc học",
      subtitle: "Face ID / Vân tay",
      route: "/profile/biometric",
      color: COLORS.info,
    },
  ];

  const projectMenuItems: MenuItem[] = [
    {
      icon: "folder-open-outline",
      title: "Dự án của tôi",
      subtitle: `${userStats.totalProjects} dự án`,
      route: "/projects",
      badge: userStats.totalProjects,
      color: COLORS.info,
    },
    {
      icon: "heart-outline",
      title: "Yêu thích",
      subtitle: `${userStats.savedItems} mục đã lưu`,
      route: "/favorites",
      color: COLORS.danger,
    },
    {
      icon: "time-outline",
      title: "Lịch sử hoạt động",
      subtitle: "Xem hoạt động gần đây",
      route: "/profile/history",
    },
  ];

  const settingsMenuItems: MenuItem[] = [
    {
      icon: "people-outline",
      title: "Đồng bộ danh bạ",
      subtitle: "Tìm bạn bè trên ứng dụng",
      route: "/profile/contact-sync",
      color: COLORS.info,
    },
    {
      icon: "color-palette-outline",
      title: "Giao diện",
      subtitle: "Sáng / Tối / Tự động",
      route: "/profile/appearance",
    },
    {
      icon: "language-outline",
      title: "Ngôn ngữ",
      subtitle: "Tiếng Việt",
      route: "/profile/language",
    },
    {
      icon: "shield-checkmark-outline",
      title: "Quyền riêng tư",
      subtitle: "Quản lý dữ liệu",
      route: "/profile/privacy",
    },
  ];

  const supportMenuItems: MenuItem[] = [
    {
      icon: "help-circle-outline",
      title: "Trung tâm trợ giúp",
      subtitle: "FAQ & Hướng dẫn",
      route: "/help",
    },
    {
      icon: "chatbubble-ellipses-outline",
      title: "Liên hệ hỗ trợ",
      subtitle: "Chat với AI CSKH 24/7",
      route: "/ai-customer-support",
      color: COLORS.primary,
    },
    {
      icon: "document-text-outline",
      title: "Điều khoản & Chính sách",
      route: "/terms",
    },
    {
      icon: "star-outline",
      title: "Đánh giá ứng dụng",
      subtitle: "Cho chúng tôi 5 sao!",
      color: COLORS.warning,
    },
  ];

  const dangerMenuItems: MenuItem[] = [
    {
      icon: "trash-outline",
      title: "Xóa tài khoản",
      subtitle: "Xóa vĩnh viễn",
      action: handleDeleteAccount,
      color: COLORS.danger,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.white}
            progressViewOffset={100}
          />
        }
      >
        {/* Premium Gradient Header */}
        <ProfileHeader
          user={user}
          onAvatarPress={handleAvatarUpload}
          onQRPress={() => setShowQRModal(true)}
          avatarUploading={avatarUploading}
          uploadProgress={uploadProgress}
          profileCompletion={profileCompletion}
          badges={badges}
        />

        {/* Stats with 3D Cards */}
        <StatsSection stats={userStats} isLoading={isLoading} />

        {/* Quick Actions */}
        <QuickActions badges={badges} />

        {/* Achievements */}
        <AchievementsSection achievements={ACHIEVEMENTS} />

        {/* Social Links */}
        <SocialLinksSection />

        {/* Menu Sections */}
        <MenuSection title="Tài khoản & Bảo mật" items={accountMenuItems} />
        <MenuSection title="Dự án & Yêu thích" items={projectMenuItems} />
        <MenuSection title="Cài đặt" items={settingsMenuItems} />
        <MenuSection title="Hỗ trợ" items={supportMenuItems} />
        <MenuSection title="Nguy hiểm" items={dangerMenuItems} />

        {/* Sign Out Button */}
        <View style={styles.signOutContainer}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[COLORS.danger, "#DC2626"]}
              style={styles.signOutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
              <Text style={styles.signOutText}>Đăng xuất</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.versionText}>Phiên bản 2.0.0</Text>
          <Text style={styles.copyrightText}>
            © 2026 ThietKeResort. All rights reserved.
          </Text>
        </View>
      </Animated.ScrollView>

      {/* QR Code Modal */}
      <QRCodeModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        user={user}
      />
    </View>
  );
}

// ============================================================================
// STYLES - Premium European Design
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollView: {
    flex: 1,
  },

  // ==================== GUEST SCREEN ====================
  guestContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  guestLogoContainer: {
    position: "relative",
    marginBottom: 32,
  },
  guestLogoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  guestLogoPulse: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    top: -10,
    left: -10,
  },
  guestTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  guestSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.gradientStart,
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.white,
  },
  socialLoginContainer: {
    marginTop: 40,
    width: "100%",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginHorizontal: 16,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  // ==================== HEADER ====================
  headerWrapper: {
    position: "relative",
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: COLORS.gradientStart,
  },
  headerBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
  },
  profileInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Avatar 3D Effect
  avatarContainer: {
    position: "relative",
  },
  avatar3DWrapper: {
    position: "relative",
  },
  avatarShadow: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(0,0,0,0.2)",
    top: 8,
    left: 4,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: COLORS.white,
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.white,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadProgressText: {
    fontSize: 11,
    color: COLORS.white,
    marginTop: 4,
    fontWeight: "600",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  verifiedBadge: {
    position: "absolute",
    top: -4,
    right: -4,
  },

  // User Details
  userDetails: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.white,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  userMeta: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFD700",
  },
  qrButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Completion Card - Floating
  completionCardWrapper: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  completionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    ...SHADOWS.large,
  },
  completionLeft: {
    marginRight: 16,
  },
  completionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.warning + "15",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.warning,
  },
  completionPercent: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.warning,
  },
  completionRight: {
    flex: 1,
  },
  completionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  completionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  completionBarBg: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  completionBarFill: {
    height: "100%",
    backgroundColor: COLORS.warning,
    borderRadius: 3,
  },
  completionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  // ==================== STATS ====================
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    ...SHADOWS.medium,
  },
  statSkeleton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.border,
  },
  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: "500",
  },

  // ==================== ACHIEVEMENTS ====================
  achievementsSection: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  achievementsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  achievementCard: {
    width: 140,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    ...SHADOWS.small,
  },
  achievementCardLocked: {
    opacity: 0.7,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
  },
  achievementLock: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: COLORS.textSecondary,
  },
  achievementDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  achievementProgress: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  achievementProgressBg: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  achievementProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  achievementProgressText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  // ==================== QUICK ACTIONS ====================
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  quickActionsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    justifyContent: "space-around",
    ...SHADOWS.medium,
  },
  quickActionItem: {
    alignItems: "center",
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  quickActionBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
    paddingHorizontal: 5,
  },
  quickActionBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
  },

  // ==================== SOCIAL LINKS ====================
  socialSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  socialLinksRow: {
    flexDirection: "row",
    gap: 12,
  },
  socialLinkBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  socialAddBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.textMuted,
  },

  // ==================== MENU ====================
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: "hidden",
    ...SHADOWS.small,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: "center",
  },
  menuBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white,
  },

  // ==================== SIGN OUT ====================
  signOutContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  signOutButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  signOutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },

  // ==================== APP INFO ====================
  appInfo: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
  },
  versionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  copyrightText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },

  // ==================== QR MODAL ====================
  qrModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  qrModalContent: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    overflow: "hidden",
  },
  qrModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  qrModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  qrModalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  qrCodeContainer: {
    alignItems: "center",
    padding: 32,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    ...SHADOWS.medium,
  },
  qrCodePlaceholder: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg,
    borderRadius: 12,
  },
  qrUserName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 20,
  },
  qrUserId: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  qrActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  qrActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  qrActionText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },
});

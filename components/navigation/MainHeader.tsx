/**
 * MainHeader - Thanh header toàn cục cho toàn bộ ứng dụng
 * Phong cách Shopee/Zalo hiện đại với gradient, search bar, icons
 * @created 2025-01-15
 */

import { useAuth } from "@/context/AuthContext";
import { useUnifiedBadge } from "@/context/UnifiedBadgeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useCallback } from "react";
import {
    Animated,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ============================================================================
// THEME CONFIG
// ============================================================================
const COLORS = {
  // Gradient colors (Professional Blue-Black gradient)
  gradientStart: "#1a1a2e",
  gradientMiddle: "#16213e",
  gradientEnd: "#0f3460",

  // Accent colors
  primary: "#00D4FF",
  secondary: "#7B2CBF",
  accent: "#E94560",

  // Text colors
  white: "#FFFFFF",
  textLight: "rgba(255,255,255,0.85)",
  textMuted: "rgba(255,255,255,0.6)",

  // Badge colors
  badgeBg: "#E94560",
  badgeText: "#FFFFFF",

  // Search bar
  searchBg: "rgba(255,255,255,0.12)",
  searchPlaceholder: "rgba(255,255,255,0.5)",
  searchText: "#FFFFFF",
  searchBorder: "rgba(255,255,255,0.15)",
};

const SIZES = {
  headerHeight: 110,
  iconSize: 24,
  logoSize: 36,
  searchHeight: 40,
  badgeSize: 18,
  borderRadius: 12,
};

// ============================================================================
// TYPES
// ============================================================================
export interface MainHeaderProps {
  /** Hiển thị thanh search bar */
  showSearch?: boolean;
  /** Placeholder cho search bar */
  searchPlaceholder?: string;
  /** Callback khi nhấn search */
  onSearchPress?: () => void;
  /** Callback khi gõ search */
  onSearchChange?: (text: string) => void;
  /** Giá trị search */
  searchValue?: string;
  /** Hiển thị nút back thay vì logo */
  showBackButton?: boolean;
  /** Callback khi nhấn back */
  onBackPress?: () => void;
  /** Title thay thế logo */
  title?: string;
  /** Subtitle nhỏ dưới title */
  subtitle?: string;
  /** Ẩn notifications icon */
  hideNotifications?: boolean;
  /** Ẩn cart icon */
  hideCart?: boolean;
  /** Ẩn chat icon */
  hideChat?: boolean;
  /** Custom right slot */
  rightSlot?: React.ReactNode;
  /** Transparent mode (không gradient) */
  transparent?: boolean;
  /** Style thêm cho container */
  style?: object;
}

// ============================================================================
// MAIN HEADER COMPONENT
// ============================================================================
export const MainHeader = memo(function MainHeader({
  showSearch = true,
  searchPlaceholder = "Tìm kiếm dịch vụ, sản phẩm...",
  onSearchPress,
  onSearchChange,
  searchValue = "",
  showBackButton = false,
  onBackPress,
  title,
  subtitle,
  hideNotifications = false,
  hideCart = false,
  hideChat = false,
  rightSlot,
  transparent = false,
  style,
}: MainHeaderProps) {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const { badges, totalBadge } = useUnifiedBadge();

  // Get badge counts
  const notificationCount = badges.notifications;
  const cartCount = badges.orders;

  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const animatePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    animatePress();
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  }, [onBackPress, animatePress]);

  const handleSearchPress = useCallback(() => {
    animatePress();
    if (onSearchPress) {
      onSearchPress();
    } else {
      router.push("/search" as any);
    }
  }, [onSearchPress, animatePress]);

  const handleNotificationsPress = useCallback(() => {
    animatePress();
    router.push("/(tabs)/notifications" as any);
  }, [animatePress]);

  const handleCartPress = useCallback(() => {
    animatePress();
    router.push("/cart" as any);
  }, [animatePress]);

  const handleChatPress = useCallback(() => {
    animatePress();
    router.push("/(tabs)/messages" as any);
  }, [animatePress]);

  const handleProfilePress = useCallback(() => {
    animatePress();
    if (isAuthenticated) {
      router.push("/(tabs)/profile" as any);
    } else {
      router.push("/(auth)/login" as any);
    }
  }, [isAuthenticated, animatePress]);

  // Render badge
  const renderBadge = (count: number) => {
    if (count <= 0) return null;
    return (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
      </View>
    );
  };

  // Render icon button
  const renderIconButton = (
    iconName: keyof typeof Ionicons.glyphMap,
    onPress: () => void,
    badgeCount?: number,
    accessibilityLabel?: string,
  ) => (
    <TouchableOpacity
      style={styles.iconButton}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name={iconName} size={SIZES.iconSize} color={COLORS.white} />
      {badgeCount !== undefined && renderBadge(badgeCount)}
    </TouchableOpacity>
  );

  // Header content
  const headerContent = (
    <View style={[styles.container, { paddingTop: insets.top + 8 }, style]}>
      {/* Top Row: Logo/Back + Icons */}
      <View style={styles.topRow}>
        {/* Left Side: Logo or Back Button */}
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={28} color={COLORS.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.logoContainer}
              onPress={handleProfilePress}
              activeOpacity={0.8}
            >
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.brandText}>
                <Text style={styles.brandName}>DESIGN BUILD</Text>
                <Text style={styles.brandTagline}>Thiết kế & Xây dựng</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Title if provided */}
          {title && (
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Right Side: Icons */}
        <View style={styles.rightSection}>
          {rightSlot || (
            <>
              {/* Chat */}
              {!hideChat &&
                renderIconButton(
                  "chatbubble-ellipses-outline",
                  handleChatPress,
                  0,
                  "Tin nhắn",
                )}

              {/* Notifications */}
              {!hideNotifications &&
                renderIconButton(
                  "notifications-outline",
                  handleNotificationsPress,
                  notificationCount,
                  "Thông báo",
                )}

              {/* Cart */}
              {!hideCart &&
                renderIconButton(
                  "cart-outline",
                  handleCartPress,
                  cartCount,
                  "Giỏ hàng",
                )}
            </>
          )}
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <Pressable style={styles.searchContainer} onPress={handleSearchPress}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color={COLORS.searchPlaceholder}
              style={styles.searchIcon}
            />
            {onSearchChange ? (
              <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                placeholderTextColor={COLORS.searchPlaceholder}
                value={searchValue}
                onChangeText={onSearchChange}
                returnKeyType="search"
              />
            ) : (
              <Text style={styles.searchPlaceholder}>{searchPlaceholder}</Text>
            )}
            <TouchableOpacity
              style={styles.voiceButton}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <Ionicons
                name="mic-outline"
                size={20}
                color={COLORS.searchPlaceholder}
              />
            </TouchableOpacity>
          </View>
        </Pressable>
      )}
    </View>
  );

  // Render with gradient or transparent
  if (transparent) {
    return (
      <View style={[styles.transparentContainer, { paddingTop: insets.top }]}>
        {headerContent}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {headerContent}
    </LinearGradient>
  );
});

// ============================================================================
// COMPACT HEADER (for sub-screens)
// ============================================================================
export interface CompactHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightSlot?: React.ReactNode;
  transparent?: boolean;
}

export const CompactHeader = memo(function CompactHeader({
  title,
  subtitle,
  onBackPress,
  rightSlot,
  transparent = false,
}: CompactHeaderProps) {
  const insets = useSafeAreaInsets();

  const handleBack = useCallback(() => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  }, [onBackPress]);

  const content = (
    <View style={[styles.compactContainer, { paddingTop: insets.top + 8 }]}>
      <View style={styles.compactRow}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.compactBackButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={26} color={COLORS.white} />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.compactTitleContainer}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.compactSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Slot */}
        <View style={styles.compactRightSlot}>{rightSlot}</View>
      </View>
    </View>
  );

  if (transparent) {
    return (
      <View style={[styles.transparentContainer, { paddingTop: insets.top }]}>
        {content}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.compactGradient}
    >
      {content}
    </LinearGradient>
  );
});

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  // Main Header
  gradient: {
    width: "100%",
  },
  transparentContainer: {
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  // Logo
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: SIZES.logoSize,
    height: SIZES.logoSize,
    borderRadius: SIZES.logoSize / 2,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  brandText: {
    marginLeft: 10,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
    letterSpacing: 0.3,
  },

  // Back Button
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  // Title
  titleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Icon Buttons
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    marginLeft: 2,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: SIZES.badgeSize,
    height: SIZES.badgeSize,
    borderRadius: SIZES.badgeSize / 2,
    backgroundColor: COLORS.badgeBg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.gradientMiddle,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.badgeText,
  },

  // Search Bar
  searchContainer: {
    width: "100%",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.searchBg,
    borderRadius: SIZES.borderRadius,
    height: SIZES.searchHeight,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.searchBorder,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.searchText,
    paddingVertical: 0,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: COLORS.searchPlaceholder,
  },
  voiceButton: {
    padding: 6,
    marginLeft: 8,
  },

  // Compact Header
  compactGradient: {
    width: "100%",
  },
  compactContainer: {
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  compactTitleContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
  },
  compactSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  compactRightSlot: {
    minWidth: 44,
    alignItems: "flex-end",
  },
});

export default MainHeader;
